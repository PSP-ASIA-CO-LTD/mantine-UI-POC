import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Title,
    Group,
    Card,
    Text,
    Stack,
    Badge,
    Table,
    TextInput,
    ActionIcon,
    Avatar,
    Divider,
} from '@mantine/core';
import { IconSearch, IconEye, IconPhone, IconMail, IconCalendar } from '@tabler/icons-react';
import { API } from '../api';
import { useSidesheet } from '../contexts/SidesheetContext';
import { buildLeftSection } from '../utils/sidesheetHelper';
import type { Guardian, Resident, SalesOrder, Room } from '../types';
import './Patient.css';

const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};

const formatCurrency = (amount?: number | null) => {
    if (!amount) return '0';
    return new Intl.NumberFormat('th-TH').format(amount);
};

const getStatusColor = (status: SalesOrder['status']) => {
    const colors: Record<SalesOrder['status'], string> = {
        draft: 'gray',
        pending_payment: 'yellow',
        paid: 'green',
        active: 'blue',
        completed: 'teal',
        cancelled: 'red'
    };
    return colors[status];
};

export function Patient() {
    const [residents, setResidents] = useState<Resident[]>([]);
    const [guardians, setGuardians] = useState<Guardian[]>([]);
    const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const { open } = useSidesheet();

    useEffect(() => {
        const loadData = async () => {
            try {
                const [residentData, guardianData, salesOrderData, roomData] = await Promise.all([
                    API.getResidents(),
                    API.getGuardians(),
                    API.getSalesOrders(),
                    API.getRooms(),
                ]);
                setResidents(residentData);
                setGuardians(guardianData);
                setSalesOrders(salesOrderData);
                setRooms(roomData);
            } catch (error) {
                console.error('Failed to load patient data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const roomsById = useMemo(() => {
        return new Map(rooms.map((room) => [room.id, room]));
    }, [rooms]);

    const guardiansByResident = useMemo(() => {
        const map = new Map<string, Guardian[]>();
        guardians.forEach((guardian) => {
            if (!guardian.residentId) return;
            const list = map.get(guardian.residentId) || [];
            list.push(guardian);
            map.set(guardian.residentId, list);
        });
        return map;
    }, [guardians]);

    const admissionsByResident = useMemo(() => {
        const map = new Map<string, SalesOrder[]>();
        salesOrders.forEach((order) => {
            const list = map.get(order.residentId) || [];
            list.push(order);
            map.set(order.residentId, list);
        });
        map.forEach((list) => {
            list.sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime());
        });
        return map;
    }, [salesOrders]);

    const getGuardiansForResident = useCallback((resident: Resident) => {
        const linked = guardiansByResident.get(resident.id) || [];
        const primary = guardians.find((guardian) => guardian.id === resident.guardianId);
        if (primary && !linked.some((guardian) => guardian.id === primary.id)) {
            return [primary, ...linked];
        }
        return linked;
    }, [guardians, guardiansByResident]);

    const getAdmissionsForResident = (residentId: string) => {
        return admissionsByResident.get(residentId) || [];
    };

    const buildGuardianCards = (resident: Resident) => {
        const residentGuardians = getGuardiansForResident(resident);
        if (residentGuardians.length === 0) {
            return <Text size="sm" c="dimmed">No guardians on file.</Text>;
        }

        return (
            <Stack gap="sm">
                {residentGuardians.map((guardian) => (
                    <Card key={guardian.id} padding="md" withBorder className="patient-guardian-card">
                        <Group justify="space-between" mb="xs">
                            <Text fw={600} size="sm">
                                {guardian.firstName} {guardian.lastName}
                            </Text>
                            <Group gap="xs">
                                {guardian.id === resident.guardianId && (
                                    <Badge size="xs" color="blue" variant="light">Primary</Badge>
                                )}
                                {guardian.pays && (
                                    <Badge size="xs" color="green" variant="light">Pays</Badge>
                                )}
                            </Group>
                        </Group>
                        <Stack gap={4}>
                            <Group gap="xs">
                                <IconPhone size={14} />
                                <Text size="sm">{guardian.phone || '—'}</Text>
                            </Group>
                            <Group gap="xs">
                                <IconMail size={14} />
                                <Text size="sm">{guardian.email || '—'}</Text>
                            </Group>
                            <Text size="xs" c="dimmed">Relationship: {guardian.relationship || '—'}</Text>
                        </Stack>
                    </Card>
                ))}
            </Stack>
        );
    };

    const openResidentSidesheet = (resident: Resident) => {
        const residentGuardians = getGuardiansForResident(resident);
        const admissions = getAdmissionsForResident(resident.id);

        const leftPane = (
            <div className="patient-left-pane">
                <div className="patient-left-details">
                    {buildLeftSection(
                        'Resident ID',
                        <Text size="sm" fw={500} data-er-field="RESIDENT.id">
                            {resident.id}
                        </Text>
                    )}

                    <Divider my="md" />

                    {buildLeftSection(
                        'Date of Birth',
                        <Text size="sm" data-er-field="RESIDENT.date_of_birth">
                            {formatDate(resident.dateOfBirth)}
                        </Text>
                    )}

                    {buildLeftSection(
                        'Gender',
                        <Badge color="gray" size="lg" data-er-field="RESIDENT.gender">
                            {resident.gender || '—'}
                        </Badge>
                    )}

                    {buildLeftSection(
                        'ID Number',
                        <Text size="sm" data-er-field="RESIDENT.id_number">
                            {resident.idNumber || '—'}
                        </Text>
                    )}

                    <Divider my="md" />

                    {buildLeftSection(
                        'Medical Conditions',
                        <Text size="sm" c="dimmed" data-er-field="RESIDENT.medical_conditions">
                            {resident.medicalConditions || '—'}
                        </Text>
                    )}

                    {buildLeftSection(
                        'Allergies',
                        <Text size="sm" c="dimmed" data-er-field="RESIDENT.allergies">
                            {resident.allergies || '—'}
                        </Text>
                    )}

                    {buildLeftSection(
                        'Dietary Restrictions',
                        <Text size="sm" c="dimmed" data-er-field="RESIDENT.dietary_restrictions">
                            {resident.dietaryRestrictions || '—'}
                        </Text>
                    )}

                    {buildLeftSection(
                        'Emergency Contact',
                        <Text size="sm" data-er-field="RESIDENT.emergency_contact">
                            {resident.emergencyContact || '—'}
                        </Text>
                    )}
                </div>
            </div>
        );

        const rightPane = (
            <div className="patient-right-pane">
                <div className="patient-right-guardians">
                    <Group justify="space-between" mb="sm">
                        <Text fw={600}>Guardians ({residentGuardians.length})</Text>
                    </Group>
                    {buildGuardianCards(resident)}
                </div>

                <Divider my="md" />

                <Group justify="space-between" mb="md">
                    <Text fw={600}>Admissions ({admissions.length})</Text>
                    {admissions[0] && (
                        <Badge color={getStatusColor(admissions[0].status)} size="sm">
                            {admissions[0].status.replace('_', ' ')}
                        </Badge>
                    )}
                </Group>

                {admissions.length > 0 ? (
                    <Stack gap="md">
                        {admissions.map((order) => {
                            const room = roomsById.get(order.roomId);
                            return (
                                <Card key={order.id} padding="md" withBorder className="patient-admission-card">
                                    <Group justify="space-between" mb="xs">
                                        <Text fw={600}>{order.packageName}</Text>
                                        <Badge color={getStatusColor(order.status)} size="sm">
                                            {order.status.replace('_', ' ')}
                                        </Badge>
                                    </Group>
                                    <Group gap="xs" c="dimmed">
                                        <IconCalendar size={14} />
                                        <Text size="sm">Arrive {formatDate(order.checkIn)}</Text>
                                        <Text size="sm">•</Text>
                                        <Text size="sm">Leave {formatDate(order.checkOut)}</Text>
                                    </Group>
                                    <Group gap="xs" mt="xs">
                                        <Text size="sm" c="dimmed">Room</Text>
                                        <Text size="sm">{room?.number || '—'}</Text>
                                        <Text size="sm" c="dimmed">•</Text>
                                        <Text size="sm" c="dimmed">Days</Text>
                                        <Text size="sm">{order.adjustedDays}</Text>
                                    </Group>
                                    <Text size="sm" fw={500} mt="xs">
                                        ฿{formatCurrency(order.adjustedPrice)}
                                    </Text>
                                </Card>
                            );
                        })}
                    </Stack>
                ) : (
                    <Text c="dimmed">No admissions yet.</Text>
                )}
            </div>
        );

        open({
            title: `${resident.firstName} ${resident.lastName}`,
            subtitle: 'Resident Profile',
            leftPane,
            rightPane,
        });
    };

    const filteredResidents = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return residents;

        return residents.filter((resident) => {
            const residentGuardians = getGuardiansForResident(resident);
            const haystack = [
                resident.id,
                resident.firstName,
                resident.lastName,
                resident.idNumber,
                residentGuardians.map((guardian) => guardian.firstName).join(' '),
                residentGuardians.map((guardian) => guardian.lastName).join(' '),
                residentGuardians.map((guardian) => guardian.phone).join(' '),
            ]
                .join(' ')
                .toLowerCase();

            return haystack.includes(query);
        });
    }, [search, residents, getGuardiansForResident]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="patient-page">
            <Group justify="space-between" align="flex-end">
                <div>
                    <Title order={2}>Patient</Title>
                    <Text size="sm" c="dimmed">Search residents and review guardian details.</Text>
                </div>
                <TextInput
                    className="patient-search"
                    placeholder="Search resident, guardian, or ID"
                    value={search}
                    onChange={(event) => setSearch(event.currentTarget.value)}
                    leftSection={<IconSearch size={16} />}
                />
            </Group>

            <Card padding="lg" radius="md" withBorder>
                <Group justify="space-between" mb="md">
                    <Text fw={600}>Residents ({filteredResidents.length})</Text>
                </Group>

                {filteredResidents.length > 0 ? (
                    <Table>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Resident</Table.Th>
                                <Table.Th>Guardians</Table.Th>
                                <Table.Th>Latest Admission</Table.Th>
                                <Table.Th>Status</Table.Th>
                                <Table.Th></Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {filteredResidents.map((resident) => {
                                const residentGuardians = getGuardiansForResident(resident);
                                const primaryGuardian =
                                    residentGuardians.find((guardian) => guardian.id === resident.guardianId) ||
                                    residentGuardians[0];
                                const admissions = getAdmissionsForResident(resident.id);
                                const latestAdmission = admissions[0];
                                const latestStatus = latestAdmission?.status;

                                return (
                                    <Table.Tr
                                        key={resident.id}
                                        className="patient-table-row"
                                        onClick={() => openResidentSidesheet(resident)}
                                    >
                                        <Table.Td>
                                            <Group gap="sm">
                                                <Avatar color="blue" radius="xl">
                                                    {resident.firstName?.[0] || 'R'}
                                                </Avatar>
                                                <div>
                                                    <Text fw={600}>{resident.firstName} {resident.lastName}</Text>
                                                    <Text size="xs" c="dimmed">ID: {resident.id}</Text>
                                                </div>
                                            </Group>
                                        </Table.Td>
                                        <Table.Td>
                                            {primaryGuardian ? (
                                                <Stack gap={2}>
                                                    <Text size="sm" fw={500}>
                                                        {primaryGuardian.firstName} {primaryGuardian.lastName}
                                                    </Text>
                                                    <Text size="xs" c="dimmed">
                                                        {residentGuardians.length} guardian{residentGuardians.length === 1 ? '' : 's'}
                                                    </Text>
                                                </Stack>
                                            ) : (
                                                <Text size="sm" c="dimmed">No guardian</Text>
                                            )}
                                        </Table.Td>
                                        <Table.Td>
                                            {latestAdmission ? (
                                                <Stack gap={2}>
                                                    <Text size="sm">{latestAdmission.packageName}</Text>
                                                    <Text size="xs" c="dimmed">
                                                        {formatDate(latestAdmission.checkIn)} - {formatDate(latestAdmission.checkOut)}
                                                    </Text>
                                                </Stack>
                                            ) : (
                                                <Text size="sm" c="dimmed">No admissions</Text>
                                            )}
                                        </Table.Td>
                                        <Table.Td>
                                            {latestStatus ? (
                                                <Badge size="sm" color={getStatusColor(latestStatus)}>
                                                    {latestStatus.replace('_', ' ')}
                                                </Badge>
                                            ) : (
                                                <Badge size="sm" color="gray">—</Badge>
                                            )}
                                        </Table.Td>
                                        <Table.Td>
                                            <ActionIcon
                                                variant="subtle"
                                                size="sm"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    openResidentSidesheet(resident);
                                                }}
                                                title="View profile"
                                            >
                                                <IconEye size={16} />
                                            </ActionIcon>
                                        </Table.Td>
                                    </Table.Tr>
                                );
                            })}
                        </Table.Tbody>
                    </Table>
                ) : (
                    <Text c="dimmed" ta="center" py="xl">No residents found</Text>
                )}
            </Card>
        </div>
    );
}
