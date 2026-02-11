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
        setIsEditing: (val: boolean) => void;
        draftValue: InlineValue;
        setDraftValue: (val: InlineValue) => void;
        handleSave: (val?: InlineValue) => void;
        handleCancel: () => void;
        isSaving: boolean;
    }) => React.ReactNode;
    disabled?: boolean;
    className?: string;
    hideEditButton?: boolean;
    hideActionButtons?: boolean;
    locked?: boolean;
    disableClickToEdit?: boolean;
}

export function InlineField({
    label,
    value,
    onSave,
    children,
    disabled = false,
    className,
    hideEditButton = false,
    hideActionButtons = false,
    locked = false,
    disableClickToEdit = false,
}: InlineFieldProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [draftValue, setDraftValue] = useState<InlineValue>(value);
    const [isHoverSuppressed, setIsHoverSuppressed] = useState(false);

    useEffect(() => {
        if (!isEditing) {
            setDraftValue(value);
        }
    }, [value, isEditing]);

    const hasChanges = String(value) !== String(draftValue);

    const handleSave = async (valueOverride?: InlineValue) => {
        if (isSaving || locked) return;
        
        const valueToSave = valueOverride !== undefined ? valueOverride : draftValue;
        const actualHasChanges = valueOverride !== undefined 
            ? String(value) !== String(valueOverride)
            : hasChanges;

        if (!actualHasChanges) {
            setIsEditing(false);
            setIsHoverSuppressed(true);
            return;
        }

        try {
            setIsSaving(true);
            await onSave(valueToSave);
            setIsEditing(false);
            setIsHoverSuppressed(true);
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
        setIsHoverSuppressed(true);
    };

    const rootClasses = [
        'editable-field',
        'editable-field--inline',
        isEditing ? 'is-editing' : '',
        isSaving ? 'is-saving' : '',
        disabled ? 'is-disabled' : '',
        locked ? 'editable-field--locked' : '',
        hideActionButtons ? 'editable-field--no-actions' : '',
        isHoverSuppressed ? 'is-hover-suppressed' : '',
        className
    ].filter(Boolean).join(' ');

    const handleControlClick = () => {
        if (!isEditing && !disabled && !locked && !disableClickToEdit && hideEditButton) {
            setIsEditing(true);
            setIsHoverSuppressed(false);
        }
    };

    return (
        <div 
            className={rootClasses}
            onMouseLeave={() => setIsHoverSuppressed(false)}
            onMouseEnter={() => !isEditing && setIsHoverSuppressed(false)}
        >
            <Text size="sm" className="editable-field__label">{label}</Text>
            <div 
                className="editable-field__control"
                onClick={handleControlClick}
                style={{ cursor: !isEditing && hideEditButton && !disabled && !locked && !disableClickToEdit ? 'pointer' : 'default' }}
            >
                {children({
                    isEditing,
                    setIsEditing,
                    draftValue,
                    setDraftValue,
                    handleSave,
                    handleCancel,
                    isSaving,
                })}
                <div className="editable-field__actions">
                    {isSaving ? (
                        <div className="editable-field__loader">
                            <Loader size={14} />
                        </div>
                    ) : !isEditing && !locked ? (
                        !hideEditButton && (
                            <ActionIcon
                                variant="subtle"
                                onClick={() => !disabled && setIsEditing(true)}
                                disabled={disabled}
                                size="sm"
                            >
                                <IconPencil size={16} />
                            </ActionIcon>
                        )
                    ) : isEditing && !hideActionButtons ? (
                        <>
                            <ActionIcon
                                variant="subtle"
                                color="green"
                                onClick={(e) => { e.stopPropagation(); handleSave(); }}
                                size="sm"
                            >
                                <IconCheck size={16} />
                            </ActionIcon>
                            <ActionIcon
                                variant="subtle"
                                color="red"
                                onClick={(e) => { e.stopPropagation(); handleCancel(); }}
                                size="sm"
                            >
                                <IconX size={16} />
                            </ActionIcon>
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

const commonInputClassNames = { 
    root: 'editable-field__mantine-root',
    input: 'editable-field__input' 
};

// ==================== 1. INPUT FIELDS ====================

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

// ==================== 2. LOCKED INPUT FIELDS ====================

export function InlineLockedInput({ label, value, ...props }: TextInputProps) {
    return (
        <InlineField 
            label={label as string} 
            value={value as string} 
            onSave={() => {}} 
            disabled={true}
            locked={true}
            hideEditButton={true}
        >
            {({ draftValue }) => (
                <MantineTextInput
                    {...props}
                    variant="unstyled"
                    value={(draftValue as string) || ''}
                    readOnly
                    classNames={commonInputClassNames}
                />
            )}
        </InlineField>
    );
}

// ==================== 3. SELECTION FIELDS ====================

export function InlineSelect({ label, value, onSave, ...props }: SelectProps & { onSave: (val: string | null) => Promise<void> | void }) {
    return (
        <InlineField 
            label={label as string} 
            value={value as string} 
            onSave={(val) => onSave(val as string | null)} 
            disabled={props.disabled} 
            hideEditButton 
            hideActionButtons
            disableClickToEdit
        >
            {({ draftValue, setDraftValue, handleSave, setIsEditing }) => (
                <MantineSelect
                    {...props}
                    variant="unstyled"
                    value={draftValue as string}
                    onChange={(val) => {
                        setDraftValue(val);
                        handleSave(val);
                    }}
                    onDropdownOpen={() => setIsEditing(true)}
                    onDropdownClose={() => setIsEditing(false)}
                    pointer={!props.disabled}
                    classNames={commonInputClassNames}
                    comboboxProps={{ withinPortal: true, zIndex: 3000, ...props.comboboxProps }}
                />
            )}
        </InlineField>
    );
}

// ==================== 4. DATE PICKER FIELDS ====================

export function InlineDateInput({ label, value, onSave, ...props }: DateInputProps & { onSave: (val: Date | null) => Promise<void> | void }) {
    return (
        <InlineField 
            label={label as string} 
            value={value as Date} 
            onSave={(val) => onSave(val as Date | null)} 
            disabled={props.disabled} 
            hideEditButton 
            hideActionButtons
            disableClickToEdit
        >
            {({ draftValue, setDraftValue, handleSave, setIsEditing }) => (
                <MantineDateInput
                    {...props}
                    variant="unstyled"
                    value={draftValue ? new Date(draftValue as string | number | Date) : null}
                    onChange={(val) => {
                        setDraftValue(val);
                        handleSave(val);
                    }}
                    onDropdownOpen={() => setIsEditing(true)}
                    onDropdownClose={() => setIsEditing(false)}
                    pointer={!props.disabled}
                    classNames={commonInputClassNames}
                    popoverProps={{ withinPortal: true, zIndex: 3000, ...props.popoverProps }}
                />
            )}
        </InlineField>
    );
}

// ==================== 5. TEXT AREA FIELDS ====================

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