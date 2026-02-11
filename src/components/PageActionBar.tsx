import type { ReactNode } from 'react';
import { Group, Paper, Box } from '@mantine/core';
import './PageActionBar.css';

type PageActionBarProps = {
    left: ReactNode;
    right?: ReactNode;
    className?: string;
    transparent?: boolean;
    withBorder?: boolean;
};

export function PageActionBar({ left, right, className, transparent, withBorder = true }: PageActionBarProps) {
    const classes = [
        'page-actionbar', 
        transparent ? 'page-actionbar--transparent' : 'page-actionbar--sticky',
        !withBorder ? 'page-actionbar--no-border' : '',
        'no-print', 
        className
    ].filter(Boolean).join(' ');

    if (transparent) {
        return (
            <Box className={classes}>
                <Group justify="space-between" align="center" gap="sm">
                    <Group gap="md">
                        {left}
                    </Group>
                    {right ? (
                        <Group gap="sm" className="page-actionbar__right">
                            {right}
                        </Group>
                    ) : null}
                </Group>
            </Box>
        );
    }

    return (
        <Paper 
            withBorder={false} /* Border handled by CSS */
            className={classes}
        >
            <Group justify="space-between" align="center" gap="sm">
                <Group gap="md">
                    {left}
                </Group>
                {right ? (
                    <Group gap="sm" className="page-actionbar__right">
                        {right}
                    </Group>
                ) : null}
            </Group>
        </Paper>
    );
}

