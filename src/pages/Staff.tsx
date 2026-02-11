import { useEffect, useMemo, useState } from 'react';
import {
    Title,
    Group,
    Button,
    Avatar,
    Badge,
    ActionIcon,
    Text,
    Divider,
    Stack,
} from '@mantine/core';
import { IconPlus, IconDotsVertical, IconSearch } from '@tabler/icons-react';
import { API } from '../api';
import { useSidesheet } from '../contexts/SidesheetContext';
import { AppSidesheetFooter } from '../components/AppSidesheetFooter';
import { StyledTable } from '../components/StyledTable';
import { PageHeader } from '../components/PageHeader';
import {
    TextInput,
    Select,
    Textarea,
    FileInput,
    NumberInput,
    DateInput,
    InlineTextInput,
    InlineSelect,
    InlineLockedInput,
} from '../components/EditableFields';
import type { Staff } from '../types';

export function Staff() {
    const [staff, setStaff] = useState<Staff[]>([]);
    const [departments, setDepartments] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeStaff, setActiveStaff] = useState<Staff | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [search, setSearch] = useState('');
    const [draftStaff, setDraftStaff] = useState({
        id: '',
        name: '',
        role: '',
        dept: '',
        status: 'Active',
    });
    const { open, close } = useSidesheet();

    useEffect(() => {
        const loadStaff = async () => {
            try {
                const [staffData, departmentData] = await Promise.all([
                    API.getStaff(),
                    API.getDepartments(),
                ]);
                setStaff(staffData);
                setDepartments(departmentData.map((dept) => dept.name));
            } catch (error) {
                console.error('Failed to load staff:', error);
            } finally {
                setLoading(false);
            }
        };
        loadStaff();
    }, []);

    const handleUpdateStaff = async (id: string, updates: Partial<Staff>) => {
        try {
            const updated = await API.updateStaff(id, updates);
            if (updated) {
                setStaff((prev) => prev.map((s) => (s.id === id ? updated : s)));
                setActiveStaff(updated);
            }
        } catch (error) {
            console.error('Failed to update staff:', error);
        }
    };

    const filteredStaff = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return staff;

        return staff.filter((member) => {
            const haystack = [
                member.id,
                member.name,
                member.role,
                member.dept,
            ]
                .join(' ')
                .toLowerCase();

            return haystack.includes(query);
        });
    }, [search, staff]);

    const openStaffSidesheet = (member: Staff) => {
        const leftPane = (
            <Stack gap="md">
                <InlineLockedInput
                    label="Staff ID"
                    value={member.id}
                />

                <InlineTextInput
                    label="Full Name"
                    value={member.name}
                    onSave={(val) => handleUpdateStaff(member.id, { name: val })}
                />

                <InlineSelect
                    label="Department"
                    value={member.dept}
                    data={departments}
                    onSave={(val) => handleUpdateStaff(member.id, { dept: val || '' })}
                />

                <InlineSelect
                    label="Status"
                    value={member.status}
                    data={['Active', 'On Leave', 'Resigned']}
                    onSave={(val) => handleUpdateStaff(member.id, { status: val || 'Active' })}
                />
            </Stack>
        );

        const rightPane = (
            <div>
                <Group justify="space-between" mb="md">
                    <Text fw={600}>
                        Professional Info
                    </Text>
                </Group>

                <Stack gap="md">
                    <InlineTextInput
                        label="Job Title / Position"
                        value={member.role}
                        onSave={(val) => handleUpdateStaff(member.id, { role: val })}
                    />
                    <InlineSelect
                        label="Assigned Department"
                        value={member.dept}
                        data={departments}
                        onSave={(val) => handleUpdateStaff(member.id, { dept: val || '' })}
                    />
                </Stack>
            </div>
        );
        const footer = (
            <AppSidesheetFooter
                onCancel={() => {
                    setIsEditing(false);
                    close();
                }}
                onSave={close}
                saveLabel="Done"
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
        setDraftStaff({
            id: '',
            name: '',
            role: '',
            dept: '',
            status: 'Active',
        });
        const leftPane = (
            <Stack>
                <Title order={5}>Basic Info</Title>

                <TextInput
                    label="Staff ID / Employee ID"
                    value={draftStaff.id}
                    onChange={(e) => setDraftStaff((prev) => ({ ...prev, id: e.target.value }))}
                />
                <TextInput
                    label="Full Name"
                    required
                    value={draftStaff.name}
                    onChange={(e) => setDraftStaff((prev) => ({ ...prev, name: e.target.value }))}
                />
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
                <TextInput
                    label="Job Title / Position"
                    value={draftStaff.role}
                    onChange={(e) => setDraftStaff((prev) => ({ ...prev, role: e.target.value }))}
                />
                <Select
                    label="Department / Unit"
                    data={departments}
                    value={draftStaff.dept}
                    onChange={(value) => setDraftStaff((prev) => ({ ...prev, dept: value || '' }))}
                    searchable
                    clearable
                />
                <Select
                    label="Employment Type"
                    data={['Full-time', 'Part-time', 'Contract']}
                />
                <DateInput label="Start Date" />
                <Select
                    label="Work Status"
                    data={['Active', 'On Leave', 'Resigned']}
                    value={draftStaff.status}
                    onChange={(value) => setDraftStaff((prev) => ({ ...prev, status: value || 'Active' }))}
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
                onSave={async () => {
                    const name = draftStaff.name.trim();
                    const dept = draftStaff.dept.trim() || 'Unassigned';
                    const role = draftStaff.role.trim() || 'Staff';
                    const status = draftStaff.status.trim() || 'Active';
                    if (!name) {
                        console.error('Staff name is required');
                        return;
                    }
                    try {
                        const created = await API.createStaff({
                            id: draftStaff.id.trim() || undefined,
                            name,
                            dept,
                            role,
                            status,
                        });
                        setStaff((prev) => [...prev, created]);
                        close();
                    } catch (error) {
                        console.error('Failed to create staff:', error);
                    }
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
            <PageHeader
                title="Staff Management"
                subtitle="Manage your facility staff and departments."
                actions={
                    <Button leftSection={<IconPlus size={16} />} onClick={openAddStaffSidesheet}>
                        Add Staff
                    </Button>
                }
            />

            <Group justify="space-between" mb="md" mt="xl">
                <Text fw={600} size="lg">Staff ({filteredStaff.length})</Text>
                <TextInput
                    placeholder="Search staff, role, or ID"
                    value={search}
                    onChange={(event) => setSearch(event.currentTarget.value)}
                    leftSection={<IconSearch size={16} />}
                    style={{ width: 280 }}
                />
            </Group>


            <StyledTable>
                <StyledTable.Thead>
                    <StyledTable.Tr>
                        <StyledTable.Th>Name</StyledTable.Th>
                        <StyledTable.Th>Department</StyledTable.Th>
                        <StyledTable.Th>Role</StyledTable.Th>
                        <StyledTable.Th>Status</StyledTable.Th>
                        <StyledTable.Th style={{ textAlign: 'right' }}>Actions</StyledTable.Th>
                    </StyledTable.Tr>
                </StyledTable.Thead>

                <StyledTable.Tbody>
                    {filteredStaff.map((member) => (
                        <StyledTable.Tr
                            key={member.id}
                            data-er-field="STAFF"
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleRowClick(member)}
                        >
                            <StyledTable.Td>
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
                            </StyledTable.Td>

                            <StyledTable.Td data-er-field="STAFF.department_id">
                                {member.dept}
                            </StyledTable.Td>

                            <StyledTable.Td data-er-field="STAFF.role">
                                {member.role}
                            </StyledTable.Td>

                            <StyledTable.Td>
                                <Badge color="green" data-er-field="STAFF.status">
                                    {member.status}
                                </Badge>
                            </StyledTable.Td>

                            <StyledTable.Td>
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
                            </StyledTable.Td>
                        </StyledTable.Tr>
                    ))}
                </StyledTable.Tbody>
            </StyledTable>
        </div>
    );
}
