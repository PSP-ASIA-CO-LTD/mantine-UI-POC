import { useEffect, useState, type ChangeEvent } from 'react';
import { Title, Card, Stack, Button, Group, Text } from '@mantine/core';
import { API } from '../api';
import { TextInput } from '../components/EditableFields';
import type { BusinessProfile } from '../types';

export function Profile() {
    const [profile, setProfile] = useState<BusinessProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        const loadProfile = async () => {
            try {
                const data = await API.getBusinessProfile();
                if (mounted) {
                    setProfile(data);
                }
            } catch (err) {
                console.error('Failed to load profile:', err);
                if (mounted) {
                    setError('Failed to load profile.');
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        loadProfile();

        return () => {
            mounted = false;
        };
    }, []);

    const handleChange = (field: 'firstName' | 'lastName' | 'email') => (event: ChangeEvent<HTMLInputElement>) => {
        if (!profile) return;
        setProfile({
            ...profile,
            adminInfo: {
                ...profile.adminInfo,
                [field]: event.target.value,
            },
        });
    };

    const handleSave = async () => {
        if (!profile) return;
        setSaving(true);
        setError(null);
        try {
            const saved = await API.saveBusinessProfile({
                ...profile,
                updatedAt: new Date().toISOString(),
            });
            setProfile(saved);
        } catch (err) {
            console.error('Failed to save profile:', err);
            setError('Failed to save profile.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!profile) {
        return <div>Profile not available.</div>;
    }

    return (
        <div>
            <Group justify="space-between" mb="xl">
                <Title order={2}>Owner Profile</Title>
                <Button onClick={handleSave} loading={saving}>
                    Save Changes
                </Button>
            </Group>

            {error && (
                <Text c="red" size="sm" mb="md">
                    {error}
                </Text>
            )}

            <Card padding="lg" radius="md" withBorder data-er-field="BUSINESS">
                <Stack gap="md">
                    <TextInput
                        label="First Name"
                        value={profile.adminInfo.firstName}
                        onChange={handleChange('firstName')}
                        data-er-field="BUSINESS.admin_first_name"
                    />
                    <TextInput
                        label="Last Name"
                        value={profile.adminInfo.lastName}
                        onChange={handleChange('lastName')}
                        data-er-field="BUSINESS.admin_last_name"
                    />
                    <TextInput
                        label="Email"
                        value={profile.adminInfo.email}
                        onChange={handleChange('email')}
                        data-er-field="BUSINESS.admin_email"
                    />
                </Stack>
            </Card>
        </div>
    );
}
