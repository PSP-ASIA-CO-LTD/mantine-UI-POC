import { Text } from '@mantine/core';

export function CompanySettingsLoading() {
    return <Text size="sm" c="dimmed">Loading company settings...</Text>;
}

export function CompanySettingsEmpty() {
    return <Text size="sm" c="dimmed">No company settings found.</Text>;
}

