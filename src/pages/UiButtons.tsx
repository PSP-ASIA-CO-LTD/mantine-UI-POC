import { Group, Stack, Text, Title } from '@mantine/core';
import { AlternateButton } from '../components/AlternateButton';
import { PrimaryButton } from '../components/PrimaryButton';
import { TokenStatePalette, type TokenGroup } from '../components/TokenStatePalette';

const buttonTokenGroups: TokenGroup[] = [
    {
        title: 'Primary Button Accents',
        source: 'src/components/Button.scss (set on .button element)',
        tokens: [
            { token: '--button-accent-1', label: 'Blob accent 1 (RGB)', state: 'hover' },
            { token: '--button-accent-2', label: 'Blob accent 2 (RGB)', state: 'hover' },
            { token: '--button-accent-3', label: 'Blob accent 3 (RGB)', state: 'hover' },
            { token: '--button-accent-4', label: 'Blob accent 4 (RGB)', state: 'hover' },
            { token: '--button-accent-5', label: 'Blob accent 5 (RGB)', state: 'hover' },
            { token: '--button-accent-6', label: 'Blob accent 6 (RGB)', state: 'hover' },
        ],
    },
    {
        title: 'Mantine References',
        source: 'Mantine theme',
        tokens: [
            { token: '--mantine-color-black', label: 'Primary button base bg', state: 'default' },
            { token: '--mantine-color-white', label: 'Primary button text', state: 'default' },
            { token: '--mantine-color-gray-1', label: 'Alternate button bg', state: 'default' },
            { token: '--mantine-color-dark-2', label: 'Disabled button bg', state: 'disabled' },
            { token: '--mantine-color-dark-3', label: 'Alternate button text', state: 'default' },
        ],
    },
];

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

            <TokenStatePalette groups={buttonTokenGroups} />
        </Stack>
    );
}
