import type { ReactNode } from 'react';
import { AlternateButton } from '../../components/AlternateButton';
import { PrimaryButton } from '../../components/PrimaryButton';

export interface FontStack {
    id: string;
    label: string;
    value: string;
    note: string;
    source: string[];
}

export interface TypographyRowData {
    id: string;
    label: string;
    note: string;
    source: string[];
    sample: ReactNode;
    selector?: string;
    previewClassName?: string;
}

export const FONT_STACKS: FontStack[] = [
    {
        id: 'app',
        label: 'App + Mantine default',
        value: '"Google Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        note: 'Primary stack for body copy, headings, navigation, and most interface text.',
        source: ['src/main.tsx -> APP_FONT_FAMILY', 'src/styles/base.scss -> :root / body'],
    },
    {
        id: 'code',
        label: 'Code / source labels',
        value: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        note: 'Used for DS source labels, code blocks, and technical references.',
        source: ['src/styles/ds/showcase.scss -> .ds-showcase-source'],
    },
    {
        id: 'document-code',
        label: 'Document number monospace',
        value: 'monospace',
        note: 'Applied to invoice numbers and compact document identifiers.',
        source: ['src/pages/SalesOrderInvoice.scss -> .invoice-number'],
    },
];

export const FOUNDATION_ROWS: TypographyRowData[] = [
    {
        id: 'body',
        label: 'Body copy',
        note: 'Default application reading style.',
        source: ['src/styles/base.scss -> body'],
        sample: <p className="mb-0" data-typography-target>Resident occupancy is stable across all care departments this week.</p>,
    },
    {
        id: 'secondary',
        label: 'Secondary copy',
        note: 'Muted copy for subtitles, helper text, and metadata.',
        source: ['Bootstrap Quartz -> .text-body-secondary'],
        sample: <p className="text-body-secondary mb-0" data-typography-target>Secondary and helper text used for explanations and context.</p>,
    },
    {
        id: 'lead',
        label: 'Lead paragraph',
        note: 'Large intro copy available from Bootstrap typography utilities.',
        source: ['Bootstrap Quartz -> .lead'],
        sample: <p className="lead mb-0" data-typography-target>Lead copy for a page intro, summary, or status overview.</p>,
    },
    {
        id: 'small',
        label: 'Small helper',
        note: 'Compact text frequently used in tables and support text.',
        source: ['Bootstrap Quartz -> .small'],
        sample: <p className="small mb-0" data-typography-target>Compact hint copy for dense admin layouts.</p>,
    },
    {
        id: 'code',
        label: 'Inline code',
        note: 'Technical identifiers and short machine-readable values.',
        source: ['Bootstrap Quartz -> code'],
        sample: <code data-typography-target>INV-2026-00042</code>,
    },
    {
        id: 'kicker',
        label: 'Showcase kicker',
        note: 'Uppercase DS eyebrow used in the review routes.',
        source: ['src/styles/ds/showcase.scss -> .ds-showcase-kicker'],
        sample: <span className="ds-showcase-kicker small text-body-secondary" data-typography-target>Design System</span>,
    },
    {
        id: 'source',
        label: 'Showcase source label',
        note: 'Monospace source reference already used across DS pages.',
        source: ['src/styles/ds/showcase.scss -> .ds-showcase-source'],
        sample: <code className="ds-showcase-source" data-typography-target>src/pages/UiTypography.tsx</code>,
    },
    {
        id: 'form-label',
        label: 'Form label',
        note: 'Shared label treatment for DS-controlled forms.',
        source: ['src/styles/ds/showcase.scss -> .ds-form-label'],
        sample: <label className="ds-form-label mb-0" data-typography-target>Facility Name</label>,
    },
];

export const DISPLAY_ROWS: TypographyRowData[] = [1, 2, 3, 4, 5, 6].map((level) => ({
    id: `display-${level}`,
    label: `Display ${level}`,
    note: 'Bootstrap display utility available globally through Quartz.',
    source: [`Bootstrap Quartz -> .display-${level}`],
    sample: <div className={`display-${level} mb-0`} data-typography-target>{`Display ${level}`}</div>,
}));

export const HEADING_ROWS: TypographyRowData[] = [1, 2, 3, 4, 5, 6].map((level) => ({
    id: `heading-${level}`,
    label: `Heading ${level}`,
    note: 'Bootstrap heading utility used by Mantine Title wrappers in several screens.',
    source: [`Bootstrap Quartz -> .h${level}`],
    sample: <div className={`h${level} mb-0`} data-typography-target>{`Heading ${level}`}</div>,
}));

