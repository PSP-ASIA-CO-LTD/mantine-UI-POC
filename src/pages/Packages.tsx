import { useEffect, useState } from 'react';
import { Title, Group, Button, Grid, Card, Text, Stack, Badge } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { API } from '../api';
import { useSidesheet } from '../contexts/SidesheetContext';
import { AppSidesheetFooter } from '../components/AppSidesheetFooter';
import { buildLeftSection, buildField } from '../utils/sidesheetHelper';
import type { Package } from '../types';

export function Packages() {
    const [packages, setPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState(true);
    const { open, close } = useSidesheet();

    useEffect(() => {
        const loadPackages = async () => {
            try {
                const data = await API.getPackages();
                setPackages(data);
            } catch (error) {
                console.error('Failed to load packages:', error);
            } finally {
                setLoading(false);
            }
        };
        loadPackages();
    }, []);

    const handlePackageClick = async (pkg: Package) => {
        // Left Pane: Package Information (removed duplicate Package Name section)
        const leftPane = (
            <div>
                {buildLeftSection('Price', <Badge color="blue" size="lg">฿{pkg.price.toLocaleString()}</Badge>)}
                {buildLeftSection('Duration', <Text>{pkg.duration} days</Text>)}
                {buildLeftSection('Description', <Text size="sm" c="dimmed">{pkg.description}</Text>)}
            </div>
        );

        const rightPane = (
            <div>
                <Text fw={600} mb="md">Services ({pkg.services.length})</Text>
                {pkg.services.map((service, idx) => (
                    <Card key={idx} padding="md" mb="sm" withBorder>
                        <Stack gap="xs">
                            <Group justify="space-between">
                                <Text fw={500}>{service.title}</Text>
                                <Badge size="sm">{service.dept}</Badge>
                            </Group>
                            <Text size="sm" c="dimmed">{service.description}</Text>
                            <Group gap="xs">
                                <Text size="xs" c="dimmed">{service.interval}</Text>
                                <Text size="xs" c="dimmed">•</Text>
                                <Text size="xs" c="dimmed">฿{service.price.toLocaleString()}</Text>
                            </Group>
                        </Stack>
                    </Card>
                ))}
            </div>
        );

        const footer = (
            <AppSidesheetFooter
                onCancel={close}
                onSave={() => {
                    // Handle save
                    close();
                }}
                saveLabel="Edit Package"
            />
        );

        open({
            title: pkg.name,
            subtitle: 'Package Name',
            leftPane,
            rightPane,
            footer,
        });
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <Group justify="space-between" mb="xl">
                <Title order={2}>Package Management</Title>
                <Button leftSection={<IconPlus size={16} />}>
                    Create Package
                </Button>
            </Group>

            <Grid>
                {packages.map((pkg) => (
                    <Grid.Col key={pkg.id} span={{ base: 12, sm: 6, md: 4 }}>
                        <Card 
                            padding="lg" 
                            radius="md" 
                            withBorder 
                            style={{ cursor: 'pointer' }}
                            onClick={() => handlePackageClick(pkg)}
                        >
                            <Stack gap="xs">
                                <Group justify="space-between">
                                    <Text fw={600} size="lg">{pkg.name}</Text>
                                    <Badge color="blue">฿{pkg.price.toLocaleString()}</Badge>
                                </Group>
                                <Text size="sm" c="dimmed" lineClamp={2}>
                                    {pkg.description}
                                </Text>
                                <Group gap="xs">
                                    <Text size="xs" c="dimmed">Duration: {pkg.duration} days</Text>
                                    <Text size="xs" c="dimmed">•</Text>
                                    <Text size="xs" c="dimmed">{pkg.services.length} services</Text>
                                </Group>
                            </Stack>
                        </Card>
                    </Grid.Col>
                ))}
            </Grid>
        </div>
    );
}
