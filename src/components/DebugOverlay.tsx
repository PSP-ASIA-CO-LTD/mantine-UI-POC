import { useEffect, useState, useCallback, useRef } from 'react';
import { useDebug } from '../contexts/DebugContext';
import { Badge, Stack, Text, Paper, Group, CloseButton, ActionIcon, Tooltip } from '@mantine/core';
import { IconBug, IconBugOff, IconGripVertical } from '@tabler/icons-react';
import './DebugOverlay.css';

interface FieldInfo {
    entity: string;
    field: string;
    element: HTMLElement;
    rect: DOMRect;
}

// Entity color mapping based on ER diagram domains
const entityColors: Record<string, string> = {
    // Client & Business Domain
    CLIENT: '#8e24aa',
    BUSINESS: '#8e24aa',
    // Venue Domain
    VENUE: '#c2185b',
    ROOM: '#c2185b',
    // Organization Domain
    DEPARTMENT: '#f57c00',
    STAFF: '#f57c00',
    STAFF_VENUE: '#f57c00',
    // Service Domain
    TASK: '#388e3c',
    // Sale System
    SALE_PACKAGE: '#f9a825',
    PACKAGE_ITEM: '#f9a825',
};

function parseErField(value: string): { entity: string; field: string } | null {
    const parts = value.split('.');
    if (parts.length !== 2) return null;
    return { entity: parts[0], field: parts[1] };
}

