import type { ReactNode } from 'react';
import { Title, Text, Stack } from '@mantine/core';
import { PageActionBar } from './PageActionBar';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    actions?: ReactNode;
    transparent?: boolean;
    withBorder?: boolean;
}

export function PageHeader({ title, subtitle, actions, transparent = true, withBorder = false }: PageHeaderProps) {
    return (
        <PageActionBar
            transparent={transparent}
            withBorder={withBorder}
            left={
                subtitle ? (
                    <Stack gap={0}>
                        <Title order={2} className="h3 mb-1">
                            {title}
                        </Title>
                        <Text size="sm" c="dimmed" className="text-body-secondary mb-0">
                            {subtitle}
                        </Text>
                    </Stack>
                ) : (
                    <Title order={2} className="h3 mb-0">
                        {title}
                    </Title>
                )
            }
            right={actions}
        />
    );
}
