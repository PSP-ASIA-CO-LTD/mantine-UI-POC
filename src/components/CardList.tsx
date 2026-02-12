import { ActionIcon, Card, Group, Stack, Text } from '@mantine/core';
import { IconCheck, IconMinus, IconPencil, IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import type { MouseEvent, ReactNode } from 'react';

interface CardListProps {
    title: ReactNode;
    badge?: ReactNode;
    isEditing?: boolean;
    isCardEditing?: boolean;
    onRemove?: () => void;
    onStartEdit?: () => void;
    onCancelEdit?: () => void;
    onSubmitEdit?: () => void | Promise<void>;
    disableSubmitEdit?: boolean;
    editTitle?: ReactNode;
    editDescription?: ReactNode;
    editMeta?: ReactNode;
    description?: ReactNode;
    meta?: ReactNode;
    cardDataErField?: string;
    titleDataErField?: string;
    descriptionDataErField?: string;
    className?: string;
    mb?: string | number;
}

export function CardList({
    title,
    badge,
    isEditing = false,
    isCardEditing = false,
    onRemove,
    onStartEdit,
    onCancelEdit,
    onSubmitEdit,
    disableSubmitEdit = false,
    editTitle,
    editDescription,
    editMeta,
    description,
    meta,
    cardDataErField,
    titleDataErField,
    descriptionDataErField,
    className,
    mb,
}: CardListProps) {
    const [editing, setEditing] = useState(isCardEditing);

    useEffect(() => {
        setEditing(isCardEditing);
    }, [isCardEditing]);

    useEffect(() => {
        if (!isEditing) setEditing(false);
    }, [isEditing]);

    const canEdit = Boolean(onStartEdit || onCancelEdit || onSubmitEdit || editTitle || editDescription || editMeta);

    const handleRemove = (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        onRemove?.();
    };

    const handleStartEdit = (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        setEditing(true);
        onStartEdit?.();
    };

    const handleCancelEdit = (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        setEditing(false);
        onCancelEdit?.();
    };

    const handleSubmitEdit = async (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        await onSubmitEdit?.();
        setEditing(false);
    };

    const renderTitle = () => {
        const view = editing && editTitle ? editTitle : title;

        if (typeof view === 'string' || typeof view === 'number') {
            return (
                <Text fw={500} data-er-field={titleDataErField}>
                    {view}
                </Text>
            );
        }

        if (titleDataErField) {
            return <div data-er-field={titleDataErField}>{view}</div>;
        }

        return view;
    };

    const renderDescription = () => {
        const view = editing && editDescription !== undefined ? editDescription : description;
        if (view === null || view === undefined || view === '') return null;

        if (typeof view === 'string' || typeof view === 'number') {
            return (
                <Text size="sm" c="dimmed" data-er-field={descriptionDataErField}>
                    {view}
                </Text>
            );
        }

        if (descriptionDataErField) {
            return <div data-er-field={descriptionDataErField}>{view}</div>;
        }

        return view;
    };

    const renderMeta = editing && editMeta !== undefined ? editMeta : meta;

    return (
        <Card padding="md" mb={mb} withBorder className={className} data-er-field={cardDataErField}>
            <Stack gap="xs">
                <Group justify="space-between">
                    {renderTitle()}
                    {!isEditing && badge}
                </Group>

                {renderDescription()}
                {renderMeta}

                <div
                    style={{
                        minHeight: 28,
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 6,
                    }}
                >
                    {isEditing && !editing && canEdit && (
                        <ActionIcon
                            size={28}
                            variant="subtle"
                            onClick={handleStartEdit}
                            aria-label="Edit"
                        >
                            <IconPencil size={16} />
                        </ActionIcon>
                    )}

                    {isEditing && editing && canEdit && (
                        <>
                            <ActionIcon
                                size={28}
                                variant="subtle"
                                color="green"
                                onClick={(event) => {
                                    void handleSubmitEdit(event);
                                }}
                                disabled={disableSubmitEdit}
                                aria-label="Submit edit"
                            >
                                <IconCheck size={16} />
                            </ActionIcon>
                            <ActionIcon
                                size={28}
                                variant="subtle"
                                color="red"
                                onClick={handleCancelEdit}
                                aria-label="Cancel edit"
                            >
                                <IconX size={16} />
                            </ActionIcon>
                        </>
                    )}

                    {isEditing && onRemove && (
                        <ActionIcon
                            size={28}
                            color="red"
                            variant="light"
                            onClick={handleRemove}
                            aria-label="Remove"
                        >
                            <IconMinus size={16} />
                        </ActionIcon>
                    )}
                </div>
            </Stack>
        </Card>
    );
}
