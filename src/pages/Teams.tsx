import { useEffect, useState } from 'react';
import {
    Title,
    Group,
    Button,
    Grid,
    Card,
    Text,
    TextInput,
    Textarea,
    Select,
    MultiSelect,
    Stack,
    Badge,
    List,
    Divider,
} from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { API } from '../api';
import { useSidesheet } from '../contexts/SidesheetContext';
import { AppSidesheetFooter } from '../components/AppSidesheetFooter';
import { buildLeftSection } from '../utils/sidesheetHelper';
import { IconMinus } from '@tabler/icons-react';
import type { Team, AssignmentType } from '../types';

export function Teams() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);

    // edit states
    const [activeTeam, setActiveTeam] = useState<Team | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editableServices, setEditableServices] = useState<AssignmentType[]>([]);

    const { open, close } = useSidesheet();

    useEffect(() => {
        const loadTeams = async () => {
            try {
                const data = await API.getTeams();
                setTeams(data);
            } catch (error) {
                console.error('Failed to load teams:', error);
            } finally {
                setLoading(false);
            }
        };
        loadTeams();
    }, []);

    const removeService = (index: number) => {
        setEditableServices((prev) => prev.filter((_, i) => i !== index));
    };

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
                    data={teams.map((team) => team.name)}
                    searchable
                    clearable
                />

                <Select
                    label="Parent Department"
                    placeholder="None"
                    data={teams.map((team) => team.name)}
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

                {/* Operating hours as time range */}
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
                    data={[
                        { value: 'service1', label: 'Service 1' },
                        { value: 'service2', label: 'Service 2' },
                        { value: 'service3', label: 'Service 3' },
                        { value: 'service4', label: 'Service 4' },
                    ]}
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


    const openTeamSidesheet = (team: Team) => {
        const leftPane = (
            <div>
                {buildLeftSection(
                    'Department ID',
                    <Text size="sm" fw={500} data-er-field="DEPARTMENT.id">{team.id}</Text>
                )}

                <Divider my="xl" />

                {buildLeftSection(
                    'Department',
                    <Badge color="gray" size="lg" data-er-field="DEPARTMENT.business_id">
                        {team.dept}
                    </Badge>
                )}

                <Divider my="xl" />

                {buildLeftSection(
                    'Description',
                    team.description ? (
                        <Text size="sm" data-er-field="DEPARTMENT.description">{team.description}</Text>
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
                    {team.members && team.members.length > 0 ? (
                        <List size="sm" spacing="xs">
                            {team.members.map((memberId, idx) => (
                                <List.Item key={idx}>
                                    <Text size="sm" c="dimmed">
                                        {memberId}
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
                <Text fw={600} mb="md">
                    Services ({editableServices.length})
                </Text>

                {editableServices.map((service, idx) => (
                    <Card key={idx} padding="md" mb="sm" withBorder data-er-field="TASK">
                        <Stack gap="xs">
                            <Group justify="space-between">
                                <Text fw={500} data-er-field="TASK.title">{service.name}</Text>

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
                                    <Badge color="gray" data-er-field="TASK.department_id">{team.dept}</Badge>
                                )}
                            </Group>

                            {service.description && (
                                <Text size="sm" c="dimmed" data-er-field="TASK.description">
                                    {service.description}
                                </Text>
                            )}

                            {service.price > 0 && (
                                <Text size="sm" c="dimmed" data-er-field="TASK.price">
                                    ฿{service.price.toLocaleString()}
                                </Text>
                            )}
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
                onSave={() => {
                    if (!isEditing) {
                        setIsEditing(true);
                    } else {
                        // TODO: API.updateTeam(team.id, { assignmentTypes: editableServices })
                        close();
                    }
                }}
                saveLabel={isEditing ? 'Save Changes' : 'Edit Department'}
            />
        );

        open({
            title: team.name,
            titleDataAttribute: 'DEPARTMENT.department_name',
            subtitle: 'Department Name',
            leftPane,
            rightPane,
            footer,
        });
    };

    const handleTeamClick = (team: Team) => {
        setActiveTeam(team);
        setIsEditing(false);
        setEditableServices([...team.assignmentTypes]);
        openTeamSidesheet(team);
    };

    useEffect(() => {
        if (!activeTeam) return;
        openTeamSidesheet(activeTeam);
    }, [isEditing, editableServices]);

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
                {teams.map((team) => (
                    <Grid.Col key={team.id} span={{ base: 12, sm: 6, md: 4 }}>
                        <Card
                            padding="lg"
                            radius="md"
                            withBorder
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleTeamClick(team)}
                            data-er-field="DEPARTMENT"
                        >
                            <Stack gap="xs">
                                <Group justify="space-between">
                                    <Text fw={600} size="lg" data-er-field="DEPARTMENT.department_name">
                                        {team.name}
                                    </Text>
                                    <Badge color="gray" data-er-field="DEPARTMENT.business_id">{team.dept}</Badge>
                                </Group>
                                <Group gap="xs">
                                    <Text size="xs" c="dimmed">
                                        {team.members.length} members
                                    </Text>
                                    <Text size="xs" c="dimmed">•</Text>
                                    <Text size="xs" c="dimmed">
                                        {team.assignmentTypes.length} services
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
