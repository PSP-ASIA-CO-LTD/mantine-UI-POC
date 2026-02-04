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
    Card,
    Stack,
    TextInput,
    Select,
    Textarea,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconPlus, IconDotsVertical, IconMinus } from '@tabler/icons-react';
import { API } from '../api';
import { useSidesheet } from '../contexts/SidesheetContext';
import { AppSidesheetFooter } from '../components/AppSidesheetFooter';
import { buildLeftSection } from '../utils/sidesheetHelper';
import type { Patient } from '../types';

export function Patient() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [activePatient, setActivePatient] = useState<Patient | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    const { open, close } = useSidesheet();

    useEffect(() => {
        const loadPatients = async () => {
            try {
                const data = await API.getPatients();
                setPatients(data);
            } catch (error) {
                console.error('Failed to load patients:', error);
            } finally {
                setLoading(false);
            }
        };
        loadPatients();
    }, []);

    const handleDeletePatient = async (id: string) => {
        try {
            await API.deletePatient(id);
            setPatients((prev) => prev.filter((p) => p.id !== id));
            close();
        } catch (error) {
            console.error('Failed to delete patient:', error);
        }
    };

    const openPatientSidesheet = (patient: Patient) => {
        const leftPane = (
            <div>
                {buildLeftSection(
                    'Patient ID / HN',
                    <Text size="sm" fw={500} data-er-field="PATIENT.hn">
                        {patient.hn}
                    </Text>
                )}

                <Divider my="xl" />

                {buildLeftSection(
                    'Gender',
                    <Badge color="gray" size="lg" data-er-field="PATIENT.gender">
                        {patient.gender}
                    </Badge>
                )}

                <Divider my="xl" />

                {buildLeftSection(
                    'Status',
                    <Badge color="green" size="lg" data-er-field="PATIENT.status">
                        {patient.status}
                    </Badge>
                )}
            </div>
        );

        const rightPane = (
            <Stack>
                <Group justify="space-between" mb="md">
                    <Text fw={600}>Medical Overview</Text>

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
                            <Text fw={500} data-er-field="PATIENT.fullName">
                                {patient.fullName}
                            </Text>

                            {isEditing ? (
                                <Button
                                    size="xs"
                                    color="red"
                                    variant="light"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeletePatient(patient.id);
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
                                <Badge size="sm" data-er-field="PATIENT.status">
                                    {patient.status}
                                </Badge>
                            )}
                        </Group>

                        <Text size="sm" c="dimmed" data-er-field="PATIENT.hn">
                            HN: {patient.hn}
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
                saveLabel={isEditing ? 'Save Changes' : 'Edit Patient'}
            />
        );

        open({
            title: patient.fullName,
            titleDataAttribute: 'PATIENT.fullName',
            subtitle: 'Patient Details',
            leftPane,
            rightPane,
            footer,
        });
    };

    const openAddPatientSidesheet = () => {
        const leftPane = (
            <Stack>
                <Title order={5}>Patient Information</Title>

                <TextInput label="Patient ID / HN" required />
                <TextInput label="National ID / Passport" />
                <TextInput label="Full Name" required />
                <Select
                    label="Gender"
                    data={['Male', 'Female', 'Other']}
                />
                <DateInput label="Date of Birth" />

                <Divider my="md" />

                <Title order={5}>Medical Info</Title>
                <Select
                    label="Blood Type"
                    data={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']}
                />
                <TextInput label="Medical Coverage / Healthcare Entitlement" />
                <Textarea label="Drug Allergies" />
                <Textarea label="Chronic Conditions / Medical History" />
            </Stack>
        );

        const rightPane = (
            <Stack>
                <Title order={5}>Emergency Contact</Title>
                <TextInput label="Contact Name" />
                <TextInput label="Relationship" />
                <TextInput label="Phone Number" />

                <Divider my="md" />

                <Title order={5}>Clinical Info</Title>
                <TextInput label="Blood Pressure (BP)" />
                <TextInput label="Heart Rate (HR)" />
                <TextInput label="Temperature (Temp)" />
                <TextInput label="SpO₂" />
                <Textarea label="Diagnosis" />
                <Textarea label="Treatment Plan / Care Plan" />
                <Textarea label="Medication Orders & Dosage" />
                <Select
                    label="Patient Status"
                    data={['Admitted', 'Discharged', 'Follow-up']}
                />
            </Stack>
        );

        const footer = (
            <AppSidesheetFooter
                onCancel={close}
                onSave={() => {
                    // TODO: handle create patient API
                    close();
                }}
                saveLabel="Create Patient"
            />
        );

        open({
            title: 'Add New Patient',
            subtitle: 'Create Patient Profile',
            leftPane,
            rightPane,
            footer,
        });
    };

    const handleRowClick = (patient: Patient) => {
        setActivePatient(patient);
        setIsEditing(false);
        openPatientSidesheet(patient);
    };

    useEffect(() => {
        if (!activePatient) return;
        openPatientSidesheet(activePatient);
    }, [isEditing, activePatient]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <Group justify="space-between" mb="xl">
                <Title order={2}>Patient Management</Title>
                <Button leftSection={<IconPlus size={16} />} onClick={openAddPatientSidesheet}>
                    Add Patient
                </Button>
            </Group>

            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Name</Table.Th>
                        <Table.Th>HN</Table.Th>
                        <Table.Th>Gender</Table.Th>
                        <Table.Th>Status</Table.Th>
                        <Table.Th style={{ textAlign: 'right' }}>Actions</Table.Th>
                    </Table.Tr>
                </Table.Thead>

                <Table.Tbody>
                    {patients.map((patient) => (
                        <Table.Tr
                            key={patient.id}
                            data-er-field="PATIENT"
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleRowClick(patient)}
                        >
                            <Table.Td>
                                <Group gap="sm">
                                    <Avatar color="teal" radius="md">
                                        {patient.fullName.charAt(0)}
                                    </Avatar>
                                    <div>
                                        <Text fw={500} data-er-field="PATIENT.fullName">
                                            {patient.fullName}
                                        </Text>
                                        <Text size="xs" c="dimmed" data-er-field="PATIENT.id">
                                            ID: {patient.id}
                                        </Text>
                                    </div>
                                </Group>
                            </Table.Td>

                            <Table.Td data-er-field="PATIENT.hn">
                                {patient.hn}
                            </Table.Td>

                            <Table.Td data-er-field="PATIENT.gender">
                                {patient.gender}
                            </Table.Td>

                            <Table.Td>
                                <Badge color="green" data-er-field="PATIENT.status">
                                    {patient.status}
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




