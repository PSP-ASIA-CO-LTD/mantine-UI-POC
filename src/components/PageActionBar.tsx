import type { ReactNode } from 'react';
import { Group, Paper } from '@mantine/core';
import './PageActionBar.css';

type PageActionBarProps = {
    left: ReactNode;
    right?: ReactNode;
    className?: string;
};

export function PageActionBar({ left, right, className }: PageActionBarProps) {
    const classes = ['page-actionbar', 'no-print', className].filter(Boolean).join(' ');

    return (
        <Paper withBorder p="sm" className={classes}>
            <Group justify="space-between" gap="sm">
                <Group gap="sm">{left}</Group>
                {right ? (
                    <Group gap="sm" className="page-actionbar__right">
                        {right}
                    </Group>
                ) : null}
            </Group>
        </Paper>
    );
}

