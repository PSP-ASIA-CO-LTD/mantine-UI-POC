import { useEffect, useState } from 'react';
import { Title, Group, Card, Text, Stack } from '@mantine/core';
import { API } from '../api';
import type { DashboardStats } from '../types';

export function Dashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const data = await API.getDashboardStats();
                setStats(data);
            } catch (error) {
                console.error('Failed to load dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!stats) {
        return <div>Failed to load dashboard</div>;
    }

    return (
        <div>
            <Group justify="space-between" mb="xl">
                <Title order={2}>Operations Dashboard</Title>
                <Group gap="xs">
                    <button className="tertiary active">Today</button>
                    <button className="tertiary">Forecast</button>
                </Group>
            </Group>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                <Card padding="lg" radius="md" withBorder>
                    <Stack gap="xs">
                        <Text size="sm" c="dimmed">Occupancy</Text>
                        <Text size="xl" fw={700}>{stats.occupancy}%</Text>
                    </Stack>
                </Card>
                <Card padding="lg" radius="md" withBorder>
                    <Stack gap="xs">
                        <Text size="sm" c="dimmed">Pending Tasks</Text>
                        <Text size="xl" fw={700}>{stats.pendingTasks}</Text>
                    </Stack>
                </Card>
                <Card padding="lg" radius="md" withBorder>
                    <Stack gap="xs">
                        <Text size="sm" c="dimmed">Total Staff</Text>
                        <Text size="xl" fw={700}>{stats.totalStaff}</Text>
                    </Stack>
                </Card>
                <Card padding="lg" radius="md" withBorder>
                    <Stack gap="xs">
                        <Text size="sm" c="dimmed">New Purchases</Text>
                        <Text size="xl" fw={700}>{stats.newPurchases}</Text>
                    </Stack>
                </Card>
            </div>
        </div>
    );
}
