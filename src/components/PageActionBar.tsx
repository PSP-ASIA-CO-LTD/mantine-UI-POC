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
        'd-flex',
        'flex-column',
        'gap-2',
        transparent ? 'page-actionbar--transparent' : 'page-actionbar--sticky',
        !withBorder ? 'page-actionbar--no-border' : '',
        'no-print', 
        className
    ].filter(Boolean).join(' ');

    if (transparent) {
        return (
            <Box className={classes}>
                <Group justify="space-between" align="center" gap="sm" className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                    <Group gap="md" className="d-flex align-items-center gap-3">
                        {left}
                    </Group>
                    {right ? (
                        <Group gap="sm" className="page-actionbar__right d-flex flex-wrap align-items-center gap-2">
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
            <Group justify="space-between" align="center" gap="sm" className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                <Group gap="md" className="d-flex align-items-center gap-3">
                    {left}
                </Group>
                {right ? (
                    <Group gap="sm" className="page-actionbar__right d-flex flex-wrap align-items-center gap-2">
                        {right}
                    </Group>
                ) : null}
            </Group>
        </Paper>
    );
}
