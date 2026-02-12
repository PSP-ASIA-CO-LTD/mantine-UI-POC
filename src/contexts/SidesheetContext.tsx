import { createContext, useContext, useState, type ReactNode } from 'react';
import { AppSidesheet } from '../components/AppSidesheet';
import { AppSidesheetFooter } from '../components/AppSidesheetFooter';

interface SidesheetState {
    opened: boolean;
    title: string;
    titleNode?: ReactNode;
    titleDataAttribute?: string;
    subtitle?: string;
    leftPane: ReactNode | null;
    rightPane: ReactNode | null;
    footer: ReactNode | null;
}

interface SidesheetContextType {
    open: (config: {
        title?: string;
        titleNode?: ReactNode;
        titleDataAttribute?: string;
        subtitle?: string;
        leftPane?: ReactNode;
        rightPane?: ReactNode;
        footer?: ReactNode;
    }) => void;
    close: () => void;
    updateContent: (config: {
        title?: string;
        titleNode?: ReactNode;
        titleDataAttribute?: string;
        subtitle?: string;
        leftPane?: ReactNode;
        rightPane?: ReactNode;
        footer?: ReactNode;
    }) => void;
}

const SidesheetContext = createContext<SidesheetContextType | undefined>(undefined);

export function SidesheetProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<SidesheetState>({
        opened: false,
        title: '',
        titleNode: undefined,
        titleDataAttribute: undefined,
        subtitle: undefined,
        leftPane: null,
        rightPane: null,
        footer: null,
    });

    const open = (config: {
        title?: string;
        titleNode?: ReactNode;
        titleDataAttribute?: string;
        subtitle?: string;
        leftPane?: ReactNode;
        rightPane?: ReactNode;
        footer?: ReactNode;
    }) => {
        const defaultFooter = (
            <AppSidesheetFooter
                onCancel={close}
                cancelLabel="Close"
                showSave={false}
            />
        );

        setState({
            opened: true,
            title: config.title || '',
            titleNode: config.titleNode,
            titleDataAttribute: config.titleDataAttribute,
            subtitle: config.subtitle,
            leftPane: config.leftPane || null,
            rightPane: config.rightPane || null,
            footer: config.footer === undefined ? defaultFooter : config.footer,
        });
    };

    const close = () => {
        setState({
            opened: false,
            title: '',
            titleNode: undefined,
            titleDataAttribute: undefined,
            subtitle: undefined,
            leftPane: null,
            rightPane: null,
            footer: null,
        });
    };

    const updateContent = (config: {
        title?: string;
        titleNode?: ReactNode;
        titleDataAttribute?: string;
        subtitle?: string;
        leftPane?: ReactNode;
        rightPane?: ReactNode;
        footer?: ReactNode;
    }) => {
        setState(prev => ({
            ...prev,
            ...(config.title !== undefined && { title: config.title }),
            ...(config.titleNode !== undefined && { titleNode: config.titleNode }),
            ...(config.titleDataAttribute !== undefined && { titleDataAttribute: config.titleDataAttribute }),
            ...(config.subtitle !== undefined && { subtitle: config.subtitle }),
            ...(config.leftPane !== undefined && { leftPane: config.leftPane }),
            ...(config.rightPane !== undefined && { rightPane: config.rightPane }),
            ...(config.footer !== undefined && { footer: config.footer }),
        }));
    };

    return (
        <SidesheetContext.Provider value={{ open, close, updateContent }}>
            {children}
            <AppSidesheet
                opened={state.opened}
                onClose={close}
                title={state.title}
                titleNode={state.titleNode}
                titleDataAttribute={state.titleDataAttribute}
                subtitle={state.subtitle}
                leftPane={state.leftPane}
                rightPane={state.rightPane}
                footer={state.footer}
            />
        </SidesheetContext.Provider>
    );
}

export function useSidesheet() {
    const context = useContext(SidesheetContext);
    if (context === undefined) {
        throw new Error('useSidesheet must be used within a SidesheetProvider');
    }
    return context;
}
