import { useEffect, useState, useCallback } from 'react';
import {
    Title,
    Group,
    Button,
    Card,
    Text,
    Stack,
    Badge,
    ActionIcon,
    Checkbox,
    Collapse,
    Paper,
    Divider,
    Progress,
    Modal,
    Grid,
    Tooltip,
    Loader,
} from '@mantine/core';
import { 
    IconRefresh,
    IconFilter,
    IconChevronDown,
    IconChevronUp,
    IconChevronLeft,
    IconChevronRight,
    IconCheck,
    IconUser,
    IconCalendar,
    IconUsers
} from '@tabler/icons-react';
import { API } from '../api';
import { Select, Textarea } from '../components/EditableFields';
import type { OperationTask, Staff, StaffShift } from '../types';
import './StaffTasks.css';

export function StaffTasks() {
    const [tasks, setTasks] = useState<OperationTask[]>([]);
    const [staff, setStaff] = useState<Staff[]>([]);
    const [shifts, setShifts] = useState<StaffShift[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    // Filters
    const [selectedDate, setSelectedDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    });
    const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
    const [selectedDept, setSelectedDept] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(true);
    
    // UI State
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['pending', 'in_progress']));
    const [completeModal, setCompleteModal] = useState<{ task: OperationTask | null; open: boolean }>({ task: null, open: false });
    const [completeNotes, setCompleteNotes] = useState('');
    const [reassignModal, setReassignModal] = useState<{ task: OperationTask | null; open: boolean }>({ task: null, open: false });
    const [selectedReassign, setSelectedReassign] = useState<string | null>(null);
    
    // Forecast
    const [forecast, setForecast] = useState<{ date: string; totalStaff: number; scheduledStaff: number; taskCount: number }[]>([]);

    const loadData = useCallback(async () => {
        try {
            const [taskData, staffData, shiftData] = await Promise.all([
                API.getTasksByDate(selectedDate),
                API.getStaff(),
                API.getShiftsByDate(selectedDate)
            ]);
            
            let filtered = taskData;
            if (selectedStaff) {
                filtered = filtered.filter(t => t.assignedTo === selectedStaff);
            }
            if (selectedDept) {
                filtered = filtered.filter(t => t.serviceDept === selectedDept);
            }
            
            setTasks(filtered);
            setStaff(staffData);
            setShifts(shiftData);
            
            // Load 2-week forecast
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + 14);
            const forecastData = await API.getStaffAvailability(
                startDate.toISOString().split('T')[0],
                endDate.toISOString().split('T')[0]
            );
            setForecast(forecastData);
        } catch (error) {
            console.error('Failed to load tasks:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [selectedDate, selectedStaff, selectedDept]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadData();
    };

    const handlePrevDay = () => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() - 1);
        setSelectedDate(date.toISOString().split('T')[0]);
    };

    const handleNextDay = () => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() + 1);
        setSelectedDate(date.toISOString().split('T')[0]);
    };

    const handleToday = () => {
        setSelectedDate(new Date().toISOString().split('T')[0]);
    };

    const toggleGroup = (group: string) => {
        setExpandedGroups(prev => {
            const next = new Set(prev);
            if (next.has(group)) {
                next.delete(group);
            } else {
                next.add(group);
            }
            return next;
        });
    };

    const handleMarkComplete = async () => {
        if (!completeModal.task) return;
        
        await API.updateTaskStatus(
            completeModal.task.id,
            'completed',
            selectedStaff || undefined,
            completeNotes
        );
        
        setTasks(prev => prev.map(t => 
            t.id === completeModal.task!.id 
                ? { ...t, status: 'completed', completedAt: new Date().toISOString(), notes: completeNotes }
                : t
        ));
        
        setCompleteModal({ task: null, open: false });
        setCompleteNotes('');
    };

    const handleStartTask = async (task: OperationTask) => {
        await API.updateTaskStatus(task.id, 'in_progress');
        setTasks(prev => prev.map(t => 
            t.id === task.id ? { ...t, status: 'in_progress' } : t
        ));
    };

    const handleReassign = async () => {
        if (!reassignModal.task || !selectedReassign) return;
        
        const staffMember = staff.find(s => s.id === selectedReassign);
        if (!staffMember) return;
        
        await API.reassignTask(reassignModal.task.id, selectedReassign, staffMember.name);
        
        setTasks(prev => prev.map(t => 
            t.id === reassignModal.task!.id 
                ? { ...t, assignedTo: selectedReassign, assignedToName: staffMember.name }
                : t
        ));
        
        setReassignModal({ task: null, open: false });
        setSelectedReassign(null);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('th-TH', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatShortDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('th-TH', {
            day: 'numeric',
            month: 'short'
        });
    };

    const groupedTasks = {
        pending: tasks.filter(t => t.status === 'pending'),
        in_progress: tasks.filter(t => t.status === 'in_progress'),
        completed: tasks.filter(t => t.status === 'completed'),
        skipped: tasks.filter(t => t.status === 'skipped')
    };

    const totalTasks = tasks.length;
    const completedTasks = groupedTasks.completed.length;
    const progressPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const getPriorityColor = (priority: OperationTask['priority']) => {
        const colors = { low: 'gray', normal: 'blue', high: 'orange', urgent: 'red' };
        return colors[priority];
    };

    const departments = [...new Set(tasks.map(t => t.serviceDept))];

    if (loading) {
        return (
            <Stack align="center" justify="center" h={400}>
                <Loader size="lg" />
                <Text c="dimmed">Loading tasks...</Text>
            </Stack>
        );
    }

    return (
        <div className="staff-tasks">
            <Group justify="space-between" mb="lg">
                <Title order={2}>Staff Tasks</Title>
                <Group gap="sm">
                    <Tooltip label="Refresh">
                        <ActionIcon 
                            variant="light" 
                            size="lg" 
                            onClick={handleRefresh}
                            loading={refreshing}
                        >
                            <IconRefresh size={20} />
                        </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Toggle Filters">
                        <ActionIcon 
                            variant={showFilters ? 'filled' : 'light'}
                            size="lg"
                            onClick={() => setShowFilters(prev => !prev)}
                        >
                            <IconFilter size={20} />
                        </ActionIcon>
                    </Tooltip>
                </Group>
            </Group>

            {/* Date Navigation */}
            <Card padding="sm" radius="md" withBorder mb="md" className="date-nav">
                <Group justify="space-between" gap={0} wrap="nowrap" className="date-nav-group">
                    <ActionIcon variant="subtle" size="lg" onClick={handlePrevDay}>
                        <IconChevronLeft size={20} />
                    </ActionIcon>
                    <Group gap="xs" wrap="nowrap" className="date-nav-center">
                        <IconCalendar size={18} />
                        <Text fw={600} size="sm">{formatDate(selectedDate)}</Text>
                        {selectedDate !== new Date().toISOString().split('T')[0] && (
                            <Button variant="subtle" size="xs" onClick={handleToday}>Today</Button>
                        )}
                    </Group>
                    <ActionIcon variant="subtle" size="lg" onClick={handleNextDay}>
                        <IconChevronRight size={20} />
                    </ActionIcon>
                </Group>
            </Card>

            {/* Filters */}
            <Collapse in={showFilters}>
                <Card padding="md" radius="md" withBorder mb="md">
                    <Grid>
                        <Grid.Col span={4}>
                            <Select
                                label="Filter by Staff"
                                placeholder="All staff"
                                clearable
                                data={staff.map(s => ({ value: s.id, label: s.name }))}
                                value={selectedStaff}
                                onChange={setSelectedStaff}
                                leftSection={<IconUser size={16} />}
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <Select
                                label="Filter by Department"
                                placeholder="All departments"
                                clearable
                                data={departments.map(d => ({ value: d, label: d }))}
                                value={selectedDept}
                                onChange={setSelectedDept}
                                leftSection={<IconUsers size={16} />}
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <Stack gap={4}>
                                <Text size="sm" fw={500}>Staff on Shift Today</Text>
                                <Group gap="xs">
                                    {shifts.map(shift => (
                                        <Badge key={shift.id} variant="light" size="sm">
                                            {shift.staffName}
                                        </Badge>
                                    ))}
                                    {shifts.length === 0 && (
                                        <Text size="sm" c="dimmed">No shifts scheduled</Text>
                                    )}
                                </Group>
                            </Stack>
                        </Grid.Col>
                    </Grid>
                </Card>
            </Collapse>

            {/* Progress Summary */}
            <Card padding="md" radius="md" withBorder mb="lg">
                <Group justify="space-between" mb="xs">
                    <Text fw={500}>Today's Progress</Text>
                    <Text size="sm" c="dimmed">{completedTasks} of {totalTasks} tasks completed</Text>
                </Group>
                <Progress value={progressPercent} size="lg" color={progressPercent === 100 ? 'green' : 'blue'} />
            </Card>

            {/* Task Groups */}
            <Stack gap="md">
                {/* Pending Tasks */}
                <Card padding="md" radius="md" withBorder>
                    <Group 
                        justify="space-between" 
                        style={{ cursor: 'pointer' }}
                        onClick={() => toggleGroup('pending')}
                    >
                        <Group gap="sm">
                            <Badge color="yellow" size="lg">{groupedTasks.pending.length}</Badge>
                            <Text fw={600}>Pending</Text>
                        </Group>
                        {expandedGroups.has('pending') ? <IconChevronUp /> : <IconChevronDown />}
                    </Group>
                    <Collapse in={expandedGroups.has('pending')}>
                        <Divider my="sm" />
                        <Stack gap="sm">
                            {groupedTasks.pending.length === 0 ? (
                                <Text c="dimmed" ta="center" py="md">No pending tasks</Text>
                            ) : (
                                groupedTasks.pending.map(task => (
                                    <Paper key={task.id} p="sm" withBorder className="task-item" data-er-field="OPERATION_TASK">
                                        <Group justify="space-between">
                                            <Group gap="sm">
                                                <Checkbox 
                                                    onChange={() => setCompleteModal({ task, open: true })}
                                                />
                                                <div>
                                                    <Group gap="xs" mb={4}>
                                                        <Text fw={500} data-er-field="OPERATION_TASK.service_title">{task.serviceTitle}</Text>
                                                        <Badge size="xs" color={getPriorityColor(task.priority)} data-er-field="OPERATION_TASK.priority">
                                                            {task.priority}
                                                        </Badge>
                                                    </Group>
                                                    <Text size="sm" c="dimmed">
                                                        <span data-er-field="OPERATION_TASK.resident_id">{task.residentName}</span> • Room {task.roomNumber}
                                                    </Text>
                                                    <Text size="xs" c="dimmed" data-er-field="OPERATION_TASK.status">{task.description}</Text>
                                                </div>
                                            </Group>
                                            <Group gap="xs">
                                                <Badge variant="light" data-er-field="OPERATION_TASK.service_dept">{task.serviceDept}</Badge>
                                                {task.assignedToName ? (
                                                    <Tooltip label="Click to reassign">
                                                        <Badge 
                                                            variant="outline" 
                                                            style={{ cursor: 'pointer' }}
                                                            onClick={() => setReassignModal({ task, open: true })}
                                                        >
                                                            {task.assignedToName}
                                                        </Badge>
                                                    </Tooltip>
                                                ) : (
                                                    <Button 
                                                        size="xs" 
                                                        variant="light"
                                                        onClick={() => setReassignModal({ task, open: true })}
                                                    >
                                                        Assign
                                                    </Button>
                                                )}
                                                <Button 
                                                    size="xs" 
                                                    variant="light"
                                                    onClick={() => handleStartTask(task)}
                                                >
                                                    Start
                                                </Button>
                                            </Group>
                                        </Group>
                                    </Paper>
                                ))
                            )}
                        </Stack>
                    </Collapse>
                </Card>

                {/* In Progress Tasks */}
                <Card padding="md" radius="md" withBorder>
                    <Group 
                        justify="space-between" 
                        style={{ cursor: 'pointer' }}
                        onClick={() => toggleGroup('in_progress')}
                    >
                        <Group gap="sm">
                            <Badge color="blue" size="lg">{groupedTasks.in_progress.length}</Badge>
                            <Text fw={600}>In Progress</Text>
                        </Group>
                        {expandedGroups.has('in_progress') ? <IconChevronUp /> : <IconChevronDown />}
                    </Group>
                    <Collapse in={expandedGroups.has('in_progress')}>
                        <Divider my="sm" />
                        <Stack gap="sm">
                            {groupedTasks.in_progress.length === 0 ? (
                                <Text c="dimmed" ta="center" py="md">No tasks in progress</Text>
                            ) : (
                                groupedTasks.in_progress.map(task => (
                                    <Paper key={task.id} p="sm" withBorder className="task-item in-progress" data-er-field="OPERATION_TASK">
                                        <Group justify="space-between">
                                            <Group gap="sm">
                                                <Checkbox 
                                                    onChange={() => setCompleteModal({ task, open: true })}
                                                />
                                                <div>
                                                    <Group gap="xs" mb={4}>
                                                        <Text fw={500} data-er-field="OPERATION_TASK.service_title">{task.serviceTitle}</Text>
                                                        <Badge size="xs" color="blue" data-er-field="OPERATION_TASK.status">In Progress</Badge>
                                                    </Group>
                                                    <Text size="sm" c="dimmed">
                                                        <span data-er-field="OPERATION_TASK.resident_id">{task.residentName}</span> • Room {task.roomNumber}
                                                    </Text>
                                                </div>
                                            </Group>
                                            <Group gap="xs">
                                                <Badge variant="light" data-er-field="OPERATION_TASK.service_dept">{task.serviceDept}</Badge>
                                                {task.assignedToName && (
                                                    <Badge variant="outline">{task.assignedToName}</Badge>
                                                )}
                                                <Button 
                                                    size="xs"
                                                    color="green"
                                                    onClick={() => setCompleteModal({ task, open: true })}
                                                >
                                                    Complete
                                                </Button>
                                            </Group>
                                        </Group>
                                    </Paper>
                                ))
                            )}
                        </Stack>
                    </Collapse>
                </Card>

                {/* Completed Tasks */}
                <Card padding="md" radius="md" withBorder>
                    <Group 
                        justify="space-between" 
                        style={{ cursor: 'pointer' }}
                        onClick={() => toggleGroup('completed')}
                    >
                        <Group gap="sm">
                            <Badge color="green" size="lg">{groupedTasks.completed.length}</Badge>
                            <Text fw={600}>Completed</Text>
                        </Group>
                        {expandedGroups.has('completed') ? <IconChevronUp /> : <IconChevronDown />}
                    </Group>
                    <Collapse in={expandedGroups.has('completed')}>
                        <Divider my="sm" />
                        <Stack gap="sm">
                            {groupedTasks.completed.length === 0 ? (
                                <Text c="dimmed" ta="center" py="md">No completed tasks</Text>
                            ) : (
                                groupedTasks.completed.map(task => (
                                    <Paper key={task.id} p="sm" withBorder className="task-item completed" data-er-field="OPERATION_TASK">
                                        <Group justify="space-between">
                                            <Group gap="sm">
                                                <IconCheck size={20} color="var(--mantine-color-green-6)" />
                                                <div>
                                                    <Text fw={500} td="line-through" c="dimmed" data-er-field="OPERATION_TASK.service_title">{task.serviceTitle}</Text>
                                                    <Text size="sm" c="dimmed">
                                                        <span data-er-field="OPERATION_TASK.resident_id">{task.residentName}</span> • Room {task.roomNumber}
                                                    </Text>
                                                    {task.notes && (
                                                        <Text size="xs" c="dimmed" fs="italic">Note: {task.notes}</Text>
                                                    )}
                                                </div>
                                            </Group>
                                            <Group gap="xs">
                                                <Badge size="xs" color="green" data-er-field="OPERATION_TASK.status">Completed</Badge>
                                                {task.completedBy && (
                                                    <Text size="xs" c="dimmed">by {task.assignedToName}</Text>
                                                )}
                                                {task.completedAt && (
                                                    <Text size="xs" c="dimmed" data-er-field="OPERATION_TASK.scheduled_date">
                                                        {new Date(task.completedAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                                                    </Text>
                                                )}
                                            </Group>
                                        </Group>
                                    </Paper>
                                ))
                            )}
                        </Stack>
                    </Collapse>
                </Card>
            </Stack>

            {/* 2-Week Forecast */}
            <Card padding="md" radius="md" withBorder mt="xl">
                <Text fw={600} mb="md">Staff Availability Forecast (Next 2 Weeks)</Text>
                <div className="forecast-grid">
                    {forecast.map(day => {
                        const isToday = day.date === new Date().toISOString().split('T')[0];
                        const ratio = day.scheduledStaff / Math.max(day.taskCount, 1);
                        const status = ratio >= 1 ? 'good' : ratio >= 0.5 ? 'warning' : 'critical';
                        
                        return (
                            <Tooltip 
                                key={day.date}
                                label={`${day.scheduledStaff} staff / ${day.taskCount} tasks`}
                            >
                                <Paper 
                                    p="xs" 
                                    withBorder 
                                    className={`forecast-day ${status} ${isToday ? 'today' : ''}`}
                                    onClick={() => setSelectedDate(day.date)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <Text size="xs" ta="center" fw={isToday ? 700 : 400}>
                                        {formatShortDate(day.date)}
                                    </Text>
                                    <Text size="lg" ta="center" fw={600}>
                                        {day.scheduledStaff}
                                    </Text>
                                    <Text size="xs" ta="center" c="dimmed">
                                        {day.taskCount} tasks
                                    </Text>
                                </Paper>
                            </Tooltip>
                        );
                    })}
                </div>
                <Group gap="lg" mt="md" justify="center">
                    <Group gap="xs">
                        <div className="forecast-legend good" />
                        <Text size="xs">Sufficient staff</Text>
                    </Group>
                    <Group gap="xs">
                        <div className="forecast-legend warning" />
                        <Text size="xs">May need more staff</Text>
                    </Group>
                    <Group gap="xs">
                        <div className="forecast-legend critical" />
                        <Text size="xs">Understaffed</Text>
                    </Group>
                </Group>
            </Card>

            {/* Complete Task Modal */}
            <Modal 
                opened={completeModal.open} 
                onClose={() => setCompleteModal({ task: null, open: false })}
                title="Complete Task"
            >
                {completeModal.task && (
                    <Stack>
                        <Text fw={500}>{completeModal.task.serviceTitle}</Text>
                        <Text size="sm" c="dimmed">
                            {completeModal.task.residentName} • Room {completeModal.task.roomNumber}
                        </Text>
                        <Textarea
                            label="Notes (optional)"
                            placeholder="Add any notes about this task..."
                            value={completeNotes}
                            onChange={(e) => setCompleteNotes(e.currentTarget.value)}
                        />
                        <Group justify="flex-end">
                            <Button variant="subtle" onClick={() => setCompleteModal({ task: null, open: false })}>
                                Cancel
                            </Button>
                            <Button color="green" onClick={handleMarkComplete}>
                                Mark as Complete
                            </Button>
                        </Group>
                    </Stack>
                )}
            </Modal>

            {/* Reassign Task Modal */}
            <Modal 
                opened={reassignModal.open} 
                onClose={() => setReassignModal({ task: null, open: false })}
                title="Assign/Reassign Task"
            >
                {reassignModal.task && (
                    <Stack>
                        <Text fw={500}>{reassignModal.task.serviceTitle}</Text>
                        <Text size="sm" c="dimmed">
                            Current: {reassignModal.task.assignedToName || 'Unassigned'}
                        </Text>
                        <Select
                            label="Assign to"
                            placeholder="Select staff member"
                            data={staff
                                .filter(s => s.dept === reassignModal.task?.serviceDept || s.dept === 'Frontend')
                                .map(s => ({ value: s.id, label: `${s.name} (${s.dept})` }))
                            }
                            value={selectedReassign}
                            onChange={setSelectedReassign}
                        />
                        <Group justify="flex-end">
                            <Button variant="subtle" onClick={() => setReassignModal({ task: null, open: false })}>
                                Cancel
                            </Button>
                            <Button onClick={handleReassign} disabled={!selectedReassign}>
                                Assign
                            </Button>
                        </Group>
                    </Stack>
                )}
            </Modal>
        </div>
    );
}
