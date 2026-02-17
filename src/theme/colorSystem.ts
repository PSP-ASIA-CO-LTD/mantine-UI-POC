export type SemanticColorRole = {
    name: string;
    token: string;
    purpose: string;
    usedIn: string[];
};

export type SurfaceColorToken = {
    name: string;
    token: string;
    purpose: string;
};

export const COLOR_STORAGE_FILES = [
    {
        label: 'Semantic role map (manage here)',
        path: '/src/theme/colorSystem.ts',
    },
    {
        label: 'Field styles usage',
        path: '/src/components/InlineEditableField.css',
    },
    {
        label: 'App shell/base usage',
        path: '/src/App.css',
    },
    {
        label: 'Sales order usage',
        path: '/src/pages/SalesOrder.css',
    },
    {
        label: 'Invoice usage',
        path: '/src/pages/SalesOrderInvoice.css',
    },
    {
        label: 'Staff task usage',
        path: '/src/pages/StaffTasks.css',
    },
];

export const RECENT_SEMANTIC_COLOR_ROLES: SemanticColorRole[] = [
    {
        name: 'surface.app',
        token: '--mantine-color-body',
        purpose: 'Main app/body panel surfaces',
        usedIn: ['/src/components/AppSidesheet.css', '/src/components/InlineEditableField.css'],
    },
    {
        name: 'surface.subtle',
        token: '--mantine-color-gray-0',
        purpose: 'Low-emphasis cards and section backgrounds',
        usedIn: ['/src/App.css', '/src/pages/Patient.css', '/src/pages/SalesOrderInvoice.css'],
    },
    {
        name: 'surface.hover',
        token: '--mantine-color-gray-1',
        purpose: 'Hover/active subtle field backgrounds',
        usedIn: ['/src/components/InlineEditableField.css', '/src/pages/SalesOrder.css'],
    },
    {
        name: 'border.default',
        token: '--mantine-color-gray-3',
        purpose: 'Default borders and dividers',
        usedIn: ['/src/components/PageActionBar.css', '/src/pages/PublicContractView.css'],
    },
    {
        name: 'text.default',
        token: '--mantine-color-dark-7',
        purpose: 'Primary readable text on light surfaces',
        usedIn: ['/src/components/InlineEditableField.css'],
    },
    {
        name: 'text.muted',
        token: '--mantine-color-gray-6',
        purpose: 'Muted helper text and icons',
        usedIn: ['/src/components/InlineEditableField.css'],
    },
    {
        name: 'accent.primary',
        token: '--mantine-primary-color-filled',
        purpose: 'Primary accent label color',
        usedIn: ['/src/components/InlineEditableField.css'],
    },
    {
        name: 'accent.primarySoft',
        token: '--mantine-primary-color-light',
        purpose: 'Primary focus/edit background',
        usedIn: ['/src/components/InlineEditableField.css'],
    },
    {
        name: 'status.info',
        token: '--mantine-color-blue-5',
        purpose: 'Info state borders/indicators',
        usedIn: ['/src/pages/StaffTasks.css', '/src/pages/SalesOrderInvoice.css'],
    },
    {
        name: 'status.success',
        token: '--mantine-color-green-5',
        purpose: 'Success state highlights',
        usedIn: ['/src/pages/StaffTasks.css', '/src/pages/SalesOrder.css'],
    },
    {
        name: 'status.warning',
        token: '--mantine-color-yellow-5',
        purpose: 'Warning state highlights',
        usedIn: ['/src/pages/StaffTasks.css'],
    },
    {
        name: 'status.danger',
        token: '--mantine-color-red-5',
        purpose: 'Danger/error highlights',
        usedIn: ['/src/pages/StaffTasks.css'],
    },
    {
        name: 'status.dangerSoft',
        token: '--mantine-color-red-light',
        purpose: 'Soft error backgrounds',
        usedIn: ['/src/components/InlineEditableField.css'],
    },
];

export const SURFACE_COLOR_TOKENS: SurfaceColorToken[] = [
    { name: 'App Body', token: '--mantine-color-body', purpose: 'Main app background surface' },
    { name: 'White', token: '--mantine-color-white', purpose: 'Card/input neutral surface' },
    { name: 'Black', token: '--mantine-color-black', purpose: 'High contrast baseline' },
    { name: 'Dimmed Text', token: '--mantine-color-dimmed', purpose: 'Muted typography token' },
    { name: 'Primary Filled', token: '--mantine-primary-color-filled', purpose: 'Primary accent surface/text' },
    { name: 'Primary Light', token: '--mantine-primary-color-light', purpose: 'Primary subtle background' },
    { name: 'Error Light', token: '--mantine-color-red-light', purpose: 'Soft error background' },
];
