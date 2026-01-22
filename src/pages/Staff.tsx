import { useEffect, useState } from 'react';
import {
    Title,
    Group,
    Button,
    Table,
    Avatar,
    Badge,
    ActionIcon,
    Text,
    Divider,
    Card ,
    Stack,
    TextInput,
    Select,
    Textarea,
    FileInput,
    NumberInput,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconPlus, IconDotsVertical, IconMinus } from '@tabler/icons-react';
import { API } from '../api';
import { useSidesheet } from '../contexts/SidesheetContext';
import { AppSidesheetFooter } from '../components/AppSidesheetFooter';
import { buildLeftSection } from '../utils/sidesheetHelper';
import type { Staff } from '../types';

export function Staff() {
    const [staff, setStaff] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeStaff, setActiveStaff] = useState<Staff | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const departments = Array.from(new Set(staff.map((s) => s.dept)));

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

    const handleDeleteStaff = async (id: string) => {
        try {
            await API.deleteStaff(id);
            setStaff((prev) => prev.filter((s) => s.id !== id));
            close();
        } catch (error) {
            console.error('Failed to delete staff:', error);
        }
    };

    const openStaffSidesheet = (member: Staff) => {

        const leftPane = (
            <div>
                {buildLeftSection(
                    'Staff ID',
                    <Text size="sm" fw={500} data-er-field="STAFF.id">
                        {member.id}
                    </Text>
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
            <Stack>
                <Group justify="space-between" mb="md">
                    <Text fw={600}>
                        Departments ({departments.length})
                    </Text>

                    {isEditing && (
                        <Button
                            size="xs"
                            variant="light"
                            color="green"
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
                                        backgroundColor: '#e6f4ea',
                                    },
                                },
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                        >
                            <IconPlus size={16} />
                        </Button>
                    )}
                </Group>

                <Card padding="md" withBorder>
                    <Stack gap="xs">
                        <Group justify="space-between">
                            <Text fw={500} data-er-field="STAFF.role">
                                {member.role}
                            </Text>

                            {isEditing ? (
                                <Button
                                    size="xs"
                                    color="red"
                                    variant="light"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteStaff(member.id);
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
                                <Badge size="sm" data-er-field="STAFF.department_id">
                                    {member.dept}
                                </Badge>
                            )}
                        </Group>

                        <Text size="sm" c="dimmed" data-er-field="STAFF.department_id">
                            Department: {member.dept}
                        </Text>
                    </Stack>
                </Card>
            </Stack>
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
                        return;
                    }

                    close();
                    setIsEditing(false);
                }}
                saveLabel={isEditing ? 'Save Changes' : 'Edit Staff'}
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

    const openAddStaffSidesheet = () => {
        const leftPane = (
            <Stack>
                <Title order={5}>Basic Info</Title>

                <TextInput label="Staff ID / Employee ID" required />
                <TextInput label="Full Name" required />
                <TextInput label="Nickname" />
                <Select
                    label="Gender"
                    data={['Male', 'Female', 'Other']}
                />
                <DateInput label="Date of Birth" />
                <FileInput label="Profile Photo" accept="image/*" />

                <Divider my="md" />

                <Title order={5}>Contact Info</Title>
                <TextInput label="Phone Number" />
                <TextInput label="Email" type="email" />
                <Textarea label="Address" />
                <TextInput label="Emergency Contact" />
            </Stack>
        );

        const rightPane = (
            <Stack>
                <Title order={5}>Employment Info</Title>
                <TextInput label="Job Title / Position" />
                <Select label="Department / Unit" data={departments} />
                <Select
                    label="Employment Type"
                    data={['Full-time', 'Part-time', 'Contract']}
                />
                <DateInput label="Start Date" />
                <Select
                    label="Work Status"
                    data={['Active', 'On Leave', 'Resigned']}
                />

                <Divider my="md" />

                <Title order={5}>Professional Info</Title>
                <TextInput label="License Number / Certification" />
                <TextInput label="Specialization" />
                <NumberInput label="Years of Experience" min={0} />
                <Textarea label="Education / Training" />

                <Divider my="md" />

                <Title order={5}>Schedule</Title>
                <TextInput label="Work Schedule / Shift" />
                <TextInput label="Assigned Ward / Room" />
                <TextInput label="Supervisor / Manager" />

                <Divider my="md" />

                <Title order={5}>System Access</Title>
                <Select
                    label="Role"
                    data={['Admin', 'Staff', 'Doctor']}
                />
                <Select
                    label="Access Level / Permissions"
                    data={['Full', 'Limited', 'Read-only']}
                />
                <TextInput label="Last Login" disabled />

                <Divider my="md" />

                <Title order={5}>Optional</Title>
                <Textarea label="Notes / Remarks" />
                <FileInput
                    label="Uploaded Documents"
                    placeholder="Upload ID card, License, Contract"
                    multiple
                />
            </Stack>
        );

        const footer = (
            <AppSidesheetFooter
                onCancel={close}
                onSave={() => {
                    // TODO: handle create staff API
                    close();
                }}
                saveLabel="Create Staff"
            />
        );

        open({
            title: 'Add New Staff',
            subtitle: 'Create Staff Profile',
            leftPane,
            rightPane,
            footer,
        });
    };

    const handleRowClick = (member: Staff) => {
        setActiveStaff(member);
        setIsEditing(false);
        openStaffSidesheet(member);
    };

    useEffect(() => {
        if (!activeStaff) return;
        openStaffSidesheet(activeStaff);
    }, [isEditing, activeStaff]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <Group justify="space-between" mb="xl">
                <Title order={2}>Staff Management</Title>
                <Button leftSection={<IconPlus size={16} />} onClick={openAddStaffSidesheet}>
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
                                        <Text fw={500} data-er-field="STAFF.name">
                                            {member.name}
                                        </Text>
                                        <Text size="xs" c="dimmed" data-er-field="STAFF.id">
                                            ID: {member.id}
                                        </Text>
                                    </div>
                                </Group>
                            </Table.Td>

                            <Table.Td data-er-field="STAFF.department_id">
                                {member.dept}
                            </Table.Td>

                            <Table.Td data-er-field="STAFF.role">
                                {member.role}
                            </Table.Td>

                            <Table.Td>
                                <Badge color="green" data-er-field="STAFF.status">
                                    {member.status}
                                </Badge>
                            </Table.Td>

                            <Table.Td>
                                <Group justify="flex-end">
                                    <ActionIcon
                                        variant="subtle"
                                        onClick={(e) => {
                                            e.stopPropagation();
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
