import type { ReactNode } from 'react';
import './SidesheetSection.css';

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
    const classes = ['sidesheet-section', className].filter(Boolean).join(' ');

    return (
        <section className={classes}>
            <header className="sidesheet-section__header">
                <h3
                    className="sidesheet-section__title"
                    {...(titleDataAttribute ? { 'data-er-field': titleDataAttribute } : {})}
                >
                    {title}
                </h3>
                {actions ? <div className="sidesheet-section__actions">{actions}</div> : null}
            </header>
            <div className="sidesheet-section__body">{children}</div>
        </section>
    );
}

