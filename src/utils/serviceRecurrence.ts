const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export type ServiceRecurrence =
    | { kind: 'weekly'; days: number[] }
    | { kind: 'monthly'; day: number };

const sanitizeDays = (days: number[]) =>
    [...new Set(days.filter((day) => Number.isInteger(day) && day >= 0 && day <= 6))].sort((a, b) => a - b);

export const getWeekdayLabels = () => WEEKDAY_LABELS.slice();

export const parseServiceInterval = (interval: string): ServiceRecurrence | null => {
    const raw = String(interval || '').trim();
    if (!raw) return null;

    if (raw.toLowerCase() === 'daily') {
        return { kind: 'weekly', days: [0, 1, 2, 3, 4, 5, 6] };
    }

    if (raw.startsWith('WEEKLY:')) {
        const days = sanitizeDays(
            raw
                .slice('WEEKLY:'.length)
                .split(',')
                .map((item) => Number.parseInt(item.trim(), 10)),
        );
        return days.length > 0 ? { kind: 'weekly', days } : null;
    }

    if (raw.startsWith('MONTHLY:')) {
        const day = Number.parseInt(raw.slice('MONTHLY:'.length).trim(), 10);
        if (Number.isInteger(day) && day >= 1 && day <= 31) {
            return { kind: 'monthly', day };
        }
        return null;
    }

    if (raw.toLowerCase().startsWith('every ')) {
        const days = Number.parseInt(raw.match(/\d+/)?.[0] || '0', 10);
        if (days > 0) {
            return null;
        }
    }

    return null;
};

export const formatServiceInterval = (recurrence: ServiceRecurrence): string => {
    if (recurrence.kind === 'weekly') {
        const days = sanitizeDays(recurrence.days);
        return `WEEKLY:${days.join(',')}`;
    }
    return `MONTHLY:${Math.min(31, Math.max(1, Math.trunc(recurrence.day)))}`;
};

export const formatServiceIntervalLabel = (interval: string): string => {
    const parsed = parseServiceInterval(interval);
    if (parsed?.kind === 'weekly') {
        if (parsed.days.length === 7) return 'Every day';
        if (parsed.days.length === 0) return 'Weekly';
        return parsed.days.map((day) => WEEKDAY_LABELS[day]).join(', ');
    }
    if (parsed?.kind === 'monthly') {
        return `Monthly • Day ${parsed.day}`;
    }
    return interval;
};

export const formatMonthlyFallbackLabel = (day: number): string =>
    day >= 29 ? `Day ${day} (or last day)` : `Day ${day}`;

export const shouldScheduleServiceOnDate = (
    interval: string,
    currentDate: Date,
    checkInDate: Date,
): boolean => {
    const parsed = parseServiceInterval(interval);
    if (parsed?.kind === 'weekly') {
        return parsed.days.includes(currentDate.getDay());
    }
    if (parsed?.kind === 'monthly') {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const lastDay = new Date(year, month + 1, 0).getDate();
        const targetDay = Math.min(parsed.day, lastDay);
        return currentDate.getDate() === targetDay;
    }

    const raw = String(interval || '').trim().toLowerCase();
    if (raw === 'daily') return true;
    if (raw.startsWith('every')) {
        const days = Number.parseInt(raw.match(/\d+/)?.[0] || '1', 10);
        const diffDays = Math.floor((currentDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
        return days > 0 ? diffDays % days === 0 : true;
    }
    return true;
};
