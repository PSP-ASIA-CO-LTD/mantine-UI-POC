import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Title,
    Group,
    Card,
    Text,
    Stack,
    Badge,
    ActionIcon,
    Avatar,
    Divider,
    Grid,
} from '@mantine/core';
import { IconSearch, IconEye, IconPhone, IconMail, IconCalendar } from '@tabler/icons-react';
import { API } from '../api';
import { useSidesheet } from '../contexts/SidesheetContext';
import { CardList } from '../components/CardList';
import { SidesheetSection } from '../components/SidesheetSection';
import { StyledTable } from '../components/StyledTable';
import {
    TextInput,
    InlineTextInput,
    InlineLockedInput,
    InlineSelect,
    InlineDateInput,
    InlineTextarea
} from '../components/EditableFields';
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

const humanizeToken = (token?: string | null) => {
	if (!token) return '—';
	return token
		.split('_')
		.map((part) => (part.length > 0 ? part[0].toUpperCase() + part.slice(1) : part))
		.join(' ');
};

const prefixOptions = [
    { value: 'mr', label: 'Mr.' },
    { value: 'mrs', label: 'Mrs.' },
    { value: 'miss', label: 'Miss' },
    { value: 'ms', label: 'Ms.' },
    { value: 'dr', label: 'Dr.' },
];

const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
];

