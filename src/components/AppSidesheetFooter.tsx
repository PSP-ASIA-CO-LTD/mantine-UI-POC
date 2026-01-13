import { Group, Button } from '@mantine/core';
import './AppSidesheetFooter.css';

interface AppSidesheetFooterProps {
    onCancel?: () => void;
    onSave?: () => void;
    saveLabel?: string;
    cancelLabel?: string;
    isLoading?: boolean;
    extraActions?: React.ReactNode;
    children?: React.ReactNode;
}

export function AppSidesheetFooter({
    onCancel,
    onSave,
    saveLabel = 'Save Changes',
    cancelLabel = 'Cancel',
    isLoading = false,
    extraActions,
    children
}: AppSidesheetFooterProps) {
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
            <Group gap="sm" className="sidesheet-footer-group">
                {extraActions}
                {children || (
                    <Button
                        onClick={onSave}
                        loading={isLoading}
                        className="sidesheet-footer-save"
                    >
                        {isLoading ? 'Processing...' : saveLabel}
                    </Button>
                )}
            </Group>
        </div>
    );
}
