import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
    APP_ROWS,
    DISPLAY_ROWS,
    DOCUMENT_ROWS,
    FONT_STACKS,
    FOUNDATION_ROWS,
    HEADING_ROWS,
    type TypographyRowData,
} from '../design-system/catalog/typography';

function TypographySection({
    title,
    description,
    badge,
    children,
}: {
    title: string;
    description: string;
    badge?: number;
    children: ReactNode;
}) {
    return (
        <section className="card shadow-sm">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                    <div>
                        <h2 className="h5 mb-1">{title}</h2>
                        <p className="text-body-secondary small mb-0">{description}</p>
                    </div>
                    {badge !== undefined ? <span className="badge text-bg-secondary">{badge}</span> : null}
                </div>
                {children}
            </div>
        </section>
    );
}

function TypographyRow({
    label,
    note,
    source,
    sample,
    selector = '[data-typography-target]',
    previewClassName,
}: TypographyRowData) {
    const previewRef = useRef<HTMLDivElement | null>(null);
    const [metrics, setMetrics] = useState('');

    useEffect(() => {
        const measure = () => {
            const target = previewRef.current?.querySelector<HTMLElement>(selector);
            if (!target) return;

            const styles = window.getComputedStyle(target);
            const nextMetrics = [
                `size ${styles.fontSize}`,
                `line ${styles.lineHeight}`,
                `weight ${styles.fontWeight}`,
                `spacing ${styles.letterSpacing}`,
                `case ${styles.textTransform === 'none' ? 'none' : styles.textTransform}`,
            ].join(', ');

            setMetrics(nextMetrics);
        };

        const frameId = window.requestAnimationFrame(measure);
        window.addEventListener('resize', measure);
        return () => {
            window.cancelAnimationFrame(frameId);
            window.removeEventListener('resize', measure);
        };
    }, [selector]);

    const previewClasses = ['ui-typography-row__preview', previewClassName].filter(Boolean).join(' ');

    return (
        <div className="ui-typography-row">
            <div className="ui-typography-row__meta">
                <div className="ui-typography-row__label">{label}</div>
                <p className="ui-typography-row__note mb-0">{note}</p>
                <div className="ui-typography-row__source ds-showcase-source">
                    {source.map((item) => (
                        <code key={item}>{item}</code>
                    ))}
                </div>
                {metrics ? (
                    <div className="ui-typography-row__metrics ds-showcase-source">
                        <code>{metrics}</code>
                    </div>
                ) : null}
            </div>
            <div ref={previewRef} className={previewClasses}>
                {sample}
            </div>
        </div>
    );
}

export function UiTypography() {
    return (
        <div className="ui-typography container-fluid px-0">
            <div className="d-flex flex-column gap-4">
                <section className="card shadow-sm">
                    <div className="card-body">
                        <h1 className="h4 mb-2">Typography</h1>
                        <p className="text-body-secondary small mb-2">
                            Review route for every typography treatment currently shipping in the app: base Bootstrap scale,
                            Mantine-backed headings, app chrome labels, and document-specific text patterns.
                        </p>
                        <p className="text-body-secondary small mb-0">
                            Every specimen below renders with the actual classes used in the product so the review is based on live styles,
                            not a mock sample.
                        </p>
                    </div>
                </section>

                <TypographySection
                    title="Font Stacks"
                    description="The app currently ships one main UI family and two monospace treatments for technical and document contexts."
                    badge={FONT_STACKS.length}
                >
                    <div className="ui-typography-stack-grid">
                        {FONT_STACKS.map((stack) => (
                            <article key={stack.id} className="ui-typography-stack-card">
                                <div className="ui-typography-stack-card__label">{stack.label}</div>
                                <p className="text-body-secondary small mb-2">{stack.note}</p>
                                <code className="ui-typography-stack-card__value">{stack.value}</code>
                                <div className="ui-typography-row__source ds-showcase-source mt-2">
                                    {stack.source.map((item) => (
                                        <code key={item}>{item}</code>
                                    ))}
                                </div>
                            </article>
                        ))}
                    </div>
                </TypographySection>

                <TypographySection
                    title="Foundations"
                    description="Core paragraph, helper, source-label, and form-label styles reused across the system."
                    badge={FOUNDATION_ROWS.length}
                >
                    <div className="ui-typography-list">
                        {FOUNDATION_ROWS.map((row) => (
                            <TypographyRow key={row.id} {...row} />
                        ))}
                    </div>
                </TypographySection>

                <TypographySection
                    title="Framework Scale"
                    description="Bootstrap Quartz display utilities and heading utilities that remain available throughout the app."
                    badge={DISPLAY_ROWS.length + HEADING_ROWS.length}
                >
                    <div className="ui-typography-split-grid">
                        <div className="ui-typography-subsection">
                            <div className="ui-typography-subsection__title">Display Utilities</div>
                            <div className="ui-typography-list">
                                {DISPLAY_ROWS.map((row) => (
                                    <TypographyRow key={row.id} {...row} />
                                ))}
                            </div>
                        </div>
                        <div className="ui-typography-subsection">
                            <div className="ui-typography-subsection__title">Heading Utilities</div>
                            <div className="ui-typography-list">
                                {HEADING_ROWS.map((row) => (
                                    <TypographyRow key={row.id} {...row} />
                                ))}
                            </div>
                        </div>
                    </div>
                </TypographySection>

                <TypographySection
                    title="App Chrome"
                    description="Typography patterns already used by navigation, headers, field wrappers, and button components."
                    badge={APP_ROWS.length}
                >
                    <div className="ui-typography-list">
                        {APP_ROWS.map((row) => (
                            <TypographyRow key={row.id} {...row} />
                        ))}
                    </div>
                </TypographySection>

                <TypographySection
                    title="Documents + Dense UI"
                    description="High-density document and workflow type treatments that were previously scattered across invoice and editor screens."
                    badge={DOCUMENT_ROWS.length}
                >
                    <div className="ui-typography-list">
                        {DOCUMENT_ROWS.map((row) => (
                            <TypographyRow key={row.id} {...row} />
                        ))}
                    </div>
                </TypographySection>
            </div>
        </div>
    );
}
