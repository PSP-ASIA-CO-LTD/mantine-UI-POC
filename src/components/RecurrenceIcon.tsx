import { Group, Text } from '@mantine/core';
import { IconRepeat } from '@tabler/icons-react';

interface RecurrenceDisplayProps {
    interval: string;
    size?: 'xs' | 'sm' | 'md';
    color?: string;
}

export function RecurrenceDisplay({ interval, size = 'xs', color = 'dimmed' }: RecurrenceDisplayProps) {
    const isRecurring = interval.toLowerCase().startsWith('every');
    
    if (!isRecurring) {
        return (
            <Text size={size} c={color}>
                {interval}
            </Text>
        );
    }

    // Replace "Every" (case insensitive) with the icon
    const displayValue = interval.replace(/^[Ee]very\s+/, '');

    return (
        <Group gap={4} wrap="nowrap">
            <IconRepeat size={size === 'xs' ? 12 : 14} style={{ opacity: 0.7 }} />
            <Text size={size} c={color}>
                {displayValue}
            </Text>
        </Group>
    );
}
