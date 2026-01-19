import { useEffect, useState } from 'react';
import { Title, Group, Button, Table, Avatar, Badge, ActionIcon, Text, Divider, Stack } from '@mantine/core';
import { IconPlus, IconDotsVertical } from '@tabler/icons-react';
import { API } from '../api';
import { useSidesheet } from '../contexts/SidesheetContext';
import { AppSidesheetFooter } from '../components/AppSidesheetFooter';
import { buildLeftSection } from '../utils/sidesheetHelper';
import type { Staff } from '../types';

export function Staff() {
    const [staff, setStaff] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const { open, close } = useSidesheet();

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

    const openStaffSidesheet = (member: Staff) => {
        const leftPane = (
            <div>
                {buildLeftSection(
                    'Staff ID',
                    <Text size="sm" fw={500} data-er-field="STAFF.id">{member.id}</Text>
                )}

                <Divider my="xl" />

                {buildLeftSection(
                    'Department',
                    <Badge color="gray" size="lg" data-er-field="STAFF.department_id">
                        {member.dept}
                    </Badge>
                )}

                <Divider my="xl" />

                {buildLeftSection(
                    'Status',
                    <Badge color="green" size="lg" data-er-field="STAFF.status">
                        {member.status}
                    </Badge>
                )}
            </div>
        );

        const rightPane = (
            <div>
                <Stack gap="md">
                    <div>
                        <Text fw={600} mb="xs" size="sm" c="dimmed">
                            Full Name
                        </Text>
                        <Text size="lg" fw={500} data-er-field="STAFF.name">{member.name}</Text>
                    </div>

                    <Divider />

                    <div>
                        <Text fw={600} mb="xs" size="sm" c="dimmed">
                            Role
                        </Text>
                        <Text size="md" data-er-field="STAFF.role">{member.role}</Text>
                    </div>

                    <Divider />

                    <div>
                        <Text fw={600} mb="xs" size="sm" c="dimmed">
                            Department
                        </Text>
                        <Text size="md" data-er-field="STAFF.department_id">{member.dept}</Text>
                    </div>
                </Stack>
            </div>
        );

        const footer = (
            <AppSidesheetFooter
                onCancel={close}
                onSave={() => {
                    // TODO: Implement edit functionality
                    close();
                }}
                saveLabel="Edit Staff"
            />
        );

        open({
            title: member.name,
            titleDataAttribute: 'STAFF.name',
            subtitle: 'Staff Details',
            leftPane,
            rightPane,
            footer,
        });
    };

    const handleRowClick = (member: Staff) => {
        openStaffSidesheet(member);
    };

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
                        <Table.Tr 
                            key={member.id} 
                            data-er-field="STAFF"
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleRowClick(member)}
                        >
                            <Table.Td>
                                <Group gap="sm">
                                    <Avatar color="blue" radius="md">
                                        {member.name.charAt(0)}
                                    </Avatar>
                                    <div>
                                        <Text fw={500} data-er-field="STAFF.name">{member.name}</Text>
                                        <Text size="xs" c="dimmed" data-er-field="STAFF.id">ID: {member.id}</Text>
                                    </div>
                                </Group>
                            </Table.Td>
                            <Table.Td data-er-field="STAFF.department_id">{member.dept}</Table.Td>
                            <Table.Td data-er-field="STAFF.role">{member.role}</Table.Td>
                            <Table.Td>
                                <Badge color="green" data-er-field="STAFF.status">{member.status}</Badge>
                            </Table.Td>
                            <Table.Td>
                                <Group justify="flex-end">
                                    <ActionIcon 
                                        variant="subtle"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            // TODO: Handle menu actions
                                        }}
                                    >
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