export const APP_ROWS: TypographyRowData[] = [
    {
        id: 'nav-brand',
        label: 'Navigation brand',
        note: 'Left-rail product mark in the app shell.',
        source: ['src/components/AppNav.scss -> .brand', 'src/components/AppNav.tsx -> app nav header'],
        previewClassName: 'ui-typography-context--nav',
        sample: <a className="brand" data-typography-target>Bourbon <span>HQ</span></a>,
    },
    {
        id: 'nav-subtitle',
        label: 'Navigation subtitle',
        note: 'Product descriptor beneath the app brand.',
        source: ['src/components/AppNav.scss -> .subtitle'],
        previewClassName: 'ui-typography-context--nav',
        sample: <div className="subtitle" data-typography-target>Operation Manager</div>,
    },
    {
        id: 'nav-group-label',
        label: 'Navigation group label',
        note: 'Uppercase rail grouping used for app navigation sections.',
        source: ['src/components/AppNav.scss -> .nav-group-label'],
        previewClassName: 'ui-typography-context--nav',
        sample: <div className="nav-group-label" data-typography-target>Backoffice</div>,
    },
    {
        id: 'page-header-title',
        label: 'Page header title',
        note: 'Primary page heading shown in the action bar.',
        source: ['src/components/PageHeader.tsx -> Title order={2} className="h3"', 'src/components/PageActionBar.scss -> heading reset'],
        previewClassName: 'ui-typography-context--page-header',
        sample: (
            <div className="page-actionbar page-actionbar--transparent">
                <div>
                    <h2 className="h3 mb-0" data-typography-target>Sales Dashboard</h2>
                </div>
            </div>
        ),
    },
    {
        id: 'page-header-subtitle',
        label: 'Page header subtitle',
        note: 'Dimmed supporting text below the page title.',
        source: ['src/components/PageHeader.tsx -> Text size="sm" c="dimmed"'],
        previewClassName: 'ui-typography-context--page-header',
        sample: (
            <div className="page-actionbar page-actionbar--transparent">
                <div>
                    <h2 className="h3 mb-1">Patient</h2>
                    <p className="text-body-secondary mb-0" data-typography-target>Residents management</p>
                </div>
            </div>
        ),
    },
    {
        id: 'sidesheet-subtitle',
        label: 'Sidesheet subtitle',
        note: 'Small contextual label above a sidesheet title.',
        source: ['src/components/AppSidesheet.tsx -> .sidesheet-subtitle', 'src/components/AppSidesheet.scss -> sidesheet header'],
        previewClassName: 'ui-typography-context--sidesheet',
        sample: (
            <header className="sidesheet-header">
                <div className="sidesheet-header-content">
                    <p className="sidesheet-subtitle text-body-secondary mb-0 small" data-typography-target>Department settings</p>
                    <h2 className="sidesheet-title h4 mb-0">Company Settings</h2>
                </div>
            </header>
        ),
    },
    {
        id: 'sidesheet-title',
        label: 'Sidesheet title',
        note: 'Main title styling inside the split-pane editor shell.',
        source: ['src/components/AppSidesheet.scss -> .sidesheet-title'],
        previewClassName: 'ui-typography-context--sidesheet',
        sample: (
            <header className="sidesheet-header">
                <div className="sidesheet-header-content">
                    <p className="sidesheet-subtitle text-body-secondary mb-0 small">Department settings</p>
                    <h2 className="sidesheet-title h4 mb-0" data-typography-target>Company Settings</h2>
                </div>
            </header>
        ),
    },
    {
        id: 'sidesheet-section',
        label: 'Sidesheet section title',
        note: 'Section-level heading within the editor panes.',
        source: ['src/components/SidesheetSection.scss -> .sidesheet-section__title'],
        previewClassName: 'ui-typography-context--sidesheet-section',
        sample: (
            <header className="sidesheet-section__header">
                <h3 className="sidesheet-section__title h6 mb-0" data-typography-target>Billing Rules</h3>
            </header>
        ),
    },
    {
        id: 'editable-label',
        label: 'Editable field label',
        note: 'Uppercase micro-label used above inline editable fields.',
        source: ['src/components/InlineEditableField.scss -> .editable-field__label'],
        previewClassName: 'ui-typography-context--field',
        sample: (
            <div className="editable-field">
                <label className="editable-field__label" data-typography-target>Resident Name</label>
            </div>
        ),
    },
    {
        id: 'editable-description',
        label: 'Editable field description',
        note: 'Short helper copy beneath editable field labels.',
        source: ['src/components/InlineEditableField.scss -> .editable-field__description'],
        previewClassName: 'ui-typography-context--field',
        sample: (
            <div className="editable-field">
                <div className="editable-field__description" data-typography-target>Visible on invoice and contract.</div>
            </div>
        ),
    },
    {
        id: 'primary-button',
        label: 'Primary button label',
        note: 'Gradient motion button text used for strong CTAs.',
        source: ['src/components/Button.scss -> .button__content', 'src/components/PrimaryButton.tsx'],
        selector: '.button__content',
        previewClassName: 'ui-typography-context--button',
        sample: <PrimaryButton animate={false}>Continue</PrimaryButton>,
    },
    {
        id: 'alternate-button',
        label: 'Alternate button label',
        note: 'Dense bold label used for alternate actions.',
        source: ['src/components/Button.scss -> .button.alternate .button__content', 'src/components/AlternateButton.tsx'],
        selector: '.button__content',
        previewClassName: 'ui-typography-context--button',
        sample: <AlternateButton animate={false}>Save Draft</AlternateButton>,
    },
];

