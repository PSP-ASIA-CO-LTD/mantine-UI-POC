import { useEffect, useRef, useState } from 'react';
import {
    Group,
    Button,
    Text,
    ActionIcon,
    Divider,
    Card,
    Badge,
    Stack,
    Grid,
    NumberInput,
    TextInput,
    Textarea,
} from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { API } from '../api';
import { useSidesheet } from '../contexts/SidesheetContext';
import { AppSidesheetFooter } from '../components/AppSidesheetFooter';
import { CardList } from '../components/CardList';
import { PageHeader } from '../components/PageHeader';
import { buildLeftSection } from '../utils/sidesheetHelper';
import { RecurrenceDisplay } from '../components/RecurrenceIcon';
import type { Package, Service } from '../types';

export function Packages() {
    const [packages, setPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState(true);
    const [activePackage, setActivePackage] = useState<Package | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editableServices, setEditableServices] = useState<Service[]>([]);
    const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
    const [serviceDraft, setServiceDraft] = useState<{ title: string; description: string; price: number } | null>(null);
    const serviceDraftRef = useRef<{ title: string; description: string; price: number } | null>(null);
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
        const service = editableServices[index];
        if (service && editingServiceId === (service.id || `idx-${index}`)) {
            setEditingServiceId(null);
            setServiceDraft(null);
            serviceDraftRef.current = null;
        }
    };

    const startEditService = (service: Service, index: number) => {
        const draft = {
            title: service.title,
            description: service.description,
            price: service.price,
        };
        setEditingServiceId(service.id || `idx-${index}`);
        setServiceDraft(draft);
        serviceDraftRef.current = draft;
    };

    const cancelEditService = () => {
        setEditingServiceId(null);
        setServiceDraft(null);
        serviceDraftRef.current = null;
    };

    const submitEditService = (index: number, draft: { title: string; description: string; price: number }) => {
        setEditableServices((prev) => prev.map((service, i) => (
            i === index
                ? {
                    ...service,
                    title: draft.title.trim(),
                    description: draft.description.trim(),
                    price: Number.isFinite(draft.price) ? Math.max(0, draft.price) : 0,
                }
                : service
        )));
        setEditingServiceId(null);
        setServiceDraft(null);
        serviceDraftRef.current = null;
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
                <Group justify="space-between" mb="md">
                    <Text fw={600}>
                        Services ({editableServices.length})
                    </Text>

                    {isEditing && (
                        <ActionIcon
                            size={28}
                            variant="light"
                            color="green"
                            onClick={(event) => {
                                event.stopPropagation();
                            }}
                            aria-label="Add service"
                        >
                            <IconPlus size={16} />
                        </ActionIcon>
                    )}
                </Group>
                {editableServices.length > 0 ? (
                    editableServices.map((service, idx) => {
                        const cardId = service.id || `idx-${idx}`;
                        const isServiceEditing = editingServiceId === cardId;
                        const activeDraft = isServiceEditing && serviceDraft
                            ? serviceDraft
                            : {
                                title: service.title,
                                description: service.description,
                                price: service.price,
                            };
                        const canSubmitEdit = Boolean(
                            activeDraft.title.trim()
                            && Number.isFinite(activeDraft.price)
                            && activeDraft.price >= 0,
                        );

                        return (
                            <CardList
                                key={service.id || idx}
                                title={(
                                    <Group justify="space-between" align="center" wrap="nowrap" w="100%">
                                        <Text fw={500}>{service.title}</Text>
                                        <Badge size="xs" variant="light" style={{ textTransform: 'none' }} data-er-field="TASK.department_id">{service.dept}</Badge>
                                    </Group>
                                )}
                                isEditing={isEditing}
                                isCardEditing={isServiceEditing}
                                onStartEdit={() => startEditService(service, idx)}
                                onCancelEdit={cancelEditService}
                                onSubmitEdit={() => submitEditService(idx, serviceDraftRef.current || activeDraft)}
                                disableSubmitEdit={!canSubmitEdit}
                                onRemove={() => removeService(idx)}
                                editTitle={(
                                    <TextInput
                                        label="Service Name"
                                        value={activeDraft.title}
                                        onChange={(event) => {
                                            const value = event.currentTarget.value;
                                            setServiceDraft((current) => {
                                                const next = {
                                                    title: value,
                                                    description: current?.description ?? service.description,
                                                    price: current?.price ?? service.price,
                                                };
                                                serviceDraftRef.current = next;
                                                return next;
                                            });
                                        }}
                                        classNames={{
                                            wrapper: 'editable-field__mantine-root editable-field--form',
                                            label: 'editable-field__label',
                                            input: 'editable-field__input',
                                        }}
                                    />
                                )}
                                cardDataErField="PACKAGE_ITEM"
                                titleDataErField="TASK.title"
                                description={(
                                    <Group justify="space-between" wrap="nowrap" align="center" w="100%">
                                        <Text size="xs" c="dimmed" style={{ flex: 1 }}>{service.description}</Text>
                                        <div data-er-field="TASK.interval" style={{ transform: 'scale(0.9)', transformOrigin: 'right' }}>
                                            <RecurrenceDisplay interval={service.interval} />
                                        </div>
                                    </Group>
                                )}
                                descriptionDataErField="TASK.description"
                                editDescription={(
                                    <Textarea
                                        label="Description"
                                        minRows={2}
                                        value={activeDraft.description}
                                        onChange={(event) => {
                                            const value = event.currentTarget.value;
                                            setServiceDraft((current) => {
                                                const next = {
                                                    title: current?.title ?? service.title,
                                                    description: value,
                                                    price: current?.price ?? service.price,
                                                };
                                                serviceDraftRef.current = next;
                                                return next;
                                            });
                                        }}
                                        classNames={{
                                            wrapper: 'editable-field__mantine-root editable-field--form',
                                            label: 'editable-field__label',
                                            input: 'editable-field__input',
                                        }}
                                    />
                                )}
                                meta={(
                                    <Text size="xs" c="dimmed" ta="right" mt={-4} data-er-field="TASK.price">
                                        ฿{service.price.toLocaleString()}
                                    </Text>
                                )}
                                editMeta={(
                                    <NumberInput
                                        label="Price (THB)"
                                        min={0}
                                        value={activeDraft.price}
                                        thousandSeparator=","
                                        onChange={(value) => setServiceDraft((current) => {
                                            const next = {
                                                title: current?.title ?? service.title,
                                                description: current?.description ?? service.description,
                                                price: typeof value === 'number' ? value : Number(value) || 0,
                                            };
                                            serviceDraftRef.current = next;
                                            return next;
                                        })}
                                        classNames={{
                                            wrapper: 'editable-field__mantine-root editable-field--form',
                                            label: 'editable-field__label',
                                            input: 'editable-field__input',
                                        }}
                                    />
                                )}
                                mb="sm"
                            />
                        );
                    })
                ) : (
                    <Text size="sm" c="dimmed">No services yet.</Text>
                )}
            </div>
        );

        const footer = (
            <AppSidesheetFooter
                onCancel={() => {
                    setIsEditing(false);
                    setEditingServiceId(null);
                    setServiceDraft(null);
                    serviceDraftRef.current = null;
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
                            serviceIds: editableServices.map((service) => service.id),
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
        setEditingServiceId(null);
        setServiceDraft(null);
        serviceDraftRef.current = null;
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
            <PageHeader
                title="Package Management"
                subtitle="Define and manage your service bundles."
                actions={
                    <Button leftSection={<IconPlus size={16} />}>
                        Create Package
                    </Button>
                }
                transparent
            />

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
