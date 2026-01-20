import { useEffect, useState } from 'react';
import {
    Title,
    Group,
    Button,
    Grid,
    Card,
    Text,
    Stack,
    Badge,
    Divider,
} from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { API } from '../api';
import { useSidesheet } from '../contexts/SidesheetContext';
import { AppSidesheetFooter } from '../components/AppSidesheetFooter';
import { buildLeftSection } from '../utils/sidesheetHelper';
import { IconMinus } from '@tabler/icons-react';
import type { Package, Service } from '../types';

export function Packages() {
    const [packages, setPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState(true);

    const [activePackage, setActivePackage] = useState<Package | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editableServices, setEditableServices] = useState<Service[]>([]);
    const [saving, setSaving] = useState(false);

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

    const removeService = (index: number) => {
        setEditableServices((prev) => prev.filter((_, i) => i !== index));
    };

    const openPackageSidesheet = (pkg: Package) => {
        const leftPane = (
            <div>
                {buildLeftSection(
                    'Package ID',
                    <Text size="sm" fw={500} data-er-field="SALE_PACKAGE.id">{pkg.id}</Text>
                )}

                <Divider my="xl" />

                {buildLeftSection(
                    'Price',
                    <Badge color="blue" size="lg" data-er-field="SALE_PACKAGE.price">
                        ฿{pkg.price.toLocaleString()}
                    </Badge>
                )}

                <Divider my="xl" />

                {buildLeftSection(
                    'Duration',
                    <Text data-er-field="SALE_PACKAGE.duration_days">{pkg.duration} days</Text>
                )}

                <Divider my="xl" />

                {buildLeftSection(
                    'Description',
                    <Text size="sm" c="dimmed" data-er-field="SALE_PACKAGE.description">
                        {pkg.description}
                    </Text>
                )}
            </div>
        );

        const rightPane = (
            <div>
                <Text fw={600} mb="md">
                    Services ({editableServices.length})
                </Text>
                {editableServices.map((service, idx) => (
                    <Card key={idx} padding="md" mb="sm" withBorder data-er-field="PACKAGE_ITEM">
                        <Stack gap="xs">
                            <Group justify="space-between">
                                <Text fw={500} data-er-field="TASK.title">{service.title}</Text>

                                {isEditing ? (
                                    <Button
                                        size="xs"
                                        color="red"
                                        variant="light"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeService(idx);
                                        }}
                                        styles={{
                                            root: {
                                                width: 28,
                                                height: 28,
                                                borderRadius: '50%',
                                                padding: 0,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'background-color 0.2s ease',
                                                '&:hover': {
                                                    backgroundColor: '#ffe5e5',
                                                },
                                            },
                                        }}

                                    >
                                        <IconMinus size={16} />
                                    </Button>

                                ) : (
                                    <Badge size="sm" data-er-field="TASK.department_id">{service.dept}</Badge>
                                )}
                            </Group>

                            <Text size="sm" c="dimmed" data-er-field="TASK.description">
                                {service.description}
                            </Text>

                            <Group gap="xs">
                                <Text size="xs" c="dimmed" data-er-field="TASK.interval">
                                    {service.interval}
                                </Text>
                                <Text size="xs" c="dimmed">•</Text>
                                <Text size="xs" c="dimmed" data-er-field="TASK.price">
                                    ฿{service.price.toLocaleString()}
                                </Text>
                            </Group>
                        </Stack>
                    </Card>
                ))}
            </div>
        );

        const footer = (
            <AppSidesheetFooter
                onCancel={() => {
                    setIsEditing(false);
                    close();
                }}
                onSave={async () => {
                    if (!isEditing) {
                        setIsEditing(true);
                        return;
                    }

                    if (!activePackage) return;

                    try {
                        setSaving(true);
                        const updated = await API.savePackage({
                            id: activePackage.id,
                            services: editableServices,
                        });

                        setPackages((prev) =>
                            prev.map((p) => (p.id === updated.id ? updated : p))
                        );
                        close();
                    } catch (error) {
                        console.error('Failed to save package:', error);
                    } finally {
                        setSaving(false);
                        setIsEditing(false);
                    }
                }}
                saveLabel={isEditing ? 'Save Changes' : 'Edit Package'}
                isLoading={saving}
            />
        );

        open({
            title: pkg.name,
            titleDataAttribute: 'SALE_PACKAGE.name',
            subtitle: 'Package Name',
            leftPane,
            rightPane,
            footer,
        });
    };

    const handlePackageClick = (pkg: Package) => {
        setActivePackage(pkg);
        setIsEditing(false);
        setEditableServices([...pkg.services]);
        openPackageSidesheet(pkg);
    };

    useEffect(() => {
        if (!activePackage) return;
        openPackageSidesheet(activePackage);
    }, [isEditing, editableServices]);

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
                            data-er-field="SALE_PACKAGE"
                        >
                            <Stack gap="xs">
                                <Group justify="space-between">
                                    <Text fw={600} size="lg" data-er-field="SALE_PACKAGE.name">
                                        {pkg.name}
                                    </Text>
                                    <Badge color="blue" data-er-field="SALE_PACKAGE.price">
                                        ฿{pkg.price.toLocaleString()}
                                    </Badge>
                                </Group>
                                <Text size="sm" c="dimmed" lineClamp={2} data-er-field="SALE_PACKAGE.description">
                                    {pkg.description}
                                </Text>
                                <Group gap="xs">
                                    <Text size="xs" c="dimmed" data-er-field="SALE_PACKAGE.duration_days">
                                        Duration: {pkg.duration} days
                                    </Text>
                                    <Text size="xs" c="dimmed">•</Text>
                                    <Text size="xs" c="dimmed">
                                        {pkg.services.length} services
                                    </Text>
                                </Group>
                            </Stack>
                        </Card>
                    </Grid.Col>
                ))}
            </Grid>
        </div>
    );
}
