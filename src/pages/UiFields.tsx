import { useState } from 'react';
import { Title, Text, Stack, Card, Group, Divider, Container } from '@mantine/core';
import {
    TextInput as DsTextInput,
    SearchInput as DsSearchInput,
    NumberInput as DsNumberInput,
    Select as DsSelect,
    DateInput as DsDateInput,
    Textarea as DsTextarea,
    Checkbox as DsCheckbox,
    Radio as DsRadio,
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
    const [bootstrapText, setBootstrapText] = useState('Bootstrap text input');
    const [bootstrapSearch, setBootstrapSearch] = useState('');
    const [bootstrapNumber, setBootstrapNumber] = useState<number | string>(12);
    const [bootstrapSelect, setBootstrapSelect] = useState<string | null>('active');
    const [bootstrapDate, setBootstrapDate] = useState<string | null>('2026-02-23');
    const [bootstrapTextarea, setBootstrapTextarea] = useState('Bootstrap textarea');
    const [bootstrapCheckbox, setBootstrapCheckbox] = useState(false);
    const [bootstrapRadio, setBootstrapRadio] = useState('yes');

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
                            <Group justify="space-between" align="center">
                                <Title order={4} mb="xs">Bootstrap DS Native Field Styles</Title>
                                <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace' }}>
                                    public/bootstrap.min.css (official Quartz) + src/styles/ds/_field-tokens.scss
                                </Text>
                            </Group>
                            <Text size="xs" c="dimmed" mb="md">
                                Pure Bootstrap-driven form styles via DS wrappers. Use this section as the baseline reference.
                            </Text>
                            <Stack gap="md">
                                <div>
                                    <Group justify="space-between" align="center">
                                        <Text fw={600} size="sm">Text Input</Text>
                                        <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace' }}>
                                            src/components/EditableFields.tsx (TextInput)
                                        </Text>
                                    </Group>
                                    <DsTextInput
                                        label="Bootstrap Text"
                                        value={bootstrapText}
                                        onChange={(event) => setBootstrapText(event.currentTarget.value)}
                                    />
                                </div>

                                <div>
                                    <Group justify="space-between" align="center">
                                        <Text fw={600} size="sm">Search Input</Text>
                                        <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace' }}>
                                            src/components/EditableFields.tsx (SearchInput)
                                        </Text>
                                    </Group>
                                    <DsSearchInput
                                        label="Bootstrap Search"
                                        placeholder="Search using bootstrap style..."
                                        value={bootstrapSearch}
                                        onChange={(event) => setBootstrapSearch(event.currentTarget.value)}
                                    />
                                </div>

                                <div>
                                    <Group justify="space-between" align="center">
                                        <Text fw={600} size="sm">Number Input</Text>
                                        <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace' }}>
                                            src/components/EditableFields.tsx (NumberInput)
                                        </Text>
                                    </Group>
                                    <DsNumberInput
                                        label="Bootstrap Number"
                                        value={bootstrapNumber}
                                        onChange={setBootstrapNumber}
                                    />
                                </div>

                                <div>
                                    <Group justify="space-between" align="center">
                                        <Text fw={600} size="sm">Select Input</Text>
                                        <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace' }}>
                                            src/components/EditableFields.tsx (Select)
                                        </Text>
                                    </Group>
                                    <DsSelect
                                        label="Bootstrap Select"
                                        data={statusOptions}
                                        value={bootstrapSelect}
                                        onChange={setBootstrapSelect}
                                    />
                                </div>

                                <div>
                                    <Group justify="space-between" align="center">
                                        <Text fw={600} size="sm">Date Input</Text>
                                        <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace' }}>
                                            src/components/EditableFields.tsx (DateInput)
                                        </Text>
                                    </Group>
                                    <DsDateInput
                                        label="Bootstrap Date"
                                        value={bootstrapDate}
                                        onChange={setBootstrapDate}
                                    />
                                </div>

                                <div>
                                    <Group justify="space-between" align="center">
                                        <Text fw={600} size="sm">Textarea</Text>
                                        <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace' }}>
                                            src/components/EditableFields.tsx (Textarea)
                                        </Text>
                                    </Group>
                                    <DsTextarea
                                        label="Bootstrap Textarea"
                                        value={bootstrapTextarea}
                                        onChange={(event) => setBootstrapTextarea(event.currentTarget.value)}
                                    />
                                </div>

                                <div>
                                    <Group justify="space-between" align="center">
                                        <Text fw={600} size="sm">Checkbox</Text>
                                        <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace' }}>
                                            src/components/EditableFields.tsx (Checkbox)
                                        </Text>
                                    </Group>
                                    <DsCheckbox
                                        label="Bootstrap Checkbox"
                                        checked={bootstrapCheckbox}
                                        onChange={(event) => setBootstrapCheckbox(event.currentTarget.checked)}
                                    />
                                </div>

                                <div>
                                    <Group justify="space-between" align="center">
                                        <Text fw={600} size="sm">Radio</Text>
                                        <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace' }}>
                                            src/components/EditableFields.tsx (Radio)
                                        </Text>
                                    </Group>
                                    <Stack gap={6}>
                                        <DsRadio
                                            label="Yes"
                                            checked={bootstrapRadio === 'yes'}
                                            onChange={() => setBootstrapRadio('yes')}
                                        />
                                        <DsRadio
                                            label="No"
                                            checked={bootstrapRadio === 'no'}
                                            onChange={() => setBootstrapRadio('no')}
                                        />
                                    </Stack>
                                </div>
                            </Stack>
                        </div>
                    </Stack>
                </Card>

                <Card withBorder padding="xl" radius="md">
                    <Stack gap="lg">
                        <div>
                            <Group justify="space-between" align="center">
                                <Title order={4} mb="xs">1. Input Fields</Title>
                                <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace' }}>
                                    src/styles/ds/_field-tokens.scss + src/components/InlineEditableField.css
                                </Text>
                            </Group>
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
                            <Group justify="space-between" align="center">
                                <Title order={4} mb="xs">2. Search Fields</Title>
                                <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace' }}>
                                    src/styles/ds/_field-tokens.scss + src/components/InlineEditableField.css
                                </Text>
                            </Group>
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
                            <Group justify="space-between" align="center">
                                <Title order={4} mb="xs">3. Locked Input Fields</Title>
                                <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace' }}>
                                    src/styles/ds/_field-tokens.scss + src/components/InlineEditableField.css
                                </Text>
                            </Group>
                            <Text size="xs" c="dimmed" mb="md">Read-only fields with dashed border and "Locked" visual state.</Text>
                            <InlineLockedInput
                                label="System ID (Immutable)"
                                value="SYS-9982-X"
                            />
                        </div>

                        <Divider />

                        <div>
                            <Group justify="space-between" align="center">
                                <Title order={4} mb="xs">4. Selection Fields</Title>
                                <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace' }}>
                                    src/styles/ds/_field-tokens.scss + src/components/InlineEditableField.css
                                </Text>
                            </Group>
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
                            <Group justify="space-between" align="center">
                                <Title order={4} mb="xs">5. Date Picker Fields</Title>
                                <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace' }}>
                                    src/styles/ds/_field-tokens.scss + src/components/InlineEditableField.css
                                </Text>
                            </Group>
                            <Text size="xs" c="dimmed" mb="md">No edit button. Click to open date picker.</Text>
                            <InlineDateInput
                                label="Joining Date"
                                value={date}
                                onSave={(val) => setDate(val)}
                            />
                        </div>

                        <Divider />

                        <div>
                            <Group justify="space-between" align="center">
                                <Title order={4} mb="xs">6. Text Area Fields</Title>
                                <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace' }}>
                                    src/styles/ds/_field-tokens.scss + src/components/InlineEditableField.css
                                </Text>
                            </Group>
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
