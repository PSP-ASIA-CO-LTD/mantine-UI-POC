import { Box, Stack, Title, Text, Button, Divider, Group, ActionIcon } from '@mantine/core';
import { IconPlus, IconDownload, IconBell } from '@tabler/icons-react';
import { PageHeader } from '../components/PageHeader';
import { SearchInput } from '../components/EditableFields';

export function UiLayout() {
    return (
        <Stack gap="xl" py="xl">
            <Box px="md">
                <Title order={2}>Layout Elements</Title>
                <Text c="dimmed" size="sm">Systematic layout components for consistent page structure.</Text>
            </Box>

            <Divider label="Page Header" labelPosition="center" />

            <Stack gap="xl">
                <div>
                    <Box px="md" mb="xs">
                        <Title order={4}>1. Standard Page Header (Default)</Title>
                        <Text size="xs" c="dimmed">No background, no border, stretches edge-to-edge. Subtitle below title. Includes headroom.</Text>
                    </Box>
                    <PageHeader 
                        title="Sales Dashboard" 
                        actions={
                            <Group gap="xs">
                                <ActionIcon variant="light" size="lg" radius="md">
                                    <IconBell size={20} />
                                </ActionIcon>
                                <Button leftSection={<IconPlus size={16} />}>Create New</Button>
                            </Group>
                        }
                    />
                    <Box px="md">
                        <Text size="sm" c="dimmed">Page content follows below the header...</Text>
                    </Box>
                </div>

                <div>
                    <Box px="md" mb="xs">
                        <Title order={4}>2. Table Display Group Root</Title>
                        <Text size="xs" c="dimmed">Content-level header with search bar on the right.</Text>
                    </Box>
                    <PageHeader 
                        title="Patient" 
                        subtitle="Residents management"
                    />
                    
                    <Box px="md" mt="xl">
                        <Group justify="space-between" mb="md">
                            <Text fw={600} size="lg">Residents (6)</Text>
                            <SearchInput
                                placeholder="Search resident..."
                                style={{ width: 280 }}
                            />
                        </Group>
                        
                        <Box style={{ height: '100px', background: 'var(--mantine-color-gray-0)', borderRadius: 'var(--mantine-radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Text c="dimmed" size="sm">Table Content Area</Text>
                        </Box>
                    </Box>
                </div>

                <div>
                    <Box px="md" mb="xs">
                        <Title order={4}>3. Sticky Header</Title>
                        <Text size="xs" c="dimmed">For long scrolling pages. A floating bar with white background, border, and generous internal padding.</Text>
                    </Box>
                    <Box style={{ minHeight: '150px' }}>
                        <PageHeader 
                            title="Report Details" 
                            actions={
                                <Button variant="outline" leftSection={<IconDownload size={16} />}>Export</Button>
                            }
                            transparent={false}
                            withBorder={true}
                        />
                        <Box px="md">
                            <Text size="sm" c="dimmed">Content scrolls underneath the sticky header which sits within the page padding.</Text>
                        </Box>
                    </Box>
                </div>
            </Stack>
        </Stack>
    );
}
