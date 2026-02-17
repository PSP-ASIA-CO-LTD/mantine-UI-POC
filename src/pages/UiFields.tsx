import { useState } from 'react';
import { Title, Text, Stack, Card, Group, Divider, Container } from '@mantine/core';
import {
    InlineTextInput,
    InlineNumberInput,
    InlineLockedInput,
    InlineSelect,
    InlineDateInput,
    InlineTextarea,
    IconFieldInput
} from '../components/EditableFields';
import { IconSearch } from '@tabler/icons-react';

export function UiFields() {
    const [text, setText] = useState('John Doe');
    const [searchText, setSearchText] = useState('');
    const [number, setNumber] = useState(42);
    const [select, setSelect] = useState('active');
    const [date, setDate] = useState<Date | null>(new Date());
    const [textarea, setTextarea] = useState('This is a long description about the resident that might span multiple lines.');

    const prefixOptions = [
        { value: 'mr', label: 'Mr.' },
        { value: 'mrs', label: 'Mrs.' },
        { value: 'miss', label: 'Miss' },
        { value: 'ms', label: 'Ms.' },
        { value: 'dr', label: 'Dr.' },
    ];

    const statusOptions = [
        { value: 'active', label: 'Active' },
        { value: 'on_leave', label: 'On Leave' },
        { value: 'resigned', label: 'Resigned' },
    ];

    return (
        <Container size="sm" py="xl">
            <Stack gap="xl">
                <div>
                    <Title order={2}>UI Fields</Title>
                    <Text c="dimmed" size="sm">Showcase of systematic inline editable fields and their behaviors.</Text>
                </div>

                <Card withBorder padding="xl" radius="md">
                    <Stack gap="lg">
                        <div>
                            <Title order={4} mb="xs">1. Input Fields</Title>
                            <Text size="xs" c="dimmed" mb="md">Standard inputs with explicit edit buttons (Pencil icon).</Text>
                            <Stack gap="md">
                                <InlineTextInput
                                    label="Full Name"
                                    value={text}
                                    onSave={(val) => setText(val)}
                                />
                                <InlineNumberInput
                                    label="Years of Experience"
                                    value={number}
                                    onSave={(val) => setNumber(val as number)}
                                />
                            </Stack>
                        </div>

                        <Divider />

                        <div>
                            <Title order={4} mb="xs">2. Search Fields</Title>
                            <Text size="xs" c="dimmed" mb="md">Standard search input with icon and placeholder padding fix.</Text>
                            <IconFieldInput
                                icon={<IconSearch size={16} />}
                                placeholder="Search everything..." 
                                value={searchText}
                                onChange={(e) => setSearchText(e.currentTarget.value)}
                            />
                        </div>

                        <Divider />

                        <div>
                            <Title order={4} mb="xs">3. Locked Input Fields</Title>
                            <Text size="xs" c="dimmed" mb="md">Read-only fields with dashed border and "Locked" visual state.</Text>
                            <InlineLockedInput
                                label="System ID (Immutable)"
                                value="SYS-9982-X"
                            />
                        </div>

                        <Divider />

                        <div>
                            <Title order={4} mb="xs">4. Selection Fields</Title>
                            <Text size="xs" c="dimmed" mb="md">No edit button. Click the field directly to trigger selection.</Text>
                            <Stack gap="md">
                                <InlineSelect
                                    label="Prefix"
                                    value="mr"
                                    data={prefixOptions}
                                    onSave={(val) => console.log('Prefix saved:', val)}
                                />
                                <InlineSelect
                                    label="Work Status"
                                    value={select}
                                    data={statusOptions}
                                    onSave={(val) => setSelect(val || 'active')}
                                />
                            </Stack>
                        </div>

                        <Divider />

                        <div>
                            <Title order={4} mb="xs">5. Date Picker Fields</Title>
                            <Text size="xs" c="dimmed" mb="md">No edit button. Click to open date picker.</Text>
                            <InlineDateInput
                                label="Joining Date"
                                value={date}
                                onSave={(val) => setDate(val)}
                            />
                        </div>

                        <Divider />

                        <div>
                            <Title order={4} mb="xs">6. Text Area Fields</Title>
                            <Text size="xs" c="dimmed" mb="md">Multi-line text support with auto-resize.</Text>
                            <InlineTextarea
                                label="Biography"
                                value={textarea}
                                onSave={(val) => setTextarea(val)}
                            />
                        </div>
                    </Stack>
                </Card>

                <Card withBorder padding="md" radius="md" bg="gray.0">
                    <Title order={5} size="xs" c="dimmed" mb="xs" style={{ textTransform: 'uppercase' }}>Debug State</Title>
                    <Stack gap={4}>
                        <Group justify="space-between">
                            <Text size="xs" fw={700}>Name:</Text>
                            <Text size="xs">{text}</Text>
                        </Group>
                        <Group justify="space-between">
                            <Text size="xs" fw={700}>Years:</Text>
                            <Text size="xs">{number}</Text>
                        </Group>
                        <Group justify="space-between">
                            <Text size="xs" fw={700}>Status:</Text>
                            <Text size="xs">{select}</Text>
                        </Group>
                        <Group justify="space-between">
                            <Text size="xs" fw={700}>Date:</Text>
                            <Text size="xs">{date?.toLocaleDateString()}</Text>
                        </Group>
                    </Stack>
                </Card>
            </Stack>
        </Container>
    );
}
