import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Title,
    Group,
    Button,
    Card,
    Text,
    Stack,
    Badge,
    ActionIcon,
    Indicator,
    Popover,
    ScrollArea,
    Divider,
} from '@mantine/core';
import {
    IconPlus,
    IconBell,
    IconEye,
    IconCurrencyBaht,
    IconUsers,
    IconReceipt,
    IconClock
} from '@tabler/icons-react';
import { API } from '../api';
import { useSalesOrder } from '../contexts/SalesOrderContext';
import { useSidesheet } from '../contexts/SidesheetContext';
import { StyledTable } from '../components/StyledTable';
import { buildLeftSection } from '../utils/sidesheetHelper';
import type { SalesDashboardStats, Notification, SalesOrder, Resident, Guardian, Room } from '../types';
import './SalesDashboard.css';

export function SalesDashboard() {
    const navigate = useNavigate();
    const { initNewDraft } = useSalesOrder();
    const { open } = useSidesheet();
    const [stats, setStats] = useState<SalesDashboardStats | null>(null);
    const [dashboardNotifications, setDashboardNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [residents, setResidents] = useState<Resident[]>([]);
    const [guardians, setGuardians] = useState<Guardian[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);

    const loadData = async () => {
        try {
            const [statsData, notifData, residentData, guardianData, roomData] = await Promise.all([
                API.getSalesDashboardStats(),
                API.getNotifications(),
                API.getResidents(),
                API.getGuardians(),
                API.getRooms(),
            ]);
            setStats(statsData);
            setDashboardNotifications(notifData);
            setUnreadCount(notifData.filter(n => !n.readAt).length);
            setResidents(residentData);
            setGuardians(guardianData);
            setRooms(roomData);
        } catch (error) {
            console.error('Failed to load dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleMarkRead = async (id: string) => {
        await API.markNotificationRead(id);
        setDashboardNotifications((prev: Notification[]) =>
            prev.map(n => n.id === id ? { ...n, readAt: new Date().toISOString() } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('th-TH', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatCurrency = (amount: number) => {
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

    const residentsById = useMemo(() => new Map(residents.map(resident => [resident.id, resident])), [residents]);
    const guardiansById = useMemo(() => new Map(guardians.map(guardian => [guardian.id, guardian])), [guardians]);
    const roomsById = useMemo(() => new Map(rooms.map(room => [room.id, room])), [rooms]);

    const getResidentName = (residentId?: string) => {
        if (!residentId) return 'Unknown resident';
        const resident = residentsById.get(residentId);
        return resident ? `${resident.firstName} ${resident.lastName}` : `Resident ${residentId}`;
    };

    const getGuardianName = (guardianId?: string) => {
        if (!guardianId) return 'Unknown guardian';
        const guardian = guardiansById.get(guardianId);
        return guardian ? `${guardian.firstName} ${guardian.lastName}` : `Guardian ${guardianId}`;
    };

    const openSalesOrderSidesheet = (order: SalesOrder) => {
        const resident = residentsById.get(order.residentId);
        const guardian = guardiansById.get(order.guardianId);
        const room = roomsById.get(order.roomId);

        const leftPane = (
            <div>
                {buildLeftSection(
                    'Order ID',
                    <Text size="sm" fw={500}>
                        {order.id}
                    </Text>
                )}

                <Divider my="lg" />

                {buildLeftSection(
                    'Status',
                    <Badge color={getStatusColor(order.status)} size="lg">
                        {order.status.replace('_', ' ')}
                    </Badge>
                )}

                <Divider my="lg" />

                {buildLeftSection(
                    'Package',
                    <Text size="sm" fw={500}>
                        {order.packageName}
                    </Text>
                )}

                {buildLeftSection(
                    'Stay',
                    <Stack gap={2}>
                        <Text size="sm">
                            {formatDate(order.checkIn)} - {formatDate(order.checkOut)}
                        </Text>
                        <Text size="xs" c="dimmed">
                            {order.adjustedDays} days
                        </Text>
                    </Stack>
                )}

                {buildLeftSection(
                    'Total',
                    <Text size="sm" fw={600}>
                        ฿{formatCurrency(order.adjustedPrice)}
                    </Text>
                )}

                {buildLeftSection(
                    'Ordered',
                    <Text size="sm">
                        {formatDate(order.createdAt)}
                    </Text>
                )}
            </div>
        );

        const rightPane = (
            <Stack>
                <Card withBorder padding="md">
                    <Text fw={600} mb="xs">Resident</Text>
                    {resident ? (
                        <Stack gap={2}>
                            <Text size="sm" fw={500}>{resident.firstName} {resident.lastName}</Text>
                            <Text size="xs" c="dimmed">ID: {resident.id}</Text>
                        </Stack>
                    ) : (
                        <Text size="sm" c="dimmed">Resident details not available.</Text>
                    )}
                </Card>

                <Card withBorder padding="md">
                    <Text fw={600} mb="xs">Guardian</Text>
                    {guardian ? (
                        <Stack gap={2}>
                            <Text size="sm" fw={500}>{guardian.firstName} {guardian.lastName}</Text>
                            <Text size="xs" c="dimmed">{guardian.phone}</Text>
                            <Text size="xs" c="dimmed">{guardian.email}</Text>
                        </Stack>
                    ) : (
                        <Text size="sm" c="dimmed">Guardian details not available.</Text>
                    )}
                </Card>

                <Card withBorder padding="md">
                    <Text fw={600} mb="xs">Room</Text>
                    {room ? (
                        <Stack gap={2}>
                            <Text size="sm" fw={500}>Room {room.number}</Text>
                            <Text size="xs" c="dimmed">Floor {room.floor} · {room.type}</Text>
                        </Stack>
                    ) : (
                        <Text size="sm" c="dimmed">Room assignment not available.</Text>
                    )}
                </Card>
            </Stack>
        );

        open({
            title: resident ? `${resident.firstName} ${resident.lastName}` : 'Sales Order',
            subtitle: 'Sales Order Details',
            leftPane,
            rightPane,
        });
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="sales-dashboard">
            <Group justify="space-between" mb="xl">
                <Title order={2}>Sales Dashboard</Title>
                <Group gap="sm">
                    <Popover width={360} position="bottom-end" withArrow shadow="md">
                        <Popover.Target>
                            <Indicator
                                color="red"
                                size={18}
                                label={unreadCount}
                                disabled={unreadCount === 0}
                            >
                                <ActionIcon variant="light" size="lg">
                                    <IconBell size={20} />
                                </ActionIcon>
                            </Indicator>
                        </Popover.Target>
                        <Popover.Dropdown>
                            <Text fw={600} mb="sm">Notifications</Text>
                            <ScrollArea h={300}>
                                <Stack gap="xs">
                                    {dashboardNotifications.slice(0, 10).map(notif => (
                                        <Card
                                            key={notif.id}
                                            padding="sm"
                                            withBorder
                                            className={!notif.readAt ? 'unread' : ''}
                                            onClick={() => !notif.readAt && handleMarkRead(notif.id)}
                                            style={{ cursor: !notif.readAt ? 'pointer' : 'default' }}
                                        >
                                            <Group justify="space-between" mb={4}>
                                                <Badge size="xs" color={notif.type === 'sale' ? 'green' : 'blue'}>
                                                    {notif.type}
                                                </Badge>
                                                <Text size="xs" c="dimmed">
                                                    {formatDate(notif.createdAt)}
                                                </Text>
                                            </Group>
                                            <Text size="sm" fw={500}>{notif.title}</Text>
                                            <Text size="xs" c="dimmed" lineClamp={2}>
                                                {notif.message}
                                            </Text>
                                        </Card>
                                    ))}
                                </Stack>
                            </ScrollArea>
                        </Popover.Dropdown>
                    </Popover>
                    <Button
                        leftSection={<IconPlus size={16} />}
                        onClick={() => {
                            initNewDraft();
                            navigate('/sales/order');
                        }}
                    >
                        Create Sales Order
                    </Button>
                </Group>
            </Group>

            <div className="stats-grid">
                <Card padding="lg" radius="md" withBorder className="stat-card">
                    <Group justify="space-between">
                        <div>
                            <Text size="sm" c="dimmed" tt="uppercase" fw={600}>Today's Sales</Text>
                            <Text size="xl" fw={700}>{stats?.todaySales || 0}</Text>
                        </div>
                        <ActionIcon variant="light" size="xl" color="blue">
                            <IconReceipt size={24} />
                        </ActionIcon>
                    </Group>
                </Card>

                <Card padding="lg" radius="md" withBorder className="stat-card">
                    <Group justify="space-between">
                        <div>
                            <Text size="sm" c="dimmed" tt="uppercase" fw={600}>Today's Revenue</Text>
                            <Text size="xl" fw={700}>฿{formatCurrency(stats?.todayRevenue || 0)}</Text>
                        </div>
                        <ActionIcon variant="light" size="xl" color="green">
                            <IconCurrencyBaht size={24} />
                        </ActionIcon>
                    </Group>
                </Card>

                <Card padding="lg" radius="md" withBorder className="stat-card">
                    <Group justify="space-between">
                        <div>
                            <Text size="sm" c="dimmed" tt="uppercase" fw={600}>Pending Payments</Text>
                            <Text size="xl" fw={700}>{stats?.pendingPayments || 0}</Text>
                        </div>
                        <ActionIcon variant="light" size="xl" color="yellow">
                            <IconClock size={24} />
                        </ActionIcon>
                    </Group>
                </Card>

                <Card padding="lg" radius="md" withBorder className="stat-card">
                    <Group justify="space-between">
                        <div>
                            <Text size="sm" c="dimmed" tt="uppercase" fw={600}>Active Residents</Text>
                            <Text size="xl" fw={700}>{stats?.activeResidents || 0}</Text>
                        </div>
                        <ActionIcon variant="light" size="xl" color="violet">
                            <IconUsers size={24} />
                        </ActionIcon>
                    </Group>
                </Card>
            </div>

            <Card padding="lg" radius="md" withBorder mt="xl">
                <Text fw={600} size="lg" mb="md">Recent Sales</Text>
                {stats?.recentSales && stats.recentSales.length > 0 ? (
                    <StyledTable>
                        <StyledTable.Thead>
                            <StyledTable.Tr>
                                <StyledTable.Th>Resident / Package</StyledTable.Th>
                                <StyledTable.Th>Guardian</StyledTable.Th>
                                <StyledTable.Th>Stay</StyledTable.Th>
                                <StyledTable.Th>Total</StyledTable.Th>
                                <StyledTable.Th>Status</StyledTable.Th>
                                <StyledTable.Th></StyledTable.Th>
                            </StyledTable.Tr>
                        </StyledTable.Thead>
                        <StyledTable.Tbody>
                            {stats.recentSales.map(order => {
                                const residentName = getResidentName(order.residentId);
                                const guardianName = getGuardianName(order.guardianId);
                                const guardian = guardiansById.get(order.guardianId);

                                return (
                                    <StyledTable.Tr
                                        key={order.id}
                                        className="sales-dashboard-row"
                                        onClick={() => openSalesOrderSidesheet(order)}
                                    >
                                        <StyledTable.Td>
                                            <Stack gap={2}>
                                                <Text size="sm" fw={600}>{residentName}</Text>
                                                <Text size="xs" c="dimmed">{order.packageName}</Text>
                                            </Stack>
                                        </StyledTable.Td>
                                        <StyledTable.Td>
                                            <Stack gap={2}>
                                                <Text size="sm" fw={500}>{guardianName}</Text>
                                                <Text size="xs" c="dimmed">{guardian?.phone || '—'}</Text>
                                            </Stack>
                                        </StyledTable.Td>
                                        <StyledTable.Td>
                                            <Stack gap={2}>
                                                <Text size="sm">{formatDate(order.checkIn)} - {formatDate(order.checkOut)}</Text>
                                                <Text size="xs" c="dimmed">{order.adjustedDays} days</Text>
                                            </Stack>
                                        </StyledTable.Td>
                                        <StyledTable.Td>
                                            <Text size="sm" fw={600}>฿{formatCurrency(order.adjustedPrice)}</Text>
                                        </StyledTable.Td>
                                        <StyledTable.Td>
                                            <Badge color={getStatusColor(order.status)} size="sm">
                                                {order.status.replace('_', ' ')}
                                            </Badge>
                                        </StyledTable.Td>
                                        <StyledTable.Td>
                                            <ActionIcon
                                                variant="subtle"
                                                size="sm"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    openSalesOrderSidesheet(order);
                                                }}
                                                title="View details"
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
                    <Text c="dimmed" ta="center" py="xl">No recent sales</Text>
                )}
            </Card>
        </div>
    );
}
