import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore, useState, type CSSProperties } from 'react';
import {
    Title,
    Group,
    Button,
    Grid,
    Text,
    ActionIcon,
    Divider,
    Card,
    Badge,
    Stack,
    Table,
    Box,
} from '@mantine/core';
import { IconCheck, IconPlus } from '@tabler/icons-react';
import { API } from '../api';
import { useSidesheet } from '../contexts/SidesheetContext';
import { AppSidesheetFooter } from '../components/AppSidesheetFooter';
import { CardList } from '../components/CardList';
import {
    TextInput,
    Select,
    Textarea,
    NumberInput,
    InlineTextarea,
    InlineSelect,
    InlineLockedInput,
} from '../components/EditableFields';
import { RecurrenceDisplay } from '../components/RecurrenceIcon';
import type { Department, Service, Staff } from '../types';
import {
    formatMonthlyFallbackLabel,
    formatServiceInterval,
    formatServiceIntervalLabel,
    getWeekdayLabels,
    parseServiceInterval,
} from '../utils/serviceRecurrence';

const DEPARTMENT_COLOR_PRESETS = [
    '#1E88E5', '#43A047', '#F4511E', '#8E24AA', '#00ACC1',
    '#7CB342', '#5E35B1', '#FB8C00', '#3949AB', '#00897B',
    '#D81B60', '#6D4C41', '#546E7A', '#C62828', '#2E7D32',
    '#1565C0', '#AD1457', '#FF7043', '#26A69A', '#7E57C2',
    '#EC407A', '#9CCC65', '#FFA726', '#42A5F5', '#78909C',
];
const DEPARTMENT_COLOR_NAMES = [
    'sky', 'fern', 'lobster', 'orchid', 'lagoon',
    'moss', 'violet', 'amber', 'indigo', 'teal',
    'rose', 'cocoa', 'slate', 'crimson', 'pine',
    'azure', 'wine', 'coral', 'mint', 'lavender',
    'pink', 'lime', 'marigold', 'cerulean', 'steel',
];
const DEPARTMENT_COLOR_OPTIONS = DEPARTMENT_COLOR_PRESETS.map((value, index) => ({
    value,
    label: DEPARTMENT_COLOR_NAMES[index] || `color ${index + 1}`,
}));
const DEPARTMENT_COLOR_LABEL_BY_VALUE = new Map(
    DEPARTMENT_COLOR_OPTIONS.map((option) => [option.value, option.label]),
);

const DEFAULT_DEPARTMENT_COLOR = DEPARTMENT_COLOR_PRESETS[0];
const WEEKDAY_OPTIONS = getWeekdayLabels().map((label, day) => ({ label, day }));
const WEEKDAY_SHORT_OPTIONS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

type ServiceCreateDraft = {
    title: string;
    description: string;
    price: number;
    repeatMode: 'day' | 'month' | null;
    weeklyDays: number[];
    monthlyDay: number;
};

type DepartmentCreateDraft = {
    name: string;
    description: string;
    parentDepartmentId: string | null;
    color: string;
    headManagerId: string | null;
};

type NameBridge = {
    get: () => string;
    set: (value: string) => void;
    subscribe: (listener: () => void) => () => void;
};

