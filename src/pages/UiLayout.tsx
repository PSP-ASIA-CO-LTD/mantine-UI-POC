import { Box, Stack, Title, Text, Button, Divider, Group, ActionIcon } from '@mantine/core';
import { IconPlus, IconDownload, IconBell } from '@tabler/icons-react';
import { PageHeader } from '../components/PageHeader';
import { SearchInput } from '../components/EditableFields';
import { TokenStatePalette, type TokenGroup } from '../components/TokenStatePalette';

const layoutTokenGroups: TokenGroup[] = [
    {
        title: 'Page Chrome',
        source: 'Bootstrap / Mantine',
        tokens: [
            { token: '--bs-body-bg', label: 'Page background' },
            { token: '--bs-body-color', label: 'Page text' },
            { token: '--bs-border-color', label: 'Borders & dividers' },
            { token: '--bs-emphasis-color', label: 'Heading emphasis' },
            { token: '--bs-secondary-color', label: 'Subtitle / dimmed text' },
            { token: '--bs-secondary-bg', label: 'Surface background' },
            { token: '--bs-tertiary-bg', label: 'Lighter surface' },
        ],
    },
    {
        title: 'Mantine Layout',
        source: 'Mantine theme',
        tokens: [
            { token: '--mantine-color-gray-0', label: 'Gray-0 (empty area fill)' },
            { token: '--mantine-color-gray-1', label: 'Gray-1' },
            { token: '--mantine-color-gray-3', label: 'Gray-3 (subtle border)' },
            { token: '--mantine-color-default-border', label: 'Default component border' },
        ],
    },
];

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
                                classNames={{ wrapper: 'ds-showcase-search-field' }}
                            />
                        </Group>
                        
                        <Box className="ds-showcase-placeholder">
                            <Text c="dimmed" size="sm">Table Content Area</Text>
                        </Box>
                    </Box>
                </div>

                <div>
                    <Box px="md" mb="xs">
                        <Title order={4}>3. Sticky Header</Title>
                        <Text size="xs" c="dimmed">For long scrolling pages. A floating bar with white background, border, and generous internal padding.</Text>
                    </Box>
                    <Box className="ds-showcase-sticky-shell">
                        <PageHeader 
                            title="Report Details" 
                            actions={
                                <Button variant="outline" leftSection={<IconDownload size={16} />}>Export</Button>
                            }
                            transparent={false}
                            withBorder={true}
                        />
                        <Box px="md" pt="md">
                            <Text size="sm" c="dimmed">Content scrolls underneath the sticky header which sits within the page padding.</Text>
                        </Box>
                    </Box>
                </div>

                <div>
                    <Box px="md" mb="xs">
                        <Title order={4}>4. Centered Setup Shell</Title>
                        <Text size="xs" c="dimmed">The business setup flow uses a centered shell, tokenized progress meta, and a split form card. This preview now lives in the layout showcase instead of only existing on the live route.</Text>
                    </Box>
                    <div className="business-setup-shell">
                        <div className="business-setup-shell__inner">
                            <div className="business-setup-shell__header">
                                <Title order={3} mb="xs">Business Setup</Title>
                                <Text c="dimmed" size="sm">Centered shell with DS spacing and split panes.</Text>
                            </div>
                            <div className="business-setup-shell__progress">
                                <div className="ds-showcase-progress-meta">
                                    <Text size="xs" c="dimmed">Step 1 of 2</Text>
                                    <Text size="xs" c="dimmed">50% Complete</Text>
                                </div>
                                <div className="progress" role="presentation" aria-hidden="true">
                                    <div className="progress-bar business-setup-shell__progress-bar" />
                                </div>
                            </div>
                            <div className="card shadow-sm border-0">
                                <div className="business-setup-split">
                                    <div className="business-setup-pane">
                                        <Title order={5} mb="sm">Business Information</Title>
                                        <div className="ds-showcase-placeholder">
                                            <Text c="dimmed" size="sm">Primary form pane</Text>
                                        </div>
                                    </div>
                                    <div className="business-setup-pane business-setup-pane--contrast">
                                        <Title order={5} mb="sm">Owner Account</Title>
                                        <div className="ds-showcase-placeholder">
                                            <Text c="dimmed" size="sm">Secondary contrast pane</Text>
                                        </div>
                                    </div>
                                </div>
                                <div className="business-setup-footer">
                                    <Button variant="subtle" color="gray">Exit</Button>
                                    <Button>Continue</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <Box px="md" mb="xs">
                        <Title order={4}>5. Operations Stats Grid</Title>
                        <Text size="xs" c="dimmed">Dashboard cards are now represented in the layout showcase with the same grid treatment used by operations surfaces.</Text>
                    </Box>
                    <Box px="md">
                        <div className="stats-grid">
                            {[
                                ['Occupancy', '91%'],
                                ['Pending Tasks', '7'],
                                ['Total Staff', '24'],
                                ['New Purchases', '3'],
                            ].map(([label, value]) => (
                                <div key={label} className="card shadow-sm stat-card">
                                    <div className="card-body">
                                        <Text size="sm" c="dimmed">{label}</Text>
                                        <Text size="xl" fw={700}>{value}</Text>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Box>
                </div>
            </Stack>

            <Box px="md">
                <TokenStatePalette groups={layoutTokenGroups} />
            </Box>
        </Stack>
    );
}
