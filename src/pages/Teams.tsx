import { useEffect, useState } from 'react';
import { Title, Group, Button, Grid, Card, Text, Stack, Badge, List, Divider } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { API } from '../api';
import { useSidesheet } from '../contexts/SidesheetContext';
import { AppSidesheetFooter } from '../components/AppSidesheetFooter';
import { buildLeftSection } from '../utils/sidesheetHelper';
import type { Team } from '../types';

export function Teams() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
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

    const handleTeamClick = async (team: Team) => {
        // Left Pane: Team Information (removed duplicate Team Name section)
        const leftPane = (
            <div>
                {buildLeftSection('Department', <Badge color="gray" size="lg" data-er-field="DEPARTMENT.department_name">{team.dept}</Badge>)}

                <Divider my="xl" />

                <div style={{ marginTop: '2rem' }}>
                    <Text fw={600} mb="md" size="sm" data-er-field="DEPARTMENT.staff">Department Members</Text>
                    {team.members && team.members.length > 0 ? (
                        <List size="sm" spacing="xs">
                            {team.members.map((memberId, idx) => (
                                <List.Item key={idx} data-er-field="STAFF">
                                    <Text size="sm" c="dimmed" data-er-field="STAFF.name">{memberId}</Text>
                                </List.Item>
                            ))}
                        </List>
                    ) : (
                        <Text size="sm" c="dimmed">No members assigned</Text>
                    )}
                </div>
            </div>
        );

        // Right Pane: Services
        const rightPane = (
            <div>
                <Group justify="space-between" mb="md">
                    <Text fw={600}>Services</Text>
                </Group>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {team.assignmentTypes && team.assignmentTypes.length > 0 ? (
                        <Stack gap="md">
                            {team.assignmentTypes.map((at, index) => (
                                <Card key={index} padding="md" withBorder data-er-field="TASK">
                                    <Stack gap="xs">
                                        <Text fw={500} data-er-field="TASK.title">{at.name}</Text>
                                        {at.description && (
                                            <Text size="sm" c="dimmed" data-er-field="TASK.description">{at.description}</Text>
                                        )}
                                        {at.price > 0 && (
                                            <Text size="sm" c="dimmed" data-er-field="TASK.price">฿{at.price.toLocaleString()}</Text>
                                        )}
                                    </Stack>
                                </Card>
                            ))}
                        </Stack>
                    ) : (
                        <Text size="sm" c="dimmed" ta="center" py="xl">
                            No services registered
                        </Text>
                    )}
                </div>
            </div>
        );

        const footer = (
            <AppSidesheetFooter
                onCancel={close}
                onSave={() => {
                    // Handle save/edit
                    close();
                }}
                saveLabel="Edit Department"
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
                            data-er-field="DEPARTMENT"
                        >
                            <Stack gap="xs">
                                <Group justify="space-between">
                                    <Text fw={600} size="lg" data-er-field="DEPARTMENT.department_name">{team.name}</Text>
                                    <Badge color="gray">{team.dept}</Badge>
                                </Group>
                                <Group gap="xs">
                                    <Text size="xs" c="dimmed">{team.members.length} members</Text>
                                    <Text size="xs" c="dimmed">•</Text>
                                    <Text size="xs" c="dimmed">{team.assignmentTypes.length} services</Text>
                                </Group>
                            </Stack>
                        </Card>
                    </Grid.Col>
                ))}
            </Grid>
        </div>
    );
}