const createNameBridge = (initial = ''): NameBridge => {
    let value = initial;
    const listeners = new Set<() => void>();

    return {
        get: () => value,
        set: (next) => {
            value = next;
            listeners.forEach((listener) => listener());
        },
        subscribe: (listener) => {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
    };
};

const normalizeText = (value: string) => value.trim().toLowerCase();

const hexToRgba = (hex: string, alpha: number) => {
    const raw = hex.replace('#', '');
    const safe = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw;
    const int = Number.parseInt(safe, 16);
    if (Number.isNaN(int)) return `rgba(30, 136, 229, ${alpha})`;
    const r = (int >> 16) & 255;
    const g = (int >> 8) & 255;
    const b = int & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const renderParentTag = (label: string, color: string) => (
    <Badge
        radius="xl"
        size="sm"
        variant="outline"
        style={{
            borderColor: color,
            color,
            backgroundColor: hexToRgba(color, 0.12),
            textTransform: 'none',
        }}
    >
        {label}
    </Badge>
);

const renderColorLabel = (color: string, label?: string) => (
    <Group className="ds-color-dot-label" wrap="nowrap">
        <Box aria-hidden className="ds-color-dot" style={{ '--ds-color-dot-color': color } as CSSProperties} />
        <Text size="sm">{label || color}</Text>
    </Group>
);

const renderColorDot = (color: string) => (
    <Box aria-hidden className="ds-color-dot" style={{ '--ds-color-dot-color': color } as CSSProperties} />
);

const colorLabelFor = (color: string) => DEPARTMENT_COLOR_LABEL_BY_VALUE.get(color) || color;

const normalizeDepartmentColors = (items: Department[]) => {
    const nextColor = (() => {
        let index = 0;
        return () => {
            const color = DEPARTMENT_COLOR_PRESETS[index % DEPARTMENT_COLOR_PRESETS.length];
            index += 1;
            return color;
        };
    })();

    const normalized = items.map((item) => ({ ...item }));
    const byId = new Map(normalized.map((item) => [item.id, item]));
    const resolved = new Map<string, string>();

    const resolveColor = (department: Department, stack = new Set<string>()): string => {
        if (resolved.has(department.id)) return resolved.get(department.id) as string;
        if (department.color) {
            resolved.set(department.id, department.color);
            return department.color;
        }
        if (!department.parentDepartmentId) {
            const color = nextColor();
            resolved.set(department.id, color);
            department.color = color;
            return color;
        }
        if (stack.has(department.id)) {
            const color = nextColor();
            resolved.set(department.id, color);
            department.color = color;
            return color;
        }

        stack.add(department.id);
        const parent = byId.get(department.parentDepartmentId);
        const color = parent ? resolveColor(parent, stack) : nextColor();
        stack.delete(department.id);

        resolved.set(department.id, color);
        department.color = color;
        return color;
    };

    normalized.forEach((department) => resolveColor(department));
    const changed = normalized.some((department, index) => department.color !== items[index].color);
    return { normalized, changed };
};

function DepartmentTitleInput({
    bridge,
    placeholder,
}: {
    bridge: NameBridge;
    placeholder: string;
}) {
    const name = useSyncExternalStore(bridge.subscribe, bridge.get, bridge.get);
    return (
        <TextInput
            aria-label="Department Name"
            placeholder={placeholder}
            value={name}
            onChange={(event) => bridge.set(event.currentTarget.value)}
            variant="unstyled"
            styles={{
                input: {
                    fontSize: '2rem',
                    fontWeight: 700,
                    lineHeight: 1.2,
                    color: 'hsl(0, 0%, 20%)',
                    padding: 0,
                    minHeight: 0,
                },
            }}
        />
    );
}

function DepartmentEditableTitleInput({
    initialValue,
    onSave,
}: {
    initialValue: string;
    onSave: (value: string) => Promise<void>;
}) {
    const [value, setValue] = useState(initialValue);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    const commit = async () => {
        const trimmed = value.trim();
        if (!trimmed || trimmed === initialValue || isSaving) {
            setValue(trimmed || initialValue);
            return;
        }
        try {
            setIsSaving(true);
            await onSave(trimmed);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <TextInput
            aria-label="Department Name"
            placeholder="Type department name"
            value={value}
            disabled={isSaving}
            onChange={(event) => setValue(event.currentTarget.value)}
            onBlur={() => { void commit(); }}
            onKeyDown={(event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    void commit();
                }
            }}
            variant="unstyled"
            styles={{
                input: {
                    fontSize: '2rem',
                    fontWeight: 700,
                    lineHeight: 1.2,
                    color: 'hsl(0, 0%, 20%)',
                    padding: 0,
                    minHeight: 0,
                },
            }}
        />
    );
}

function DepartmentMembersTable({
    members,
    headManagerId,
    onSelectHeadManager,
}: {
    members: Staff[];
    headManagerId?: string | null;
    onSelectHeadManager?: (staffId: string | null) => void | Promise<void>;
}) {
    if (members.length === 0) {
        return <Text size="sm" c="dimmed">No members assigned</Text>;
    }

    return (
        <Table striped withTableBorder withColumnBorders highlightOnHover>
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>Head Manager</Table.Th>
                    <Table.Th>Name</Table.Th>
                    <Table.Th>Role</Table.Th>
                    <Table.Th>Status</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {members.map((member) => {
                    const isSelected = member.id === headManagerId;
                    return (
                    <Table.Tr key={member.id}>
                        <Table.Td>
                            <ActionIcon
                                aria-label={isSelected ? `Unset ${member.name} as head manager` : `Set ${member.name} as head manager`}
                                variant={isSelected ? 'filled' : 'light'}
                                color={isSelected ? 'green' : 'gray'}
                                onClick={() => {
                                    if (!onSelectHeadManager) return;
                                    void onSelectHeadManager(isSelected ? null : member.id);
                                }}
                            >
                                <IconCheck size={14} />
                            </ActionIcon>
                        </Table.Td>
                        <Table.Td>{member.name}</Table.Td>
                        <Table.Td>{member.role}</Table.Td>
                        <Table.Td>{member.status}</Table.Td>
                    </Table.Tr>
                    );
                })}
            </Table.Tbody>
        </Table>
    );
}

const createDefaultServiceDraft = (): ServiceCreateDraft => ({
    title: '',
    description: '',
    price: 0,
    repeatMode: null,
    weeklyDays: [0, 1, 2, 3, 4, 5, 6],
    monthlyDay: 1,
});

const buildServiceInterval = (draft: ServiceCreateDraft): string => {
    if (draft.repeatMode === 'month') {
        return formatServiceInterval({ kind: 'monthly', day: draft.monthlyDay });
    }
    const weeklyDays = draft.weeklyDays.length > 0 ? draft.weeklyDays : [0, 1, 2, 3, 4, 5, 6];
    return formatServiceInterval({ kind: 'weekly', days: weeklyDays });
};

const serviceRepeatBadgeLabel = (interval: string) => {
    const parsed = parseServiceInterval(interval);
    if (parsed?.kind === 'monthly') return `Monthly • ${formatMonthlyFallbackLabel(parsed.day)}`;
    if (parsed?.kind === 'weekly') {
        if (parsed.days.length === 7) return 'Every day';
        return `Weekly • ${parsed.days.map((day) => WEEKDAY_OPTIONS[day]?.label || '').filter(Boolean).join(', ')}`;
    }
    return formatServiceIntervalLabel(interval);
};

const toggleWeekday = (days: number[], targetDay: number) => (
    days.includes(targetDay)
        ? days.filter((day) => day !== targetDay)
        : [...days, targetDay].sort((a, b) => a - b)
);

function DepartmentServicesPane({
    title,
    services,
    onCreateService,
}: {
    title: string;
    services: Service[];
    onCreateService?: (draft: ServiceCreateDraft) => Promise<void>;
}) {
    const [isCreating, setIsCreating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [draft, setDraft] = useState<ServiceCreateDraft>(createDefaultServiceDraft());

    useEffect(() => {
        if (!isCreating) {
            setDraft(createDefaultServiceDraft());
        }
    }, [isCreating, services.length]);

    const saveDraft = async () => {
        if (!onCreateService || !draft.title.trim() || !draft.repeatMode) return;
        setIsSaving(true);
        try {
            await onCreateService({
                ...draft,
                title: draft.title.trim(),
                description: draft.description.trim(),
                weeklyDays: draft.weeklyDays.length > 0 ? draft.weeklyDays : [0, 1, 2, 3, 4, 5, 6],
                monthlyDay: Math.min(31, Math.max(1, Math.trunc(draft.monthlyDay || 1))),
            });
            setIsCreating(false);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div>
            <Group justify="space-between" mb="md">
                <Text fw={600}>{title}</Text>
                <ActionIcon
                    size={28}
                    variant="light"
                    color="green"
                    disabled={!onCreateService}
                    onClick={(event) => {
                        event.stopPropagation();
                        if (onCreateService) setIsCreating(true);
                    }}
                    aria-label="Add service"
                >
                    <IconPlus size={16} />
                </ActionIcon>
            </Group>

            {isCreating && (
                <CardList
                    title={<Text fw={500}>New Service</Text>}
                    description={(
                        <Stack gap="sm">
                            <TextInput
                                label="Service Name"
                                placeholder="Room Cleaning"
                                value={draft.title}
                                onChange={(event) => setDraft((current) => ({ ...current, title: event.currentTarget?.value || '' }))}
                            />
                            <Textarea
                                label="Description"
                                placeholder="Detailed coverage for staff assignment"
                                minRows={3}
                                value={draft.description}
                                onChange={(event) => setDraft((current) => ({ ...current, description: event.currentTarget?.value || '' }))}
                            />
                            <Group align="flex-end" gap="sm" wrap="nowrap">
                                <Select
                                    label="Repeat"
                                    value={draft.repeatMode}
                                    placeholder="Day / Month"
                                    data={[
                                        { value: 'day', label: 'By Day' },
                                        { value: 'month', label: 'By Month' },
                                    ]}
                                    onChange={(value) => {
                                        if (value === 'day' || value === 'month') {
                                            setDraft((current) => ({ ...current, repeatMode: value }));
                                        }
                                    }}
                                    style={{ flex: '0 0 155px' }}
                                />

                                {draft.repeatMode === 'day' && (
                                    <Box style={{ flex: 1, minWidth: 0 }}>
                                        <Text size="xs" c="dimmed" mb={6}>Days of week</Text>
                                        <Group
                                            gap={0}
                                            wrap="nowrap"
                                            style={{
                                                border: '1px solid var(--mantine-color-blue-8)',
                                                borderRadius: '10px',
                                                overflow: 'hidden',
                                            }}
                                        >
                                            {WEEKDAY_SHORT_OPTIONS.map((label, day) => {
                                                const active = draft.weeklyDays.includes(day);
                                                return (
                                                    <Button
                                                        key={`${label}-${day}`}
                                                        variant={active ? 'filled' : 'subtle'}
                                                        color="blue"
                                                        onClick={() =>
                                                            setDraft((current) => ({
                                                                ...current,
                                                                weeklyDays: toggleWeekday(current.weeklyDays, day),
                                                            }))
                                                        }
                                                        style={{ flex: 1, borderRadius: 0, minWidth: 0 }}
                                                    >
                                                        {label}
                                                    </Button>
                                                );
                                            })}
                                        </Group>
                                        <Group justify="space-between" mt={4}>
                                            <Text size="xs" c="dimmed">Select weekly active days</Text>
                                            <Button
                                                variant="subtle"
                                                size="compact-xs"
                                                onClick={() =>
                                                    setDraft((current) => ({
                                                        ...current,
                                                        weeklyDays: current.weeklyDays.length === 7 ? [] : [0, 1, 2, 3, 4, 5, 6],
                                                    }))
                                                }
                                            >
                                                {draft.weeklyDays.length === 7 ? 'Clear all' : 'Every day'}
                                            </Button>
                                        </Group>
                                    </Box>
                                )}

                                {draft.repeatMode === 'month' && (
                                    <Select
                                        label="Day"
                                        value={String(draft.monthlyDay)}
                                        data={Array.from({ length: 31 }, (_, index) => {
                                            const day = index + 1;
                                            return { value: String(day), label: `${day}` };
                                        })}
                                        onChange={(value) => {
                                            const day = Number.parseInt(value || '1', 10);
                                            setDraft((current) => ({
                                                ...current,
                                                monthlyDay: Number.isInteger(day) ? day : 1,
                                            }));
                                        }}
                                        style={{ flex: 1, minWidth: 0 }}
                                    />
                                )}
                            </Group>

                            {draft.repeatMode === 'month' && (
                                <Text size="xs" c="dimmed">
                                    {draft.monthlyDay >= 29
                                        ? `Auto fallback: ${formatMonthlyFallbackLabel(draft.monthlyDay)}`
                                        : 'Runs on the selected calendar day every month'}
                                </Text>
                            )}

                            <NumberInput
                                label="Pricing (THB)"
                                min={0}
                                value={draft.price}
                                thousandSeparator=","
                                onChange={(value) => setDraft((current) => ({
                                    ...current,
                                    price: typeof value === 'number' ? value : Number(value) || 0,
                                }))}
                            />
                        </Stack>
                    )}
                    meta={(
                        <Group justify="flex-end" mt="xs">
                            <Button
                                variant="subtle"
                                color="gray"
                                onClick={() => setIsCreating(false)}
                                disabled={isSaving}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => {
                                    void saveDraft();
                                }}
                                loading={isSaving}
                                disabled={!draft.title.trim() || !draft.repeatMode}
                            >
                                Save Service
                            </Button>
                        </Group>
                    )}
                    mb="sm"
                />
            )}

            {services.length > 0 ? (
                services.map((service) => (
                    <CardList
                        key={service.id}
                        title={(
                            <Group justify="space-between" align="center" wrap="nowrap" w="100%">
                                <Text fw={500}>{service.title}</Text>
                                <Group gap={6} wrap="nowrap">
                                    <Badge size="xs" variant="light" style={{ textTransform: 'none' }}>
                                        {serviceRepeatBadgeLabel(service.interval)}
                                    </Badge>
                                    <Badge size="xs" variant="light" style={{ textTransform: 'none' }} data-er-field="TASK.price">
                                        ฿{service.price.toLocaleString()}
                                    </Badge>
                                </Group>
                            </Group>
                        )}
                        cardDataErField="TASK"
                        titleDataErField="TASK.title"
                        description={(
                            <Text size="xs" c="dimmed" style={{ flex: 1 }}>{service.description}</Text>
                        )}
                        descriptionDataErField="TASK.description"
                        meta={<div data-er-field="TASK.interval"><RecurrenceDisplay interval={service.interval} /></div>}
                        mb="sm"
                    />
                ))
            ) : (
                !isCreating && <Text size="sm" c="dimmed">No services yet. Click + to create the first card.</Text>
            )}
        </div>
    );
}

function CreateDepartmentServicesPane({
    onDraftsChange,
}: {
    onDraftsChange: (drafts: ServiceCreateDraft[]) => void;
}) {
    const [drafts, setDrafts] = useState<ServiceCreateDraft[]>([]);

    useEffect(() => {
        onDraftsChange(drafts);
    }, [drafts, onDraftsChange]);

    const previewServices = useMemo<Service[]>(() => drafts.map((draft, index) => ({
        id: `draft-service-${index}`,
        title: draft.title.trim() || 'Untitled Service',
        description: draft.description.trim(),
        price: Number.isFinite(draft.price) ? Math.max(0, draft.price) : 0,
        interval: buildServiceInterval(draft),
        departmentId: '__draft__',
        dept: '',
    })), [drafts]);

    return (
        <DepartmentServicesPane
            title="Services"
            services={previewServices}
            onCreateService={async (draft) => {
                setDrafts((current) => [...current, draft]);
            }}
        />
    );
}

function CreateDepartmentLeftPane({
    bridge,
    departments,
    staff,
    onDraftChange,
}: {
    bridge: NameBridge;
    departments: Department[];
    staff: Staff[];
    onDraftChange: (draft: DepartmentCreateDraft) => void;
}) {
    const name = useSyncExternalStore(bridge.subscribe, bridge.get, bridge.get);
    const [description, setDescription] = useState('');
    const [parentDepartmentId, setParentDepartmentId] = useState<string | null>(null);
    const [color, setColor] = useState(DEFAULT_DEPARTMENT_COLOR);
    const [headManagerId, setHeadManagerId] = useState<string | null>(null);

    const parentDepartment = useMemo(
        () => departments.find((department) => department.id === parentDepartmentId) || null,
        [departments, parentDepartmentId],
    );

    const departmentStaff = useMemo(() => {
        const target = normalizeText(name);
        return staff.filter((member) => normalizeText(member.dept) === target);
    }, [name, staff]);

    useEffect(() => {
        if (parentDepartment?.color) {
            setColor(parentDepartment.color);
        }
    }, [parentDepartment]);

    useEffect(() => {
        if (headManagerId && !departmentStaff.some((member) => member.id === headManagerId)) {
            setHeadManagerId(null);
        }
    }, [departmentStaff, headManagerId]);

    useEffect(() => {
        onDraftChange({
            name,
            description,
            parentDepartmentId,
            color: parentDepartment?.color || color,
            headManagerId,
        });
    }, [name, description, parentDepartmentId, color, headManagerId, parentDepartment, onDraftChange]);

    return (
        <Stack gap="md">
            <Text fw={600} size="sm">Basic Info</Text>

            <TextInput
                label="Description"
                placeholder="Department description"
                value={description}
                onChange={(event) => setDescription(event.currentTarget.value)}
            />

            <Select
                label="Parent Department"
                placeholder="None"
                data={departments.map((department) => ({ value: department.id, label: department.name }))}
                value={parentDepartmentId}
                searchable
                clearable
                onChange={setParentDepartmentId}
            />

            {!parentDepartment && (
                <Select
                    label="Department Color"
                    placeholder="Pick color"
                    data={DEPARTMENT_COLOR_OPTIONS}
                    value={color}
                    leftSection={renderColorDot(color)}
                    leftSectionWidth={32}
                    classNames={{ root: 'ds-color-dot-select' }}
                    renderOption={({ option }) => renderColorLabel(option.value, option.label)}
                    searchable
                    onChange={(value) => value && setColor(value)}
                />
            )}

            {parentDepartment && (
                <InlineLockedInput
                    label="Department Color"
                    value={`${colorLabelFor(parentDepartment.color || DEFAULT_DEPARTMENT_COLOR)} (${parentDepartment.color || DEFAULT_DEPARTMENT_COLOR}) inherited from ${parentDepartment.name}`}
                />
            )}

            <Divider my="sm" />

            <Text fw={600} size="sm">Department Staff Members</Text>
            <DepartmentMembersTable
                members={departmentStaff}
                headManagerId={headManagerId}
                onSelectHeadManager={(staffId) => {
                    setHeadManagerId(staffId);
                }}
            />
        </Stack>
    );
}

export function Departments() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [staff, setStaff] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const createDraftRef = useRef<DepartmentCreateDraft>({
        name: '',
        description: '',
        parentDepartmentId: null,
        color: DEFAULT_DEPARTMENT_COLOR,
        headManagerId: null,
    });
    const createServiceDraftsRef = useRef<ServiceCreateDraft[]>([]);

    const { open, close } = useSidesheet();

    const loadDepartments = useCallback(async () => {
        try {
            const [deptData, serviceData, staffData] = await Promise.all([
                API.getDepartments(),
                API.getServices(),
                API.getStaff(),
            ]);

            const { normalized, changed } = normalizeDepartmentColors(deptData);
            if (changed) {
                await Promise.all(
                    normalized
                        .filter((department, index) => department.color !== deptData[index].color)
                        .map((department) => API.saveDepartment({ id: department.id, color: department.color })),
                );
            }

            setDepartments(normalized);
            setServices(serviceData);
            setStaff(staffData);
        } catch (error) {
            console.error('Failed to load departments:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadDepartments();
    }, [loadDepartments]);

    const departmentById = useMemo(
        () => new Map(departments.map((department) => [department.id, department])),
        [departments],
    );

    const servicesByDept = useMemo(() => {
        const map = new Map<string, Service[]>();
        services.forEach((service) => {
            const list = map.get(service.departmentId) || [];
            list.push(service);
            map.set(service.departmentId, list);
        });
        return map;
    }, [services]);

    const staffByDept = useMemo(() => {
        const map = new Map<string, Staff[]>();
        staff.forEach((member) => {
            const department = departments.find((dept) => normalizeText(dept.name) === normalizeText(member.dept));
            if (!department) return;
            const list = map.get(department.id) || [];
            list.push(member);
            map.set(department.id, list);
        });
        return map;
    }, [staff, departments]);

    const openCreateDepartmentSidesheet = () => {
        const nameBridge = createNameBridge('');

        createDraftRef.current = {
            name: '',
            description: '',
            parentDepartmentId: null,
            color: DEFAULT_DEPARTMENT_COLOR,
            headManagerId: null,
        };
        createServiceDraftsRef.current = [];

        const leftPane = (
            <CreateDepartmentLeftPane
                bridge={nameBridge}
                departments={departments}
                staff={staff}
                onDraftChange={(draft) => {
                    createDraftRef.current = draft;
                }}
            />
        );

        const rightPane = (
            <CreateDepartmentServicesPane
                onDraftsChange={(drafts) => {
                    createServiceDraftsRef.current = drafts;
                }}
            />
        );

        const footer = (
            <AppSidesheetFooter
                onCancel={close}
                onSave={async () => {
                    const draft = createDraftRef.current;
                    if (!draft.name.trim()) return;

                    const parentDepartment = draft.parentDepartmentId
                        ? departmentById.get(draft.parentDepartmentId)
                        : null;

                    const createdDepartment = await API.createDepartment({
                        name: draft.name.trim(),
                        description: draft.description.trim(),
                        parentDepartmentId: draft.parentDepartmentId || undefined,
                        headManagerId: draft.headManagerId || undefined,
                        color: parentDepartment?.color || draft.color || DEFAULT_DEPARTMENT_COLOR,
                    });

                    await Promise.all(
                        createServiceDraftsRef.current.map(async (serviceDraft) => {
                            await API.createService({
                                title: serviceDraft.title.trim(),
                                description: serviceDraft.description.trim(),
                                price: Number.isFinite(serviceDraft.price) ? Math.max(0, serviceDraft.price) : 0,
                                departmentId: createdDepartment.id,
                                interval: buildServiceInterval(serviceDraft),
                            });
                        }),
                    );

                    await loadDepartments();
                    close();
                }}
                saveLabel="Create Department"
            />
        );

        open({
            subtitle: 'Department Name',
            titleNode: <DepartmentTitleInput bridge={nameBridge} placeholder="Type department name" />,
            leftPane,
            rightPane,
            footer,
        });
    };

    const openDepartmentSidesheet = useCallback((department: Department, serviceListOverride?: Service[]) => {
        const deptServices = serviceListOverride || servicesByDept.get(department.id) || [];
        const deptStaff = staffByDept.get(department.id) || [];
        const parentDepartment = department.parentDepartmentId
            ? departmentById.get(department.parentDepartmentId)
            : null;
        const parentOptions = departments
            .filter((candidate) => candidate.id !== department.id)
            .map((candidate) => ({ value: candidate.id, label: candidate.name }));
        const updateDepartment = async (updates: Partial<Department>) => {
            await API.saveDepartment({ id: department.id, ...updates });
            const refreshed = await API.getDepartments();
            const { normalized } = normalizeDepartmentColors(refreshed);
            setDepartments(normalized);

            const nextDepartment = normalized.find((item) => item.id === department.id);
            if (nextDepartment) {
                openDepartmentSidesheet(nextDepartment);
            }
        };

        const createService = async (draft: ServiceCreateDraft) => {
            await API.createService({
                title: draft.title,
                description: draft.description,
                price: Number.isFinite(draft.price) ? Math.max(0, draft.price) : 0,
                departmentId: department.id,
                interval: buildServiceInterval(draft),
            });
            const refreshed = await API.getServices();
            setServices(refreshed);
            const nextList = refreshed.filter((service) => service.departmentId === department.id);
            openDepartmentSidesheet(department, nextList);
        };

        const leftPane = (
            <Stack gap="md">
                <Text fw={600} size="sm">Basic Info</Text>

                <InlineTextarea
                    label="Description"
                    value={department.description || ''}
                    onSave={async (value) => {
                        await updateDepartment({ description: String(value || '').trim() });
                    }}
                    minRows={2}
                />

                <InlineSelect
                    label="Parent Department"
                    value={department.parentDepartmentId || null}
                    data={parentOptions}
                    placeholder="None"
                    searchable
                    clearable
                    onSave={async (value) => {
                        const parent = value ? departmentById.get(value) : null;
                        await updateDepartment({
                            parentDepartmentId: value || undefined,
                            color: parent?.color || department.color,
                        });
                    }}
                />

                {!parentDepartment ? (
                    <InlineSelect
                        label="Department Color"
                        value={department.color || DEFAULT_DEPARTMENT_COLOR}
                        data={DEPARTMENT_COLOR_OPTIONS}
                        leftSection={renderColorDot(department.color || DEFAULT_DEPARTMENT_COLOR)}
                        leftSectionWidth={32}
                        classNames={{ root: 'ds-color-dot-select' }}
                        renderOption={({ option }) => renderColorLabel(option.value, option.label)}
                        searchable
                        onSave={async (value) => {
                            if (!value) return;
                            await updateDepartment({ color: value });
                        }}
                    />
                ) : (
                    <InlineLockedInput
                        label="Department Color"
                        value={`${colorLabelFor(parentDepartment.color || DEFAULT_DEPARTMENT_COLOR)} (${parentDepartment.color || DEFAULT_DEPARTMENT_COLOR}) inherited from ${parentDepartment.name}`}
                    />
                )}

                <Divider my="sm" />

                <Text fw={600} size="sm">Department Staff Members</Text>
                <DepartmentMembersTable
                    members={deptStaff}
                    headManagerId={department.headManagerId || null}
                    onSelectHeadManager={async (staffId) => {
                        await updateDepartment({ headManagerId: staffId || undefined });
                    }}
                />
            </Stack>
        );

        const rightPane = (
            <DepartmentServicesPane
                title="Services"
                services={deptServices}
                onCreateService={createService}
            />
        );

        open({
            subtitle: 'Department Name',
            titleNode: (
                <DepartmentEditableTitleInput
                    initialValue={department.name}
                    onSave={async (value) => {
                        await updateDepartment({ name: value });
                    }}
                />
            ),
            titleDataAttribute: 'DEPARTMENT.department_name',
            leftPane,
            rightPane,
            footer: undefined,
        });
    }, [departments, departmentById, open, servicesByDept, staffByDept]);

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <Group justify="space-between" mb="xl">
                <Title order={2}>Department Management</Title>
                <Button leftSection={<IconPlus size={16} />} onClick={openCreateDepartmentSidesheet}>
                    Create Department
                </Button>
            </Group>

            <Grid>
                {departments.map((department) => {
                    const memberCount = (staffByDept.get(department.id) || []).length;
                    const serviceCount = (servicesByDept.get(department.id) || []).length;
                    const parentDepartment = department.parentDepartmentId
                        ? departmentById.get(department.parentDepartmentId)
                        : null;
                    const departmentColor = department.color || DEFAULT_DEPARTMENT_COLOR;
                    const parentTagLabel = parentDepartment ? parentDepartment.name : 'Main';
                    const parentTagColor = parentDepartment?.color || departmentColor;

                    return (
                        <Grid.Col key={department.id} span={{ base: 12, sm: 6, md: 4 }}>
                            <Card
                                padding="lg"
                                radius="md"
                                withBorder
                                style={{ cursor: 'pointer' }}
                                onClick={() => openDepartmentSidesheet(department)}
                                data-er-field="DEPARTMENT"
                            >
                                <Stack gap="xs">
                                    <Group justify="space-between" align="center" wrap="nowrap">
                                        <Text fw={700} size="md" truncate data-er-field="DEPARTMENT.department_name">
                                            {department.name}
                                        </Text>
                                        {renderParentTag(parentTagLabel, parentTagColor)}
                                    </Group>

                                    <Group justify="space-between" mt={4}>
                                        <Text size="xs" c="dimmed">{memberCount} members</Text>
                                        <Text size="xs" c="dimmed">{serviceCount} services</Text>
                                    </Group>
                                </Stack>
                            </Card>
                        </Grid.Col>
                    );
                })}
            </Grid>
        </div>
    );
}
