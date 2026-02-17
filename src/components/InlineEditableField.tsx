import { ActionIcon, NumberInput, Text, TextInput, Textarea } from '@mantine/core';
import { IconCheck, IconPencil, IconX } from '@tabler/icons-react';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import './InlineEditableField.css';

type InlineEditableFieldType = 'text' | 'email' | 'tel' | 'textarea' | 'number';

interface InlineEditableFieldProps {
    label: string;
    value: string | number;
    type?: InlineEditableFieldType;
    placeholder?: string;
    disabled?: boolean;
    onSave: (value: string | number) => Promise<void> | void;
}

const normalizeValue = (value: string | number | null | undefined) => {
    if (value === null || value === undefined) return '';
    return value;
};

export function InlineEditableField({
    label,
    value,
    type = 'text',
    placeholder,
    disabled = false,
    onSave,
}: InlineEditableFieldProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [draftValue, setDraftValue] = useState<string | number>(normalizeValue(value));
    const controlRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isEditing) {
            setDraftValue(normalizeValue(value));
        }
    }, [value, isEditing]);

    useEffect(() => {
        if (isEditing) {
            const input = controlRef.current?.querySelector('input, textarea') as
                | HTMLInputElement
                | HTMLTextAreaElement
                | null;
            input?.focus();
            input?.select?.();
        }
    }, [isEditing]);

    const hasChanges = String(normalizeValue(value)) !== String(normalizeValue(draftValue));

    const handleStartEdit = () => {
        if (disabled || isSaving) return;
        setIsEditing(true);
    };

    const handleCancel = () => {
        if (isSaving) return;
        setDraftValue(normalizeValue(value));
        setIsEditing(false);
    };

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

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (event.key === 'Enter') {
            if (type === 'textarea' && event.shiftKey) {
                return;
            }
            event.preventDefault();
            void handleSave();
        }
        if (event.key === 'Escape') {
            event.preventDefault();
            handleCancel();
        }
    };

    const sharedInputProps = {
        'aria-label': label,
        placeholder,
        readOnly: !isEditing,
        onKeyDown: handleKeyDown,
        classNames: {
            input: 'editable-field__input',
        },
    } as const;

    return (
        <div
            className={`editable-field editable-field--inline${isEditing ? ' is-editing' : ''}${disabled ? ' is-disabled' : ''}`}
        >
            <Text size="sm" className="editable-field__label">
                {label}
            </Text>
            <div className="editable-field__control" ref={controlRef}>
                {type === 'textarea' ? (
                    <Textarea
                        {...sharedInputProps}
                        value={draftValue}
                        onChange={(event) => setDraftValue(event.currentTarget.value)}
                        minRows={2}
                        autosize
                        maxRows={6}
                        variant="unstyled"
                    />
                ) : type === 'number' ? (
                    <NumberInput
                        {...sharedInputProps}
                        value={draftValue}
                        onChange={(val) => setDraftValue(val === '' ? '' : val)}
                        hideControls
                        variant="unstyled"
                        readOnly={!isEditing}
                    />
                ) : (
                    <TextInput
                        {...sharedInputProps}
                        type={type}
                        value={draftValue}
                        onChange={(event) => setDraftValue(event.currentTarget.value)}
                        variant="unstyled"
                    />
                )}

                <div className="editable-field__actions">
                    {!isEditing ? (
                        <ActionIcon
                            variant="subtle"
                            aria-label={`Edit ${label}`}
                            onClick={handleStartEdit}
                            disabled={disabled}
                        >
                            <IconPencil size={16} />
                        </ActionIcon>
                    ) : (
                        <>
                            <ActionIcon
                                variant="subtle"
                                color="green"
                                aria-label={`Save ${label}`}
                                onClick={handleSave}
                                disabled={isSaving}
                            >
                                <IconCheck size={16} />
                            </ActionIcon>
                            <ActionIcon
                                variant="subtle"
                                color="red"
                                aria-label={`Cancel ${label}`}
                                onClick={handleCancel}
                                disabled={isSaving}
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
