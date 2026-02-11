import { useEffect, useMemo, useState } from 'react';
import {
    Title,
    Group,
    Button,
    Grid,
    Text,
    ActionIcon,
    List,
    Divider,
    Card,
    Badge,
    Stack,
} from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { API } from '../api';
import { useSidesheet } from '../contexts/SidesheetContext';
import { AppSidesheetFooter } from '../components/AppSidesheetFooter';
import { CardList } from '../components/CardList';
import { TextInput, Textarea, Select, MultiSelect } from '../components/EditableFields';
import { buildLeftSection } from '../utils/sidesheetHelper';
import { RecurrenceDisplay } from '../components/RecurrenceIcon';
import type { Department, Service, Staff } from '../types';

export function Departments() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [staff, setStaff] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);

    const [activeDepartment, setActiveDepartment] = useState<Department | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    const { open, close } = useSidesheet();

    useEffect(() => {
        const loadDepartments = async () => {
            try {
                const [deptData, serviceData, staffData] = await Promise.all([
                    API.getDepartments(),
                    API.getServices(),
                    API.getStaff(),
                ]);
                setDepartments(deptData);
                setServices(serviceData);
                setStaff(staffData);
            } catch (error) {
                console.error('Failed to load departments:', error);
            } finally {
                setLoading(false);
            }
        };
        loadDepartments();
    }, []);

    const servicesByDept = useMemo(() => {
        const map = new Map<string, Service[]>();
        services.forEach((service) => {
            const list = map.get(service.departmentId) || [];
            list.push(service);
            map.set(service.departmentId, list);
        });
        return map;
    }, [services]);

    const staffByDept = useMemo(() => {
        const map = new Map<string, Staff[]>();
        staff.forEach((member) => {
            const dept = departments.find((d) => d.name === member.dept);
            if (!dept) return;
            const list = map.get(dept.id) || [];
            list.push(member);
            map.set(dept.id, list);
        });
        return map;
    }, [staff, departments]);

    const openCreateDepartmentSidesheet = () => {
        const leftPane = (
            <Stack gap="md">
                <Text fw={600} size="sm">Basic Info</Text>

                <TextInput label="Department ID" placeholder="Auto-generated or enter ID" />
                <TextInput label="Department Name" placeholder="e.g. Cardiology" required />
                <TextInput label="Department Code" placeholder="e.g. CAR-01" />

                <Select
                    label="Department Head / Manager"
                    placeholder="Select staff"
                    data={staff.map((member) => member.name)}
                    searchable
                    clearable
                />

                <Select
                    label="Parent Department"
                    placeholder="None"
                    data={departments.map((dept) => dept.name)}
                    clearable
                />

                <Textarea
                    label="Description"
                    placeholder="Department description"
                    autosize
                    minRows={3}
                />

                <TextInput
                    label="Location / Floor / Building"
                    placeholder="e.g. Building A, 3rd Floor"
                />

                <Group grow>
                    <TextInput label="Start Time" type="time" />
                    <TextInput label="End Time" type="time" />
                </Group>
            </Stack>
        );

        const rightPane = (
            <Stack gap="md">
                <Text fw={600} size="sm">Services</Text>

                <MultiSelect
                    label="Select Services"
                    placeholder="Choose services"
                    data={services.map((service) => ({ value: service.id, label: service.title }))}
                    searchable
                    clearable
                />
            </Stack>
        );

        const footer = (
            <AppSidesheetFooter
                onCancel={close}
                onSave={() => {
                    close();
                }}
                saveLabel="Create Department"
            />
        );

        open({
            title: 'Create Department',
            subtitle: 'Basic Information',
            leftPane,
            rightPane,
            footer,
        });
    };

    const openDepartmentSidesheet = (department: Department) => {
        const deptServices = servicesByDept.get(department.id) || [];
        const deptStaff = staffByDept.get(department.id) || [];

        const leftPane = (
            <div>
                {buildLeftSection(
                    'Department ID',
                    <Text size="sm" fw={500} data-er-field="DEPARTMENT.id">{department.id}</Text>
                )}

                <Divider my="xl" />

                {buildLeftSection(
                    'Department',
                    <Badge color="gray" size="lg" data-er-field="DEPARTMENT.department_name">
                        {department.name}
                    </Badge>
                )}

                <Divider my="xl" />

                {buildLeftSection(
                    'Description',
                    department.description ? (
                        <Text size="sm" data-er-field="DEPARTMENT.description">{department.description}</Text>
                    ) : (
                        <Text size="sm" c="dimmed" data-er-field="DEPARTMENT.description">
                            No description provided
                        </Text>
                    )
                )}

                <Divider my="xl" />

                <div style={{ marginTop: '2rem' }}>
                    <Text fw={600} mb="md" size="sm">
                        Department Members
                    </Text>
                    {deptStaff.length > 0 ? (
                        <List size="sm" spacing="xs">
                            {deptStaff.map((member) => (
                                <List.Item key={member.id}>
                                    <Text size="sm" c="dimmed">
                                        {member.name}
                                    </Text>
                                </List.Item>
                            ))}
                        </List>
                    ) : (
                        <Text size="sm" c="dimmed">
                            No members assigned
                        </Text>
                    )}
                </div>
            </div>
        );

        const rightPane = (
            <div>
                <Group justify="space-between" mb="md">
                    <Text fw={600}>
                        Services ({deptServices.length})
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

                {deptServices.length > 0 ? (
                    deptServices.map((service) => (
                        <CardList
                            key={service.id}
                            title={(
                                <Group justify="space-between" align="center" wrap="nowrap" w="100%">
                                    <Text fw={500}>{service.title}</Text>
                                    <Badge size="xs" variant="light" style={{ textTransform: 'none' }} data-er-field="TASK.department_id">{service.dept}</Badge>
                                </Group>
                            )}
                            isEditing={isEditing}
                            cardDataErField="TASK"
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
                            meta={(
                                <Text size="xs" c="dimmed" ta="right" mt={-4} data-er-field="TASK.price">
                                    ฿{service.price.toLocaleString()}
                                </Text>
                            )}
                            mb="sm"
                        />
                    ))
                ) : (
                    <Text size="sm" c="dimmed">No services yet.</Text>
                )}
            </div>
        );

        const footer = (
            <AppSidesheetFooter
                onCancel={() => {
                    setIsEditing(false);
                    close();
                }}
                onSave={() => {
                    if (!isEditing) {
                        setIsEditing(true);
                    } else {
                        close();
                    }
                }}
                saveLabel={isEditing ? 'Save Changes' : 'Edit Department'}
            />
        );

        open({
            title: department.name,
            titleDataAttribute: 'DEPARTMENT.department_name',
            subtitle: 'Department Name',
            leftPane,
            rightPane,
            footer,
        });
    };

    const handleDepartmentClick = (department: Department) => {
        setActiveDepartment(department);
        setIsEditing(false);
        openDepartmentSidesheet(department);
    };

    useEffect(() => {
        if (!activeDepartment) return;
        openDepartmentSidesheet(activeDepartment);
    }, [isEditing, activeDepartment, servicesByDept, staffByDept]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <Group justify="space-between" mb="xl">
                <Title order={2}>Department Management</Title>
                <Button leftSection={<IconPlus size={16} />} onClick={openCreateDepartmentSidesheet}>
                    Create Department
                </Button>

            </Group>

            <Grid>
                {departments.map((department) => (
                    <Grid.Col key={department.id} span={{ base: 12, sm: 6, md: 4 }}>
                        <Card
                            padding="lg"
                            radius="md"
                            withBorder
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleDepartmentClick(department)}
                            data-er-field="DEPARTMENT"
                        >
                            <Stack gap="xs">
                                <Group justify="space-between">
                                    <Text fw={600} size="lg" data-er-field="DEPARTMENT.department_name">
                                        {department.name}
                                    </Text>
                                    {department.code && (
                                        <Badge color="gray" data-er-field="DEPARTMENT.business_id">{department.code}</Badge>
                                    )}
                                </Group>
                                <Group gap="xs">
                                    <Text size="xs" c="dimmed">
                                        {(staffByDept.get(department.id) || []).length} members
                                    </Text>
                                    <Text size="xs" c="dimmed">•</Text>
                                    <Text size="xs" c="dimmed">
                                        {(servicesByDept.get(department.id) || []).length} services
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
