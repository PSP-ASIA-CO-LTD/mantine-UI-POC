import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Title, Button, Text } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import './AppSidesheet.css';

interface AppSidesheetProps {
    opened: boolean;
    onClose: () => void;
    title?: string;
    titleNode?: ReactNode;
    titleDataAttribute?: string;
    subtitle?: string;
    leftPane?: ReactNode;
    rightPane?: ReactNode;
    footer?: ReactNode;
    children?: ReactNode;
}

export function AppSidesheet({
    opened,
    onClose,
    title = '',
    titleNode,
    titleDataAttribute,
    subtitle,
    leftPane,
    rightPane,
    footer,
    children
}: AppSidesheetProps) {
    const titleId = useId();
    const closeButtonRef = useRef<HTMLButtonElement | null>(null);
    const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (!opened) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [opened]);

    useEffect(() => {
        if (!opened) return;

        previouslyFocusedElementRef.current = document.activeElement as HTMLElement | null;
        const frame = requestAnimationFrame(() => {
            closeButtonRef.current?.focus();
        });

        return () => {
            cancelAnimationFrame(frame);
            previouslyFocusedElementRef.current?.focus?.();
            previouslyFocusedElementRef.current = null;
        };
    }, [opened]);

    useEffect(() => {
        if (!opened) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Escape') return;
            event.preventDefault();
            onClose();
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [opened, onClose]);

    const hasLeftPane = Boolean(leftPane);

    return (
        <>
            {/* Overlay */}
            <div
                className={`sidesheet-overlay ${opened ? 'active' : ''}`}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Sidesheet */}
            <aside
                className={`sidesheet ${opened ? 'sidesheet-open' : ''}`}
                role="dialog"
                aria-modal="true"
                aria-hidden={!opened}
                aria-labelledby={titleId}
            >
                {/* Header */}
                <header className="sidesheet-header">
                    <div className="sidesheet-header-content d-flex flex-column gap-1">
                        {subtitle && (
                            <Text size="sm" c="dimmed" className="sidesheet-subtitle text-body-secondary mb-0 small">
                                {subtitle}
                            </Text>
                        )}
                        {titleNode ? (
                            <div
                                id={titleId}
                                className="sidesheet-title-node h4 mb-0"
                                {...(titleDataAttribute ? { 'data-er-field': titleDataAttribute } : {})}
                            >
                                {titleNode}
                            </div>
                        ) : (
                            <Title
                                id={titleId}
                                order={2}
                                className="sidesheet-title h4 mb-0"
                                {...(titleDataAttribute ? { 'data-er-field': titleDataAttribute } : {})}
                            >
                                {title}
                            </Title>
                        )}
                    </div>
                    <Button
                        ref={closeButtonRef}
                        variant="subtle"
                        color="gray"
                        onClick={onClose}
                        className="sidesheet-close-btn btn btn-link text-body p-0"
                    >
                        <IconX size={24} />
                    </Button>
                </header>

                {/* Main Content - Two Pane Layout */}
                <div className={`sidesheet-main ${hasLeftPane ? 'sidesheet-main--two' : ''}`}>
                    {leftPane && (
                        <div className="sidesheet-left-pane bg-body">
                            {leftPane}
                        </div>
                    )}
                    {(rightPane || children) && (
                        <div className="sidesheet-right-pane bg-body-tertiary">
                            {rightPane || children}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {footer && (
                    <footer className="sidesheet-footer">
                        {footer}
                    </footer>
                )}
            </aside>
        </>
    );
}
