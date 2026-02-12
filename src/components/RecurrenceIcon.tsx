import { Group, Text } from '@mantine/core';
import { IconRepeat } from '@tabler/icons-react';
import { formatServiceIntervalLabel } from '../utils/serviceRecurrence';

interface RecurrenceDisplayProps {
    interval: string;
    size?: 'xs' | 'sm' | 'md';
    color?: string;
}

export function RecurrenceDisplay({ interval, size = 'xs', color = 'dimmed' }: RecurrenceDisplayProps) {
    const displayValue = formatServiceIntervalLabel(interval);
    const isRecurring = displayValue.toLowerCase().startsWith('every') || displayValue.includes('Monthly');

    if (!isRecurring) {
        return <Text size={size} c={color}>{displayValue}</Text>;
    }

    return (
        <Group gap={4} wrap="nowrap">
            <IconRepeat size={size === 'xs' ? 12 : 14} style={{ opacity: 0.7 }} />
            <Text size={size} c={color}>
                {displayValue}
            </Text>
        </Group>
    );
}
