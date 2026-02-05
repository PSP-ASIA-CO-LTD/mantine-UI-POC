import { useEffect, useState } from 'react';
import { Title, Group, Card, Text, Stack, Button, TextInput, Textarea } from '@mantine/core';
import { API } from '../api';
import type { BusinessProfile, DashboardStats } from '../types';
import { AppSidesheet } from '../components/AppSidesheet';

export function Dashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [settingsOpened, setSettingsOpened] = useState(false);
    const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
    const [profileLoading, setProfileLoading] = useState(false);

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

    useEffect(() => {
        if (!settingsOpened) return;
        let mounted = true;

        const loadProfile = async () => {
            setProfileLoading(true);
            try {
                const profile = await API.getBusinessProfile();
                if (mounted) {
                    setBusinessProfile(profile);
                }
            } catch (error) {
                console.error('Failed to load business profile:', error);
            } finally {
                if (mounted) {
                    setProfileLoading(false);
                }
            }
        };

        loadProfile();

        return () => {
            mounted = false;
        };
    }, [settingsOpened]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!stats) {
        return <div>Failed to load dashboard</div>;
    }

    const settingsLeftPane = businessProfile ? (
        <Stack gap="lg">
            <div>
                <Title order={4}>Business Details</Title>
                <Stack gap="sm" mt="sm">
                    <TextInput
                        label="Business Name"
                        value={businessProfile.businessInfo.businessName}
                        readOnly
                    />
                    <TextInput
                        label="Business Type"
                        value={businessProfile.businessInfo.businessType}
                        readOnly
                    />
                    <Textarea
                        label="Address"
                        value={businessProfile.businessInfo.address}
                        readOnly
                        minRows={2}
                    />
                    <TextInput
                        label="Phone Number"
                        value={businessProfile.businessInfo.phone}
                        readOnly
                    />
                </Stack>
            </div>

            <div>
                <Title order={4}>Administrator</Title>
                <Stack gap="sm" mt="sm">
                    <TextInput
                        label="First Name"
                        value={businessProfile.adminInfo.firstName}
                        readOnly
                    />
                    <TextInput
                        label="Last Name"
                        value={businessProfile.adminInfo.lastName}
                        readOnly
                    />
                    <TextInput
                        label="Email"
                        value={businessProfile.adminInfo.email}
                        readOnly
                    />
                </Stack>
            </div>

            <div>
                <Title order={4}>Facility & Billing</Title>
                <Stack gap="sm" mt="sm">
                    <TextInput
                        label="License Number"
                        value={businessProfile.facilityInfo.licenseNumber}
                        readOnly
                    />
                    <TextInput
                        label="Deposit policy (months)"
                        value={String(businessProfile.depositMonths)}
                        readOnly
                    />
                </Stack>
            </div>
        </Stack>
    ) : null;

    const settingsRightPane = businessProfile ? (
        <Stack gap="md">
            <Title order={4}>Buildings</Title>
            {[businessProfile.facilityInfo].map((facility, index) => (
                <Card key={index} padding="lg" radius="md" withBorder>
                    <Stack gap="xs">
                        <Text fw={600}>Building {index + 1}</Text>
                        <Text size="sm" c="dimmed">License Number</Text>
                        <Text size="sm">{facility.licenseNumber || 'Not provided'}</Text>
                        <Text size="sm" c="dimmed">Number of Beds</Text>
                        <Text size="sm">{facility.numberOfBeds || 'Not provided'}</Text>
                        <Text size="sm" c="dimmed">Number of Floors</Text>
                        <Text size="sm">{facility.numberOfFloors || 'Not provided'}</Text>
                        <Text size="sm" c="dimmed">Operating Hours</Text>
                        <Text size="sm">{facility.operatingHours || 'Not provided'}</Text>
                    </Stack>
                </Card>
            ))}
        </Stack>
    ) : null;

    const settingsFallback = profileLoading && !businessProfile
        ? <Text size="sm" c="dimmed">Loading company settings...</Text>
        : !businessProfile
            ? <Text size="sm" c="dimmed">No company settings found.</Text>
            : null;

    return (
        <div>
            <Group justify="space-between" mb="xl">
                <Title order={2}>Operations Dashboard</Title>
                <Button variant="outline" onClick={() => setSettingsOpened(true)}>
                    Company Settings
                </Button>
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

            <Group justify="flex-end" mt="lg" gap="xs">
                <button className="tertiary active">Today</button>
                <button className="tertiary">Forecast</button>
            </Group>

            <AppSidesheet
                opened={settingsOpened}
                onClose={() => setSettingsOpened(false)}
                title="Company Settings"
                leftPane={settingsLeftPane}
                rightPane={settingsRightPane}
            >
                {settingsFallback}
            </AppSidesheet>
        </div>
    );
}
