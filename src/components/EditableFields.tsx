import {
    ActionIcon,
    Text,
    TextInput as MantineTextInput,
    Textarea as MantineTextarea,
    Select as MantineSelect,
    MultiSelect as MantineMultiSelect,
    NumberInput as MantineNumberInput,
    PasswordInput as MantinePasswordInput,
    FileInput as MantineFileInput,
    type TextInputProps,
    type TextareaProps,
    type SelectProps,
    type MultiSelectProps,
    type NumberInputProps,
    type PasswordInputProps,
    type FileInputProps,
    Loader,
} from '@mantine/core';
import { DateInput as MantineDateInput, type DateInputProps } from '@mantine/dates';
import { IconCheck, IconPencil, IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import './InlineEditableField.css';

type ClassNames = Record<string, string | undefined>;

const baseFormClassNames: ClassNames = {
    root: 'editable-field editable-field--form',
    label: 'editable-field__label',
    input: 'editable-field__input',
};

const mergeClassNames = (base: ClassNames, incoming?: ClassNames) => {
    if (!incoming) return { ...base };
    const merged: ClassNames = { ...base };
    Object.entries(incoming).forEach(([key, value]) => {
        if (!value) return;
        merged[key] = [base[key], value].filter(Boolean).join(' ');
    });
    return merged;
};

// --- Always Edit (Form) Components ---

export function TextInput(props: TextInputProps) {
    return (
        <MantineTextInput
            {...props}
            variant={props.variant ?? 'unstyled'}
            classNames={mergeClassNames(baseFormClassNames, props.classNames as ClassNames)}
        />
    );
}

export function Textarea(props: TextareaProps) {
    return (
        <MantineTextarea
            {...props}
            variant={props.variant ?? 'unstyled'}
            classNames={mergeClassNames(baseFormClassNames, props.classNames as ClassNames)}
        />
    );
}

export function Select(props: SelectProps) {
    return (
        <MantineSelect
            {...props}
            variant={props.variant ?? 'unstyled'}
            classNames={mergeClassNames(baseFormClassNames, props.classNames as ClassNames)}
        />
    );
}

export function MultiSelect(props: MultiSelectProps) {
    return (
        <MantineMultiSelect
            {...props}
            variant={props.variant ?? 'unstyled'}
            classNames={mergeClassNames(baseFormClassNames, props.classNames as ClassNames)}
        />
    );
}

export function NumberInput(props: NumberInputProps) {
    return (
        <MantineNumberInput
            {...props}
            variant={props.variant ?? 'unstyled'}
            classNames={mergeClassNames(baseFormClassNames, props.classNames as ClassNames)}
        />
    );
}

export function PasswordInput(props: PasswordInputProps) {
    return (
        <MantinePasswordInput
            {...props}
            variant={props.variant ?? 'unstyled'}
            classNames={mergeClassNames(baseFormClassNames, props.classNames as ClassNames)}
        />
    );
}

export function FileInput(props: FileInputProps) {
    return (
        <MantineFileInput
            {...props}
            variant={props.variant ?? 'unstyled'}
            classNames={mergeClassNames(baseFormClassNames, props.classNames as ClassNames)}
        />
    );
}

export function DateInput(props: DateInputProps) {
    return (
        <MantineDateInput
            {...props}
            variant={props.variant ?? 'unstyled'}
            classNames={mergeClassNames(baseFormClassNames, props.classNames as ClassNames)}
        />
    );
}

// --- Inline Edit (With Buttons) Components ---

type InlineValue = string | number | Date | boolean | null;

interface InlineFieldProps {
    label: string;
    value: InlineValue;
    onSave: (value: InlineValue) => Promise<void> | void;
    children: (props: {
        isEditing: boolean;
        draftValue: InlineValue;
        setDraftValue: (val: InlineValue) => void;
        handleSave: () => void;
        handleCancel: () => void;
        isSaving: boolean;
    }) => React.ReactNode;
    disabled?: boolean;
    className?: string;
}

export function InlineField({
    label,
    value,
    onSave,
    children,
    disabled = false,
    className,
}: InlineFieldProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [draftValue, setDraftValue] = useState<InlineValue>(value);

    useEffect(() => {
        if (!isEditing) {
            setDraftValue(value);
        }
    }, [value, isEditing]);

    const hasChanges = String(value) !== String(draftValue);

    const handleSave = async () => {
        if (isSaving) return;
        if (!hasChanges) {
            setIsEditing(false);
            return;
        }

        try {
            setIsSaving(true);
            await onSave(draftValue);
            setIsEditing(false);
        } catch (error) {
            console.error(`Failed to save ${label}:`, error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        if (isSaving) return;
        setDraftValue(value);
        setIsEditing(false);
    };

    return (
        <div className={`editable-field editable-field--inline${isEditing ? ' is-editing' : ''}${disabled ? ' is-disabled' : ''} ${className || ''}`}>
            <Text size="sm" className="editable-field__label">{label}</Text>
            <div className="editable-field__control">
                {children({
                    isEditing,
                    draftValue,
                    setDraftValue,
                    handleSave,
                    handleCancel,
                    isSaving,
                })}
                <div className="editable-field__actions">
                    {!isEditing ? (
                        <ActionIcon
                            variant="subtle"
                            onClick={() => !disabled && setIsEditing(true)}
                            disabled={disabled}
                            size="sm"
                        >
                            <IconPencil size={16} />
                        </ActionIcon>
                    ) : (
                        <>
                            <ActionIcon
                                variant="subtle"
                                color="green"
                                onClick={handleSave}
                                disabled={isSaving}
                                size="sm"
                            >
                                {isSaving ? <Loader size={14} /> : <IconCheck size={16} />}
                            </ActionIcon>
                            <ActionIcon
                                variant="subtle"
                                color="red"
                                onClick={handleCancel}
                                disabled={isSaving}
                                size="sm"
                            >
                                <IconX size={16} />
                            </ActionIcon>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

const commonInputClassNames = { input: 'editable-field__input' };

export function InlineTextInput({ label, value, onSave, ...props }: TextInputProps & { onSave: (val: string) => Promise<void> | void }) {
    return (
        <InlineField label={label as string} value={value as string} onSave={(val) => onSave(val as string)} disabled={props.disabled}>
            {({ draftValue, setDraftValue, handleSave, handleCancel, isEditing }) => (
                <MantineTextInput
                    {...props}
                    variant="unstyled"
                    value={(draftValue as string) || ''}
                    onChange={(e) => setDraftValue(e.currentTarget.value)}
                    readOnly={!isEditing}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSave();
                        if (e.key === 'Escape') handleCancel();
                    }}
                    classNames={commonInputClassNames}
                />
            )}
        </InlineField>
    );
}

export function InlineTextarea({ label, value, onSave, ...props }: TextareaProps & { onSave: (val: string) => Promise<void> | void }) {
    return (
        <InlineField label={label as string} value={value as string} onSave={(val) => onSave(val as string)} disabled={props.disabled}>
            {({ draftValue, setDraftValue, isEditing }) => (
                <MantineTextarea
                    {...props}
                    variant="unstyled"
                    value={(draftValue as string) || ''}
                    onChange={(e) => setDraftValue(e.currentTarget.value)}
                    readOnly={!isEditing}
                    autosize
                    minRows={1}
                    classNames={commonInputClassNames}
                />
            )}
        </InlineField>
    );
}

export function InlineSelect({ label, value, onSave, ...props }: SelectProps & { onSave: (val: string | null) => Promise<void> | void }) {
    return (
        <InlineField label={label as string} value={value as string} onSave={(val) => onSave(val as string | null)} disabled={props.disabled}>
            {({ draftValue, setDraftValue, isEditing }) => (
                <MantineSelect
                    {...props}
                    variant="unstyled"
                    value={draftValue as string}
                    onChange={setDraftValue}
                    readOnly={!isEditing}
                    pointer={isEditing}
                    classNames={commonInputClassNames}
                />
            )}
        </InlineField>
    );
}

export function InlineNumberInput({ label, value, onSave, ...props }: NumberInputProps & { onSave: (val: string | number) => Promise<void> | void }) {
    return (
        <InlineField label={label as string} value={value as number} onSave={(val) => onSave(val as string | number)} disabled={props.disabled}>
            {({ draftValue, setDraftValue, handleSave, handleCancel, isEditing }) => (
                <MantineNumberInput
                    {...props}
                    variant="unstyled"
                    value={draftValue as number}
                    onChange={setDraftValue}
                    readOnly={!isEditing}
                    hideControls
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSave();
                        if (e.key === 'Escape') handleCancel();
                    }}
                    classNames={commonInputClassNames}
                />
            )}
        </InlineField>
    );
}

export function InlineDateInput({ label, value, onSave, ...props }: DateInputProps & { onSave: (val: Date | null) => Promise<void> | void }) {
    return (
        <InlineField label={label as string} value={value as Date} onSave={(val) => onSave(val as Date | null)} disabled={props.disabled}>
            {({ draftValue, setDraftValue, isEditing }) => (
                <MantineDateInput
                    {...props}
                    variant="unstyled"
                    value={draftValue ? new Date(draftValue as any) : null}
                    onChange={(val) => setDraftValue(val as any)}
                    readOnly={!isEditing}
                    pointer={isEditing}
                    classNames={commonInputClassNames}
                />
            )}
        </InlineField>
    );
}