export function DebugOverlay() {
    const { isDebugMode, toggleDebugMode } = useDebug();
    const [fields, setFields] = useState<FieldInfo[]>([]);
    const [hoveredFieldId, setHoveredFieldId] = useState<string | null>(null);

    // Drag state
    const [panelPosition, setPanelPosition] = useState({ x: 20, y: 20 });
    const [isDragging, setIsDragging] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });
    const panelRef = useRef<HTMLDivElement>(null);

    // Drag handlers
    const handleDragStart = useCallback((e: React.MouseEvent) => {
        if (!panelRef.current) return;
        setIsDragging(true);
        const rect = panelRef.current.getBoundingClientRect();
        dragOffset.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    }, []);

    useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (e: MouseEvent) => {
            const newX = window.innerWidth - e.clientX - (panelRef.current?.offsetWidth || 280) + dragOffset.current.x;
            const newY = e.clientY - dragOffset.current.y;

            // Constrain to viewport
            const maxX = window.innerWidth - 100;
            const maxY = window.innerHeight - 100;

            setPanelPosition({
                x: Math.max(0, Math.min(newX, maxX)),
                y: Math.max(0, Math.min(newY, maxY)),
            });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    const scanForFields = useCallback(() => {
        const elements = document.querySelectorAll('[data-er-field]');
        const fieldInfos: FieldInfo[] = [];

        elements.forEach((el) => {
            const htmlEl = el as HTMLElement;
            const value = htmlEl.getAttribute('data-er-field');
            if (!value) return;

            const parsed = parseErField(value);
            if (!parsed) return;

            fieldInfos.push({
                entity: parsed.entity,
                field: parsed.field,
                element: htmlEl,
                rect: htmlEl.getBoundingClientRect(),
            });
        });

        setFields(fieldInfos);
    }, []);

    // Rescan when debug mode changes or on scroll/resize
    useEffect(() => {
        if (!isDebugMode) {
            setFields([]);
            return;
        }

        scanForFields();

        // Rescan on scroll and resize
        const handleChange = () => scanForFields();
        window.addEventListener('scroll', handleChange, true);
        window.addEventListener('resize', handleChange);

        // MutationObserver for DOM changes
        const observer = new MutationObserver(handleChange);
        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
            window.removeEventListener('scroll', handleChange, true);
            window.removeEventListener('resize', handleChange);
            observer.disconnect();
        };
    }, [isDebugMode, scanForFields]);

    // Add/remove debug class to body
    useEffect(() => {
        if (isDebugMode) {
            document.body.classList.add('debug-mode');
        } else {
            document.body.classList.remove('debug-mode');
        }
    }, [isDebugMode]);

    // Create a field identifier helper
    const getFieldId = (entity: string, field: string) => `${entity}.${field}`;

    const handleFieldClick = (entity: string, field: string) => {
        // Find the first instance of this field and scroll to it
        const firstInstance = fields.find(
            f => f.entity === entity && f.field === field
        );
        if (firstInstance) {
            firstInstance.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    // Group fields by entity, then by unique field name
    // For display, we only show one entry per unique field
    const groupedFields = fields.reduce((acc, field) => {
        if (!acc[field.entity]) {
            acc[field.entity] = new Map<string, FieldInfo>();
        }
        const fieldId = field.field;
        // Only keep the first instance of each field for display
        if (!acc[field.entity].has(fieldId)) {
            acc[field.entity].set(fieldId, field);
        }
        return acc;
    }, {} as Record<string, Map<string, FieldInfo>>);

    return (
        <>
            {/* Toggle Button - Always visible */}
            <Tooltip label={isDebugMode ? 'Exit Debug Mode (Ctrl+Shift+D)' : 'Debug Mode (Ctrl+Shift+D)'}>
                <ActionIcon
                    className="debug-toggle-btn"
                    variant={isDebugMode ? 'filled' : 'light'}
                    color={isDebugMode ? 'red' : 'gray'}
                    size="lg"
                    onClick={toggleDebugMode}
                    aria-label="Toggle Debug Mode"
                >
                    {isDebugMode ? <IconBugOff size={20} /> : <IconBug size={20} />}
                </ActionIcon>
            </Tooltip>

            {isDebugMode && (
                <>
                    {/* Field Highlights - Only show when hovered */}
                    {fields.map((field, idx) => {
                        const color = entityColors[field.entity] || '#666';
                        const fieldId = getFieldId(field.entity, field.field);
                        const isHovered = hoveredFieldId === fieldId;
                        
                        // Only render if this field is being hovered
                        if (!isHovered) return null;
                        
                        // Recalculate rect for accuracy
                        const currentRect = field.element.getBoundingClientRect();
                        return (
                            <div
                                key={`${field.entity}.${field.field}-${idx}`}
                                className="debug-field-highlight hovered"
                                style={{
                                    position: 'fixed',
                                    left: currentRect.left,
                                    top: currentRect.top,
                                    width: currentRect.width,
                                    height: currentRect.height,
                                    border: `2px solid ${color}`,
                                    borderRadius: 4,
                                    pointerEvents: 'none',
                                    zIndex: 99998,
                                }}
                            >
                                <span
                                    className="debug-field-label"
                                    style={{
                                        position: 'absolute',
                                        top: -28,
                                        left: 0,
                                        backgroundColor: color,
                                        color: 'white',
                                        fontSize: 12,
                                        fontWeight: 600,
                                        padding: '4px 8px',
                                        borderRadius: 4,
                                        whiteSpace: 'nowrap',
                                        fontFamily: 'monospace',
                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                                        zIndex: 999999,
                                    }}
                                >
                                    {field.entity}.{field.field}
                                </span>
                            </div>
                        );
                    })}

                    {/* Side Panel */}
                    <Paper
                        ref={panelRef}
                        className={`debug-panel ${isDragging ? 'dragging' : ''}`}
                        shadow="xl"
                        p="md"
                        withBorder
                        style={{
                            right: panelPosition.x,
                            top: panelPosition.y,
                        }}
                    >
                        <Group
                            justify="space-between"
                            mb="sm"
                            className="debug-panel-header"
                            onMouseDown={handleDragStart}
                        >
                            <Group gap="xs">
                                <IconGripVertical size={14} style={{ cursor: 'grab', opacity: 0.5 }} />
                                <IconBug size={16} color="red" />
                                <Text fw={600} size="sm">ER Field Mapping</Text>
                            </Group>
                            <CloseButton size="sm" onClick={toggleDebugMode} />
                        </Group>

                        {Object.keys(groupedFields).length === 0 ? (
                            <Text size="xs" c="dimmed" ta="center" py="md">
                                No annotated fields found on this page.
                            </Text>
                        ) : (
                            <Stack gap="sm">
                                {Object.entries(groupedFields).map(([entity, fieldMap]) => {
                                    const uniqueFields = Array.from(fieldMap.values());
                                    // Count total instances of each field
                                    const fieldCounts = fields.reduce((acc, field) => {
                                        if (field.entity === entity) {
                                            const count = acc.get(field.field) || 0;
                                            acc.set(field.field, count + 1);
                                        }
                                        return acc;
                                    }, new Map<string, number>());

                                    return (
                                        <div key={entity}>
                                            <Badge
                                                size="sm"
                                                color="gray"
                                                variant="outline"
                                                mb={4}
                                                style={{
                                                    borderColor: entityColors[entity] || '#666',
                                                    color: entityColors[entity] || '#666',
                                                }}
                                            >
                                                {entity}
                                            </Badge>
                                            <Stack gap={4}>
                                                {uniqueFields.map((field) => {
                                                    const fieldId = getFieldId(entity, field.field);
                                                    const count = fieldCounts.get(field.field) || 1;
                                                    const isHovered = hoveredFieldId === fieldId;
                                                    return (
                                                        <Text
                                                            key={fieldId}
                                                            size="xs"
                                                            className="debug-field-item"
                                                            onClick={() => handleFieldClick(entity, field.field)}
                                                            onMouseEnter={() => setHoveredFieldId(fieldId)}
                                                            onMouseLeave={() => setHoveredFieldId(null)}
                                                            style={{
                                                                cursor: 'pointer',
                                                                padding: '2px 8px',
                                                                borderRadius: 4,
                                                                backgroundColor: isHovered ? '#f0f0f0' : 'transparent',
                                                                fontFamily: 'monospace',
                                                            }}
                                                        >
                                                            .{field.field}
                                                            {count > 1 && (
                                                                <Text
                                                                    component="span"
                                                                    size="xs"
                                                                    c="dimmed"
                                                                    ml={4}
                                                                >
                                                                    ({count})
                                                                </Text>
                                                            )}
                                                        </Text>
                                                    );
                                                })}
                                            </Stack>
                                        </div>
                                    );
                                })}
                            </Stack>
                        )}
                    </Paper>
                </>
            )}
        </>
    );
}
