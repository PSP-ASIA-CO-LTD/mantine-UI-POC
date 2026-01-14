import { useEffect, useState } from 'react';
import { Title, Group, Button, Table, Avatar, Badge, ActionIcon, Text } from '@mantine/core';
import { IconPlus, IconDotsVertical } from '@tabler/icons-react';
import { API } from '../api';
import type { Staff } from '../types';

export function Staff() {
    const [staff, setStaff] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStaff = async () => {
            try {
                const data = await API.getStaff();
                setStaff(data);
            } catch (error) {
                console.error('Failed to load staff:', error);
            } finally {
                setLoading(false);
            }
        };
        loadStaff();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <Group justify="space-between" mb="xl">
                <Title order={2}>Staff Management</Title>
                <Button leftSection={<IconPlus size={16} />}>
                    Add Staff
                </Button>
            </Group>

            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Name</Table.Th>
                        <Table.Th>Department</Table.Th>
                        <Table.Th>Role</Table.Th>
                        <Table.Th>Status</Table.Th>
                        <Table.Th style={{ textAlign: 'right' }}>Actions</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {staff.map((member) => (
                        <Table.Tr key={member.id}>
                            <Table.Td>
                                <Group gap="sm">
                                    <Avatar color="blue" radius="md">
                                        {member.name.charAt(0)}
                                    </Avatar>
                                    <div>
                                        <Text fw={500}>{member.name}</Text>
                                        <Text size="xs" c="dimmed">ID: {member.id}</Text>
                                    </div>
                                </Group>
                            </Table.Td>
                            <Table.Td>{member.dept}</Table.Td>
                            <Table.Td>{member.role}</Table.Td>
                            <Table.Td>
                                <Badge color="green">{member.status}</Badge>
                            </Table.Td>
                            <Table.Td>
                                <Group justify="flex-end">
                                    <ActionIcon variant="subtle">
                                        <IconDotsVertical size={16} />
                                    </ActionIcon>
                                </Group>
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
        </div>
    );
}
