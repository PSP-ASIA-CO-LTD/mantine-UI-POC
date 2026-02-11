import { Group, Button } from '@mantine/core';
import './AppSidesheetFooter.css';

interface AppSidesheetFooterProps {
    onCancel?: () => void;
    onSave?: () => void;
    saveLabel?: string;
    cancelLabel?: string;
    isLoading?: boolean;
    extraActions?: React.ReactNode;
    showSave?: boolean;
    children?: React.ReactNode;
}

export function AppSidesheetFooter({
    onCancel,
    onSave,
    saveLabel = 'Save Changes',
    cancelLabel = 'Cancel',
    isLoading = false,
    extraActions,
    showSave,
    children
}: AppSidesheetFooterProps) {
    const shouldShowSave = children ? false : (showSave ?? Boolean(onSave));
    const hasRightContent = Boolean(extraActions) || Boolean(children) || shouldShowSave;

    return (
        <div className="sidesheet-footer-container">
            <Button
                variant="subtle"
                color="gray"
                onClick={onCancel}
                className="sidesheet-footer-cancel"
            >
                {cancelLabel}
            </Button>
            {hasRightContent && (
                <Group gap="sm" className="sidesheet-footer-group">
                    {extraActions}
                    {children || (shouldShowSave && (
                        <Button
                            onClick={onSave}
                            loading={isLoading}
                            className="sidesheet-footer-save"
                        >
                            {isLoading ? 'Processing...' : saveLabel}
                        </Button>
                    ))}
                </Group>
            )}
        </div>
    );
}
