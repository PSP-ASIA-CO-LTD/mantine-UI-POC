import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Title,
    Group,
    Button,
    Card,
    Text,
    Stack,
    Badge,
    Table,
    ActionIcon,
    Indicator,
    Popover,
    ScrollArea,
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
import { notifications } from '@mantine/notifications';
import type { SalesDashboardStats, Notification, SalesOrder } from '../types';
import './SalesDashboard.css';

export function SalesDashboard() {
    const navigate = useNavigate();
    const { getOrderBySalesOrderId, initNewDraft } = useSalesOrder();
    const [stats, setStats] = useState<SalesDashboardStats | null>(null);
    const [dashboardNotifications, setDashboardNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            const [statsData, notifData] = await Promise.all([
                API.getSalesDashboardStats(),
                API.getNotifications()
            ]);
            setStats(statsData);
            setDashboardNotifications(notifData);
            setUnreadCount(notifData.filter(n => !n.readAt).length);
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

    const handleViewContract = (salesOrderId: string) => {
        const orderDraft = getOrderBySalesOrderId(salesOrderId);
        if (orderDraft) {
            navigate('/sales/order/contract', { state: { draftId: orderDraft.id } });
        } else {
            notifications.show({
                title: 'Details Not Found',
                message: 'Detailed document data for this order is not available on this device.',
                color: 'orange'
            });
        }
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
                    <Table>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Order ID</Table.Th>
                                <Table.Th>Package</Table.Th>
                                <Table.Th>Check-in</Table.Th>
                                <Table.Th>Days</Table.Th>
                                <Table.Th>Amount</Table.Th>
                                <Table.Th>Status</Table.Th>
                                <Table.Th></Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {stats.recentSales.map(order => (
                                <Table.Tr key={order.id}>
                                    <Table.Td>
                                        <Text size="sm" fw={500}>{order.id}</Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text size="sm">{order.packageName}</Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text size="sm">{formatDate(order.checkIn)}</Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text size="sm">{order.adjustedDays} days</Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text size="sm" fw={500}>฿{formatCurrency(order.adjustedPrice)}</Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Badge color={getStatusColor(order.status)} size="sm">
                                            {order.status.replace('_', ' ')}
                                        </Badge>
                                    </Table.Td>
                                    <Table.Td>
                                        <ActionIcon
                                            variant="subtle"
                                            size="sm"
                                            onClick={() => handleViewContract(order.id)}
                                            title="View Contract"
                                        >
                                            <IconEye size={16} />
                                        </ActionIcon>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                ) : (
                    <Text c="dimmed" ta="center" py="xl">No recent sales</Text>
                )}
            </Card>
        </div>
    );
}
