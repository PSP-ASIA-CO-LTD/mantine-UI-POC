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
    List,
    Divider,
} from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { API } from '../api';
import { useSidesheet } from '../contexts/SidesheetContext';
import { AppSidesheetFooter } from '../components/AppSidesheetFooter';
import { buildLeftSection } from '../utils/sidesheetHelper';
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

    const openTeamSidesheet = (team: Team) => {
        const leftPane = (
            <div>
                {buildLeftSection(
                    'Department',
                    <Badge color="gray" size="lg">
                        {team.dept}
                    </Badge>
                )}

                <Divider my="xl" />

                {buildLeftSection(
                    'Description',
                    team.description ? (
                        <Text size="sm">{team.description}</Text>
                    ) : (
                        <Text size="sm" c="dimmed">
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
                    <Card key={idx} padding="md" mb="sm" withBorder>
                        <Stack gap="xs">
                            <Group justify="space-between">
                                <Text fw={500}>{service.name}</Text>

                                {isEditing ? (
                                    <Button
                                        size="xs"
                                        color="red"
                                        variant="light"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeService(idx);
                                        }}
                                    >
                                        Remove
                                    </Button>
                                ) : (
                                    <Badge color="gray">{team.dept}</Badge>
                                )}
                            </Group>

                            {service.description && (
                                <Text size="sm" c="dimmed">
                                    {service.description}
                                </Text>
                            )}

                            {service.price > 0 && (
                                <Text size="sm" c="dimmed">
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
                <Button leftSection={<IconPlus size={16} />}>
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
                        >
                            <Stack gap="xs">
                                <Group justify="space-between">
                                    <Text fw={600} size="lg">
                                        {team.name}
                                    </Text>
                                    <Badge color="gray">{team.dept}</Badge>
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
