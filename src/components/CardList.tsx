import { ActionIcon, Card, Group, Stack, Text } from '@mantine/core';
import { IconMinus } from '@tabler/icons-react';
import type { MouseEvent, ReactNode } from 'react';

interface CardListProps {
    title: ReactNode;
    badge?: ReactNode;
    isEditing?: boolean;
    onRemove?: () => void;
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
    onRemove,
    description,
    meta,
    cardDataErField,
    titleDataErField,
    descriptionDataErField,
    className,
    mb,
}: CardListProps) {
    const handleRemove = (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        onRemove?.();
    };

    const renderTitle = () => {
        if (typeof title === 'string' || typeof title === 'number') {
            return (
                <Text fw={500} data-er-field={titleDataErField}>
                    {title}
                </Text>
            );
        }

        if (titleDataErField) {
            return <div data-er-field={titleDataErField}>{title}</div>;
        }

        return title;
    };

    const renderDescription = () => {
        if (description === null || description === undefined || description === '') return null;

        if (typeof description === 'string' || typeof description === 'number') {
            return (
                <Text size="sm" c="dimmed" data-er-field={descriptionDataErField}>
                    {description}
                </Text>
            );
        }

        if (descriptionDataErField) {
            return <div data-er-field={descriptionDataErField}>{description}</div>;
        }

        return description;
    };

    return (
        <Card padding="md" mb={mb} withBorder className={className} data-er-field={cardDataErField}>
            <Stack gap="xs">
                <Group justify="space-between">
                    {renderTitle()}
                    {!isEditing && badge}
                </Group>

                {renderDescription()}
                {meta}

                <div
                    style={{
                        minHeight: 28,
                        display: 'flex',
                        justifyContent: 'flex-end',
                    }}
                >
                    {isEditing && (
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
