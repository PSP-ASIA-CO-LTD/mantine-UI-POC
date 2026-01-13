import { useEffect, ReactNode } from 'react';
import { Title, Button, Text } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import './AppSidesheet.css';

interface AppSidesheetProps {
    opened: boolean;
    onClose: () => void;
    title?: string;
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
    subtitle,
    leftPane,
    rightPane,
    footer,
    children
}: AppSidesheetProps) {
    useEffect(() => {
        if (opened) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [opened]);

    return (
        <>
            {/* Overlay */}
            {opened && (
                <div 
                    className="sidesheet-overlay" 
                    onClick={onClose}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        background: 'hsla(0, 0%, 0%, 0.3)',
                        backdropFilter: 'blur(8px)',
                        zIndex: 1040,
                        opacity: opened ? 1 : 0,
                        visibility: opened ? 'visible' : 'hidden',
                        transition: 'opacity 0.4s ease, backdrop-filter 0.4s ease, visibility 0.4s',
                    }}
                />
            )}

            {/* Sidesheet */}
            <div 
                className={`sidesheet ${opened ? 'sidesheet-open' : ''}`}
                style={{
                    position: 'fixed',
                    right: 0,
                    top: 0,
                    width: '80%',
                    maxWidth: '1200px',
                    height: '100vh',
                    background: 'var(--mantine-color-body)',
                    boxShadow: '-10px 0 30px hsla(0, 0%, 0%, 0.1)',
                    zIndex: 1050,
                    transform: opened ? 'translateX(0)' : 'translateX(100%)',
                    transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {/* Header */}
                <div className="sidesheet-header">
                    <div className="sidesheet-header-content">
                        {subtitle && (
                            <Text size="sm" c="dimmed" className="sidesheet-subtitle">
                                {subtitle}
                            </Text>
                        )}
                        <Title order={2} className="sidesheet-title">{title}</Title>
                    </div>
                    <Button
                        variant="subtle"
                        color="gray"
                        onClick={onClose}
                        className="sidesheet-close-btn"
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'hsl(0, 0%, 40%)',
                            fontSize: '2.5em',
                            lineHeight: 1,
                            padding: 0,
                            minWidth: 'auto',
                            height: 'auto',
                        }}
                    >
                        <IconX size={24} />
                    </Button>
                </div>

                {/* Main Content - Two Pane Layout */}
                <div className="sidesheet-main">
                    {leftPane && (
                        <div className="sidesheet-left-pane">
                            {leftPane}
                        </div>
                    )}
                    {(rightPane || children) && (
                        <div className="sidesheet-right-pane">
                            {rightPane || children}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="sidesheet-footer">
                        {footer}
                    </div>
                )}
            </div>
        </>
    );
}