export const DOCUMENT_ROWS: TypographyRowData[] = [
    {
        id: 'department-expanded',
        label: 'Department title - expanded',
        note: 'Largest editor title size for shorter department names.',
        source: ['src/pages/Departments.scss -> .department-title-input--expanded'],
        previewClassName: 'ui-typography-context--department',
        sample: <div className="department-title-input department-title-input--expanded" data-typography-target>Nursing</div>,
    },
    {
        id: 'department-balanced',
        label: 'Department title - balanced',
        note: 'Mid-size title treatment for moderate-length department names.',
        source: ['src/pages/Departments.scss -> .department-title-input--balanced'],
        previewClassName: 'ui-typography-context--department',
        sample: <div className="department-title-input department-title-input--balanced" data-typography-target>Resident Care</div>,
    },
    {
        id: 'department-compact',
        label: 'Department title - compact',
        note: 'Tightened fallback for longer editable department titles.',
        source: ['src/pages/Departments.scss -> .department-title-input--compact'],
        previewClassName: 'ui-typography-context--department',
        sample: <div className="department-title-input department-title-input--compact" data-typography-target>Rehabilitation Services</div>,
    },
    {
        id: 'stepper-description',
        label: 'Workflow step description',
        note: 'Compact, centered helper copy beneath sales-order step labels.',
        source: ['src/pages/SalesOrder.scss -> .mantine-Stepper-stepDescription'],
        previewClassName: 'ui-typography-context--stepper sales-order-page',
        sample: (
            <div className="mantine-Stepper-stepBody">
                <div className="mantine-Stepper-stepLabel">Contract</div>
                <div className="mantine-Stepper-stepDescription" data-typography-target>Review contract and confirm deposit terms.</div>
            </div>
        ),
    },
    {
        id: 'invoice-company',
        label: 'Invoice company name',
        note: 'Document letterhead name with tighter tracking and brand color.',
        source: ['src/pages/SalesOrderInvoice.scss -> .company-name'],
        previewClassName: 'ui-typography-context--invoice',
        sample: <div className="company-name" data-typography-target>PSP Asia Co., Ltd.</div>,
    },
    {
        id: 'invoice-title',
        label: 'Invoice title',
        note: 'Large document title with wide tracking.',
        source: ['src/pages/SalesOrderInvoice.scss -> .invoice-title'],
        previewClassName: 'ui-typography-context--invoice',
        sample: <div className="invoice-title" data-typography-target>INVOICE</div>,
    },
    {
        id: 'invoice-number',
        label: 'Invoice number',
        note: 'Monospace identifier beneath the document title.',
        source: ['src/pages/SalesOrderInvoice.scss -> .invoice-number'],
        previewClassName: 'ui-typography-context--invoice',
        sample: <div className="invoice-number" data-typography-target># INV-2026-00042</div>,
    },
    {
        id: 'invoice-label',
        label: 'Invoice section label',
        note: 'Uppercase micro-heading for billing blocks and metadata groups.',
        source: ['src/pages/SalesOrderInvoice.scss -> .section-label'],
        previewClassName: 'ui-typography-context--invoice',
        sample: <div className="section-label" data-typography-target>Bill To</div>,
    },
    {
        id: 'invoice-table-head',
        label: 'Invoice table heading',
        note: 'Uppercase column heading inside the invoice table.',
        source: ['src/pages/SalesOrderInvoice.scss -> .invoice-table th'],
        previewClassName: 'ui-typography-context--invoice-table',
        sample: (
            <table className="table invoice-table mb-0">
                <thead>
                    <tr>
                        <th data-typography-target>Unit Price</th>
                    </tr>
                </thead>
            </table>
        ),
    },
];
