import type { ReactNode } from 'react';

interface SidesheetSectionProps {
    title: ReactNode;
    actions?: ReactNode;
    children: ReactNode;
    className?: string;
    titleDataAttribute?: string;
}

export function SidesheetSection({
    title,
    actions,
    children,
    className,
    titleDataAttribute,
}: SidesheetSectionProps) {
    const classes = ['sidesheet-section', 'mb-4', className].filter(Boolean).join(' ');

    return (
        <section className={classes}>
            <header className="sidesheet-section__header d-flex justify-content-between align-items-baseline mb-2">
                <h3
                    className="sidesheet-section__title h6 mb-0"
                    {...(titleDataAttribute ? { 'data-er-field': titleDataAttribute } : {})}
                >
                    {title}
                </h3>
                {actions ? <div className="sidesheet-section__actions d-flex align-items-center gap-2">{actions}</div> : null}
            </header>
            <div className="sidesheet-section__body card border-0 bg-transparent p-0">{children}</div>
        </section>
    );
}
