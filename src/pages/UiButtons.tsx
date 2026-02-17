import { Group, Stack, Text, Title } from '@mantine/core';
import { AlternateButton } from '../components/AlternateButton';
import { PrimaryButton } from '../components/PrimaryButton';

export function UiButtons() {
    return (
        <Stack gap="md">
            <div>
                <Title order={2}>Buttons</Title>
                <Text size="sm" c="dimmed">
                    Primary button (layered CSS + small JS for blob motion)
                </Text>
            </div>

            <Group gap="sm">
                <PrimaryButton>Primary</PrimaryButton>
                <AlternateButton>Alternate</AlternateButton>
                <PrimaryButton disabled>Disabled</PrimaryButton>
            </Group>
        </Stack>
    );
}