const maritalStatusOptions = [
    { value: 'single', label: 'Single' },
    { value: 'married', label: 'Married' },
    { value: 'divorced', label: 'Divorced' },
    { value: 'widowed', label: 'Widowed' },
];

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

    const handleUpdateResident = async (id: string, updates: Partial<Resident>) => {
        try {
            const updated = await API.updateResident(id, updates);
            if (updated) {
                setResidents(prev => prev.map(r => r.id === id ? updated : r));
                // Refresh the sidesheet with updated data
                openResidentSidesheet(updated);
            }
        } catch (error) {
            console.error('Failed to update resident:', error);
        }
    };

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

	const openResidentSidesheet = (resident: Resident) => {
		const residentGuardians = getGuardiansForResident(resident);
		const admissions = getAdmissionsForResident(resident.id);

		const leftPane = (
			<div className="patient-left-details">
                <Stack gap="md">
                    <Grid gutter="md">
                        <Grid.Col span={12}>
                            <InlineLockedInput
                                label="Resident ID"
                                value={resident.id}
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <InlineSelect
                                label="Prefix"
                                value={resident.prefix || null}
                                data={prefixOptions}
                                onSave={(val) => handleUpdateResident(resident.id, { prefix: (val as Resident['prefix']) || undefined })}
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <InlineTextInput
                                label="First Name"
                                value={resident.firstName}
                                onSave={(val) => handleUpdateResident(resident.id, { firstName: val })}
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <InlineTextInput
                                label="Last Name"
                                value={resident.lastName}
                                onSave={(val) => handleUpdateResident(resident.id, { lastName: val })}
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <InlineDateInput
                                label="Date of Birth"
                                value={resident.dateOfBirth ? new Date(resident.dateOfBirth) : null}
                                onSave={(val) => handleUpdateResident(resident.id, { dateOfBirth: val?.toISOString() || '' })}
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <InlineSelect
                                label="Gender"
                                value={resident.gender || null}
                                data={genderOptions}
                                onSave={(val) => handleUpdateResident(resident.id, { gender: (val as Resident['gender']) || undefined })}
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <InlineTextInput
                                label="ID Number"
                                value={resident.idNumber}
                                onSave={(val) => handleUpdateResident(resident.id, { idNumber: val })}
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <InlineTextInput
                                label="Hospital No. (HN)"
                                value={resident.hospitalNumber}
                                onSave={(val) => handleUpdateResident(resident.id, { hospitalNumber: val })}
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <InlineTextInput
                                label="Race"
                                value={resident.race}
                                onSave={(val) => handleUpdateResident(resident.id, { race: val })}
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <InlineTextInput
                                label="Nationality"
                                value={resident.nationality}
                                onSave={(val) => handleUpdateResident(resident.id, { nationality: val })}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <InlineTextInput
                                label="Religion"
                                value={resident.religion}
                                onSave={(val) => handleUpdateResident(resident.id, { religion: val })}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <InlineSelect
                                label="Marital Status"
                                value={resident.maritalStatus || null}
                                data={maritalStatusOptions}
                                onSave={(val) => handleUpdateResident(resident.id, { maritalStatus: val || undefined })}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <InlineTextInput
                                label="Occupation"
                                value={resident.occupation}
                                onSave={(val) => handleUpdateResident(resident.id, { occupation: val })}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <InlineTextInput
                                label="Blood Group"
                                value={resident.bloodGroup}
                                onSave={(val) => handleUpdateResident(resident.id, { bloodGroup: val })}
                            />
                        </Grid.Col>
                    </Grid>

                    <Divider my="xs" label="Contact Info" labelPosition="center" />

                    <Grid gutter="md">
                        <Grid.Col span={6}>
                            <InlineTextInput
                                label="Mobile Phone"
                                value={resident.phoneMobile}
                                onSave={(val) => handleUpdateResident(resident.id, { phoneMobile: val })}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <InlineTextInput
                                label="Home Phone"
                                value={resident.phoneHome}
                                onSave={(val) => handleUpdateResident(resident.id, { phoneHome: val })}
                            />
                        </Grid.Col>
                        <Grid.Col span={12}>
                            <InlineTextInput
                                label="Email"
                                value={resident.email}
                                onSave={(val) => handleUpdateResident(resident.id, { email: val })}
                            />
                        </Grid.Col>
                    </Grid>

                    <Divider my="xs" label="Address" labelPosition="center" />

                    <Grid gutter="md">
                        <Grid.Col span={4}>
                            <InlineTextInput
                                label="Address No."
                                value={resident.addressNumber}
                                onSave={(val) => handleUpdateResident(resident.id, { addressNumber: val })}
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <InlineTextInput
                                label="Moo"
                                value={resident.addressMoo}
                                onSave={(val) => handleUpdateResident(resident.id, { addressMoo: val })}
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <InlineTextInput
                                label="Village/Building"
                                value={resident.residenceName || resident.addressVillage}
                                onSave={(val) => handleUpdateResident(resident.id, { residenceName: val })}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <InlineTextInput
                                label="Street"
                                value={resident.addressStreet}
                                onSave={(val) => handleUpdateResident(resident.id, { addressStreet: val })}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <InlineTextInput
                                label="Soi"
                                value={resident.addressSoi}
                                onSave={(val) => handleUpdateResident(resident.id, { addressSoi: val })}
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <InlineTextInput
                                label="Sub-district"
                                value={resident.addressSubDistrict}
                                onSave={(val) => handleUpdateResident(resident.id, { addressSubDistrict: val })}
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <InlineTextInput
                                label="District"
                                value={resident.addressDistrict}
                                onSave={(val) => handleUpdateResident(resident.id, { addressDistrict: val })}
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <InlineTextInput
                                label="Province"
                                value={resident.addressProvince}
                                onSave={(val) => handleUpdateResident(resident.id, { addressProvince: val })}
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <InlineTextInput
                                label="Postal Code"
                                value={resident.addressPostalCode}
                                onSave={(val) => handleUpdateResident(resident.id, { addressPostalCode: val })}
                            />
                        </Grid.Col>
                    </Grid>

                    <Divider my="xs" label="Medical" labelPosition="center" />

                    <Grid gutter="md">
                        <Grid.Col span={12}>
                            <InlineTextarea
                                label="Medical Conditions"
                                value={resident.medicalConditions}
                                onSave={(val) => handleUpdateResident(resident.id, { medicalConditions: val })}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <InlineTextarea
                                label="Allergies"
                                value={resident.allergies}
                                onSave={(val) => handleUpdateResident(resident.id, { allergies: val })}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <InlineTextarea
                                label="Dietary Restrictions"
                                value={resident.dietaryRestrictions}
                                onSave={(val) => handleUpdateResident(resident.id, { dietaryRestrictions: val })}
                            />
                        </Grid.Col>
                    </Grid>

                    <Divider my="xs" label="Emergency Contact" labelPosition="center" />

                    <Grid gutter="md">
                        <Grid.Col span={6}>
                            <InlineTextInput
                                label="Emergency Contact Name"
                                value={resident.emergencyContactName}
                                onSave={(val) => handleUpdateResident(resident.id, { emergencyContactName: val })}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <InlineTextInput
                                label="Relationship to Resident"
                                value={resident.emergencyContactRelationship}
                                onSave={(val) => handleUpdateResident(resident.id, { emergencyContactRelationship: val })}
                            />
                        </Grid.Col>
                        <Grid.Col span={12}>
                            <InlineTextInput
                                label="Emergency Contact Phone"
                                value={resident.emergencyContact}
                                onSave={(val) => handleUpdateResident(resident.id, { emergencyContact: val })}
                            />
                        </Grid.Col>
                        <Grid.Col span={12}>
                            <InlineSelect
                                label="Emergency Contact Address Same as Resident"
                                value={resident.emergencyContactAddressSameAsResident ? 'yes' : 'no'}
                                data={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]}
                                onSave={(val) => handleUpdateResident(resident.id, { emergencyContactAddressSameAsResident: val === 'yes' })}
                            />
                        </Grid.Col>
                        <Grid.Col span={12}>
                            <InlineTextarea
                                label="Emergency Contact Address"
                                value={resident.emergencyContactAddressSameAsResident
                                    ? 'Same as resident address'
                                    : resident.emergencyContactAddress || ''}
                                onSave={(val) => handleUpdateResident(resident.id, { emergencyContactAddress: val })}
                                disabled={resident.emergencyContactAddressSameAsResident}
                            />
                        </Grid.Col>
                    </Grid>
                </Stack>
			</div>
		);

        const rightPane = (
            <>
                <SidesheetSection title={`Guardians (${residentGuardians.length})`}>
                    {residentGuardians.length > 0 ? (
                        <Stack gap="sm">
                            {residentGuardians.map((guardian) => (
                                <CardList
                                    key={guardian.id}
                                    title={(
                                        <Text fw={600} size="sm">
                                            <span data-er-field="GUARDIAN.first_name">{guardian.firstName || '—'}</span>{' '}
                                            <span data-er-field="GUARDIAN.last_name">{guardian.lastName || '—'}</span>
                                        </Text>
                                    )}
                                    badge={(
                                        <Group gap="xs">
                                            {guardian.id === resident.guardianId && (
                                                <Badge size="xs" color="blue" variant="light">Primary</Badge>
                                            )}
                                            {guardian.pays && (
                                                <Badge size="xs" color="green" variant="light">Pays</Badge>
                                            )}
                                        </Group>
                                    )}
                                    description={(
                                        <Stack gap={4}>
                                            <Group gap="xs">
                                                <IconPhone size={14} />
                                                <Text size="sm" data-er-field="GUARDIAN.phone">{guardian.phone || '—'}</Text>
                                            </Group>
                                            <Group gap="xs">
                                                <IconMail size={14} />
                                                <Text size="sm" data-er-field="GUARDIAN.email">{guardian.email || '—'}</Text>
                                            </Group>
                                            <Text size="xs" c="dimmed" data-er-field="GUARDIAN.address">{guardian.address || '—'}</Text>
                                            <Text size="xs" c="dimmed" data-er-field="GUARDIAN.relationship">
                                                Relationship: {humanizeToken(guardian.relationship)}
                                            </Text>
                                            <Text size="xs" c="dimmed" data-er-field="GUARDIAN.pays">
                                                Pays: {guardian.pays ? 'Yes' : 'No'}
                                            </Text>
                                        </Stack>
                                    )}
                                />
                            ))}
                        </Stack>
                    ) : (
                        <Text size="sm" c="dimmed">No guardians on file.</Text>
                    )}
                </SidesheetSection>

                <SidesheetSection title={`Admissions (${admissions.length})`}>
                    {admissions.length > 0 ? (
                        <Stack gap="md">
                            {admissions.map((order) => {
                                const room = roomsById.get(order.roomId);
                                return (
                                    <CardList
                                        key={order.id}
                                        title={<Text fw={600}>{order.packageName}</Text>}
                                        badge={(
                                            <Badge color={getStatusColor(order.status)} size="sm">
                                                {order.status.replace('_', ' ')}
                                            </Badge>
                                        )}
                                        description={(
                                            <Stack gap={4}>
                                                <Group gap="xs" c="dimmed">
                                                    <IconCalendar size={14} />
                                                    <Text size="sm">Arrive {formatDate(order.checkIn)}</Text>
                                                    <Text size="sm">•</Text>
                                                    <Text size="sm">Leave {formatDate(order.checkOut)}</Text>
                                                </Group>
                                                <Group gap="xs">
                                                    <Text size="sm" c="dimmed">Room</Text>
                                                    <Text size="sm">{room?.number || '—'}</Text>
                                                    <Text size="sm" c="dimmed">•</Text>
                                                    <Text size="sm" c="dimmed">Days</Text>
                                                    <Text size="sm">{order.adjustedDays}</Text>
                                                </Group>
                                                <Text size="sm" fw={500}>
                                                    ฿{formatCurrency(order.adjustedPrice)}
                                                </Text>
                                            </Stack>
                                        )}
                                    />
                                );
                            })}
                        </Stack>
                    ) : (
                        <Text c="dimmed">No admissions yet.</Text>
                    )}
                </SidesheetSection>
            </>
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
                    <StyledTable>
                        <StyledTable.Thead>
                            <StyledTable.Tr>
                                <StyledTable.Th>Resident</StyledTable.Th>
                                <StyledTable.Th>Guardians</StyledTable.Th>
                                <StyledTable.Th>Latest Admission</StyledTable.Th>
                                <StyledTable.Th>Status</StyledTable.Th>
                                <StyledTable.Th></StyledTable.Th>
                            </StyledTable.Tr>
                        </StyledTable.Thead>
                        <StyledTable.Tbody>
                            {filteredResidents.map((resident) => {
                                const residentGuardians = getGuardiansForResident(resident);
                                const primaryGuardian =
                                    residentGuardians.find((guardian) => guardian.id === resident.guardianId) ||
                                    residentGuardians[0];
                                const admissions = getAdmissionsForResident(resident.id);
                                const latestAdmission = admissions[0];
                                const latestStatus = latestAdmission?.status;

                                return (
                                    <StyledTable.Tr
                                        key={resident.id}
                                        className="patient-table-row"
                                        onClick={() => openResidentSidesheet(resident)}
                                    >
                                        <StyledTable.Td>
                                            <Group gap="sm">
                                                <Avatar color="blue" radius="xl">
                                                    {resident.firstName?.[0] || 'R'}
                                                </Avatar>
                                                <div>
                                                    <Text fw={600}>{resident.firstName} {resident.lastName}</Text>
                                                    <Text size="xs" c="dimmed">ID: {resident.id}</Text>
                                                </div>
                                            </Group>
                                        </StyledTable.Td>
                                        <StyledTable.Td>
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
                                        </StyledTable.Td>
                                        <StyledTable.Td>
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
                                        </StyledTable.Td>
                                        <StyledTable.Td>
                                            {latestStatus ? (
                                                <Badge size="sm" color={getStatusColor(latestStatus)}>
                                                    {latestStatus.replace('_', ' ')}
                                                </Badge>
                                            ) : (
                                                <Badge size="sm" color="gray">—</Badge>
                                            )}
                                        </StyledTable.Td>
                                        <StyledTable.Td>
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
                                        </StyledTable.Td>
                                    </StyledTable.Tr>
                                );
                            })}
                        </StyledTable.Tbody>
                    </StyledTable>
                ) : (
                    <Text c="dimmed" ta="center" py="xl">No residents found</Text>
                )}
            </Card>
        </div>
    );
}
