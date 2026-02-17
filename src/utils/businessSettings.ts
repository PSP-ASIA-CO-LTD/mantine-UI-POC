export interface BusinessSettings {
    /**
     * Deposit policy in "months".
     * Used to calculate invoice deposit as \(months × monthly rate\).
     */
    depositMonths: number;
}

const STORAGE_KEY = 'bourbon44_business_settings';

export const DEFAULT_BUSINESS_SETTINGS: BusinessSettings = {
    depositMonths: 1,
};

export function getBusinessSettings(): BusinessSettings {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return { ...DEFAULT_BUSINESS_SETTINGS };
        const parsed = JSON.parse(raw) as Partial<BusinessSettings>;

        const depositMonthsRaw = Number((parsed as any).depositMonths);
        const depositMonths = Number.isFinite(depositMonthsRaw) ? Math.max(0, Math.floor(depositMonthsRaw)) : DEFAULT_BUSINESS_SETTINGS.depositMonths;

        return {
            ...DEFAULT_BUSINESS_SETTINGS,
            ...parsed,
            depositMonths,
        };
    } catch {
        return { ...DEFAULT_BUSINESS_SETTINGS };
    }
}

export function saveBusinessSettings(partial: Partial<BusinessSettings>) {
    const current = getBusinessSettings();
    const next: BusinessSettings = {
        ...current,
        ...partial,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

