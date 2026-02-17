import type { AdditionalServices, InvoiceItem, Package, Room } from '../types';

export function calculateAdjustedPackagePrice(pkg: Package, days: number) {
    const basePrice = pkg.price;
    const baseDays = pkg.duration;
    const extraDays = Math.max(0, days - baseDays);
    const dailyRate = basePrice / baseDays;
    return basePrice + (extraDays * dailyRate);
}

export function buildInvoiceItems(params: {
    pkg: Package;
    adjustedDays: number;
    room: Room | null;
    additionalServices: AdditionalServices;
    depositMonths: number;
    monthDays?: number;
}) {
    const { pkg, adjustedDays, room, additionalServices, depositMonths } = params;
    const monthDays = params.monthDays ?? 30;

    const days = Math.max(0, adjustedDays);
    const packageSubtotal = days > 0 ? calculateAdjustedPackagePrice(pkg, days) : 0;

    const items: InvoiceItem[] = [];

    items.push({
        description: `${pkg.name} (${days} days)`,
        quantity: 1,
        unitPrice: packageSubtotal,
        total: packageSubtotal,
    });

    if (room && days > 0) {
        const roomTotal = room.pricePerDay * days;
        items.push({
            description: `Room ${room.number} (${room.type})`,
            quantity: 1,
            unitPrice: roomTotal,
            total: roomTotal,
        });
    }

    // Additional bed
    if (additionalServices.additionalBed && days > 0) {
        const bedTotal = 500 * days;
        items.push({
            description: `Additional Bed (${days} days)`,
            quantity: 1,
            unitPrice: bedTotal,
            total: bedTotal,
        });
    }

    // Paid amenities
    if (days > 0) {
        for (const amenity of additionalServices.specialAmenities) {
            const perDay = amenity === 'oxygen_concentrator'
                ? 300
                : amenity === 'air_mattress'
                    ? 200
                    : 0;
            if (perDay <= 0) continue;

            const amenityTotal = perDay * days;
            const label = amenity === 'oxygen_concentrator'
                ? 'Oxygen Concentrator'
                : amenity === 'air_mattress'
                    ? 'Air Mattress'
                    : amenity;

            items.push({
                description: `${label} (${days} days)`,
                quantity: 1,
                unitPrice: amenityTotal,
                total: amenityTotal,
            });
        }
    }

    // Deposit is calculated from "months" of the current daily total
    const safeDepositMonths = Number.isFinite(depositMonths) ? Math.max(0, Math.floor(depositMonths)) : 0;
    if (safeDepositMonths > 0 && days > 0) {
        const perDayTotal =
            (packageSubtotal / days) +
            (room ? room.pricePerDay : 0) +
            (additionalServices.additionalBed ? 500 : 0) +
            additionalServices.specialAmenities.reduce((sum, a) => {
                if (a === 'oxygen_concentrator') return sum + 300;
                if (a === 'air_mattress') return sum + 200;
                return sum;
            }, 0);

        const depositTotal = Math.round(perDayTotal * monthDays * safeDepositMonths);
        if (depositTotal > 0) {
            items.push({
                description: `Deposit (+${safeDepositMonths} month${safeDepositMonths > 1 ? 's' : ''})`,
                quantity: 1,
                unitPrice: depositTotal,
                total: depositTotal,
            });
        }
    }

    return sortDepositLast(items);
}

export function sortDepositLast(items: InvoiceItem[]) {
    const depositItems: InvoiceItem[] = [];
    const otherItems: InvoiceItem[] = [];

    for (const item of items) {
        if (item.description.toLowerCase().startsWith('deposit')) depositItems.push(item);
        else otherItems.push(item);
    }

    return [...otherItems, ...depositItems];
}

export function calculateInvoiceTotals(items: InvoiceItem[]) {
    const subtotal = items.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
    const tax = Math.round(subtotal * 0.07);
    const total = subtotal + tax;
    return { subtotal, tax, total };
}

