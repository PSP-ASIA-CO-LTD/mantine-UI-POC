import { useEffect, useMemo, useState } from 'react';
import { RECENT_SEMANTIC_COLOR_ROLES } from '../theme/colorSystem';
import { TokenPreview } from '../components/TokenPreview';

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

const styles = () => {
    if (typeof window === 'undefined' || !window.document?.documentElement) return null;
    return getComputedStyle(window.document.documentElement);
};

const resolve = (token: string) => styles()?.getPropertyValue(token).trim() ?? '';

// ---------------------------------------------------------------------------
// data
// ---------------------------------------------------------------------------

const BS_BASE_COLORS = ['blue', 'indigo', 'purple', 'pink', 'red', 'orange', 'yellow', 'green', 'teal', 'cyan'];
const BS_GRAY_STEPS = ['100', '200', '300', '400', '500', '600', '700', '800', '900'];
const BS_INTENTS = ['primary', 'secondary', 'success', 'info', 'warning', 'danger', 'light', 'dark'];
const MANTINE_COLORS = ['gray', 'dark', 'red', 'pink', 'grape', 'violet', 'indigo', 'blue', 'cyan', 'teal', 'green', 'lime', 'yellow', 'orange'];
const SCALE_10 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

const DS_FIELD_CHAIN: { ds: string; bs: string; role: string }[] = [
    { ds: '--ds-field-label-color', bs: '--bs-primary-text-emphasis', role: 'Label text color' },
    { ds: '--ds-field-text-color', bs: '--bs-body-color', role: 'Input value text' },
    { ds: '--ds-field-muted-color', bs: '--bs-secondary-color', role: 'Muted / helper text' },
    { ds: '--ds-field-placeholder-color', bs: '--bs-gray-400', role: 'Placeholder text' },
    { ds: '--ds-field-idle-bg', bs: '--bs-tertiary-bg', role: 'Default field background' },
    { ds: '--ds-field-hover-bg', bs: '--bs-secondary-bg', role: 'Hovered field background' },
    { ds: '--ds-field-edit-bg', bs: '--bs-secondary-bg', role: 'Active / editing background' },
    { ds: '--ds-field-error-bg', bs: '--bs-danger-bg-subtle', role: 'Error state background' },
    { ds: '--ds-field-locked-bg', bs: '--bs-body-bg', role: 'Locked field background' },
    { ds: '--ds-field-locked-border', bs: '--bs-border-color', role: 'Locked dashed border' },
    { ds: '--ds-field-actions-bg', bs: '--bs-body-bg', role: 'Action button backdrop' },
];

const BUTTON_ACCENTS = [
    { token: '--button-accent-1', label: 'Cyan' },
    { token: '--button-accent-2', label: 'Lime' },
    { token: '--button-accent-3', label: 'Yellow' },
    { token: '--button-accent-4', label: 'Orange' },
    { token: '--button-accent-5', label: 'Magenta' },
    { token: '--button-accent-6', label: 'Pink' },
];

const PROJECT_VARS: { token: string; alias: string; role: string }[] = [
    { token: '--surface', alias: '--bs-gray-100', role: 'Main app shell background' },
    { token: '--white', alias: '--bs-white', role: 'White override token' },
    { token: '--border', alias: '--bs-border-color', role: 'Default border color' },
];

// ---------------------------------------------------------------------------
// small components
// ---------------------------------------------------------------------------

function Swatch({ token, size = 28 }: { token: string; size?: number }) {
    return <TokenPreview token={token} className={size <= 20 ? 'ds-token-preview--variant' : 'ds-token-preview--table'} title={`${token}: ${resolve(token)}`} />;
}

function GradientScale({ prefix, steps }: { prefix: string; steps: (string | number)[] }) {
    return (
        <div className="ds-showcase-scale">
            {steps.map((s) => {
                const token = `${prefix}${s}`;
                const val = resolve(token);
                return (
                    <div key={token} className="ds-showcase-scale__item">
                        <TokenPreview as="div" token={token} className="ds-showcase-scale__preview" title={`${token}: ${val}`} />
                        <div className="text-body-secondary ds-showcase-scale__label">{s}</div>
                    </div>
                );
            })}
        </div>
    );
}

function Section({ title, badge, children }: { title: string; badge?: string | number; children: React.ReactNode }) {
    return (
        <section className="card shadow-sm">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3 className="h5 mb-0">{title}</h3>
                    {badge !== undefined && <span className="badge text-bg-secondary">{badge}</span>}
                </div>
                {children}
            </div>
        </section>
    );
}

// ---------------------------------------------------------------------------
// main page
// ---------------------------------------------------------------------------

export function UiPalette() {
    const rootStyles = styles();

    // intent data
    const intentRows = useMemo(() =>
        BS_INTENTS.map((name) => ({
            name,
            base: resolve(`--bs-${name}`),
            rgb: resolve(`--bs-${name}-rgb`),
            textEmphasis: resolve(`--bs-${name}-text-emphasis`),
            bgSubtle: resolve(`--bs-${name}-bg-subtle`),
            borderSubtle: resolve(`--bs-${name}-border-subtle`),
        })).filter((r) => r.base),
        [rootStyles]
    );

    // mantine variant names for each color
    const VARIANT_SUFFIXES = [
        { key: 'filled', label: 'Filled' },
        { key: 'filled-hover', label: 'Filled Hover' },
        { key: 'light', label: 'Light' },
        { key: 'light-hover', label: 'Light Hover' },
        { key: 'light-color', label: 'Light Color' },
        { key: 'outline', label: 'Outline' },
        { key: 'outline-hover', label: 'Outline Hover' },
    ];

    // resolve variant values after mount when all CSS is loaded
    const [mantineVariants, setMantineVariants] = useState<Record<string, { token: string; label: string; value: string }[]>>({});
    useEffect(() => {
        const s = styles();
        if (!s) return;
        const out: Record<string, { token: string; label: string; value: string }[]> = {};
        for (const color of MANTINE_COLORS) {
            out[color] = VARIANT_SUFFIXES
                .map(({ key, label }) => {
                    const token = `--mantine-color-${color}-${key}`;
                    const value = s.getPropertyValue(token).trim();
                    return { token, label, value };
                })
                .filter((v) => v.value);
        }
        setMantineVariants(out);
    }, []);

    return (
        <div className="ui-palette-bootstrap container-fluid px-0">
            <div className="d-flex flex-column gap-4">

                {/* Header */}
                <section className="card shadow-sm">
                    <div className="card-body">
                        <h2 className="h4 mb-2">Project Color System</h2>
                        <p className="text-body-secondary small mb-2">
                            Three color layers: <strong>Bootstrap Quartz</strong> (--bs-*) provides the base palette.
                            <strong> Mantine</strong> (--mantine-color-*) provides component-level scales.
                            <strong> DS tokens</strong> (--ds-*) alias --bs-* for semantic field styling.
                        </p>
                        <p className="text-body-secondary small mb-0">
                            All --ds-* tokens resolve to --bs-* values. They are the <em>same color</em>, different names.
                        </p>
                    </div>
                </section>

                {/* ── 1. DS → BS Alias Chain ──────────────────────────────── */}
                <Section title="DS Field Token Chain" badge={DS_FIELD_CHAIN.length}>
                    <p className="text-body-secondary small mb-3">
                        Each <code>--ds-field-*</code> is a direct alias to a <code>--bs-*</code> variable. Same color, semantic name.
                        <br />Source: <code>src/styles/ds/field-tokens.scss</code>
                    </p>
                    <div className="table-responsive">
                        <table className="table table-sm table-hover align-middle mb-0 ds-showcase-table">
                            <thead>
                                <tr className="text-body-secondary">
                                    <th className="ds-showcase-table__swatch-col" />
                                    <th>DS Token</th>
                                    <th>Alias of</th>
                                    <th>Role</th>
                                    <th>Resolved</th>
                                </tr>
                            </thead>
                            <tbody>
                                {DS_FIELD_CHAIN.map((row) => (
                                    <tr key={row.ds}>
                                        <td><Swatch token={row.ds} size={22} /></td>
                                        <td><code>{row.ds}</code></td>
                                        <td><code className="text-body-secondary">{row.bs}</code></td>
                                        <td className="text-body-secondary">{row.role}</td>
                                        <td><code className="text-body-secondary">{resolve(row.ds)}</code></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Section>

                {/* ── 2. Bootstrap Base Colors ────────────────────────────── */}
                <Section title="Bootstrap Quartz — Base Colors" badge={BS_BASE_COLORS.length}>
                    <div className="ui-palette-grid">
                        {BS_BASE_COLORS.map((name) => {
                            const token = `--bs-${name}`;
                            return (
                                <article key={token} className="ui-palette-token-card">
                                    <TokenPreview as="div" token={token} className="ui-palette-swatch" title={`${token}: ${resolve(token)}`} />
                                    <p className="small text-body-secondary mb-1 text-capitalize">{name}</p>
                                    <code className="d-block small">{token}</code>
                                    <code className="d-block small text-body-secondary">{resolve(token)}</code>
                                </article>
                            );
                        })}
                    </div>
                </Section>

                {/* ── 3. Bootstrap Gray Scale ─────────────────────────────── */}
                <Section title="Bootstrap Gray Scale">
                    <GradientScale prefix="--bs-gray-" steps={BS_GRAY_STEPS} />
                    <div className="table-responsive mt-3">
                        <table className="table table-sm table-hover align-middle mb-0 ds-showcase-table">
                            <thead>
                                <tr className="text-body-secondary">
                                    <th className="ds-showcase-table__swatch-col" />
                                    <th>Token</th>
                                    <th>Value</th>
                                    <th>Also known as</th>
                                </tr>
                            </thead>
                            <tbody>
                                {BS_GRAY_STEPS.map((step) => {
                                    const token = `--bs-gray-${step}`;
                                    const aliases: string[] = [];
                                    DS_FIELD_CHAIN.forEach((r) => {
                                        if (r.bs === token) aliases.push(r.ds);
                                    });
                                    if (token === '--bs-gray-100' && resolve('--bs-tertiary-bg') === resolve(token)) aliases.push('--bs-tertiary-bg');
                                    if (token === '--bs-gray-200' && resolve('--bs-secondary-bg') === resolve(token)) aliases.push('--bs-secondary-bg');
                                    return (
                                        <tr key={token}>
                                            <td><Swatch token={token} size={22} /></td>
                                            <td><code>{token}</code></td>
                                            <td><code className="text-body-secondary">{resolve(token)}</code></td>
                                            <td>{aliases.length > 0 ? aliases.map((a) => <code key={a} className="me-2 text-body-secondary">{a}</code>) : <span className="text-body-secondary small">—</span>}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Section>

                {/* ── 4. Bootstrap Intent Matrix ──────────────────────────── */}
                <Section title="Bootstrap Intent Presets" badge={intentRows.length}>
                    <p className="text-body-secondary small mb-3">
                        Each intent ships with preset variants: <strong>base</strong>, <strong>rgb</strong>, <strong>text-emphasis</strong>, <strong>bg-subtle</strong>, <strong>border-subtle</strong>.
                    </p>
                    <div className="table-responsive">
                        <table className="table table-sm align-middle mb-0 ds-showcase-table">
                            <thead>
                                <tr className="text-body-secondary">
                                    <th>Intent</th>
                                    <th>Base</th>
                                    <th>RGB</th>
                                    <th>Text Emphasis</th>
                                    <th>Bg Subtle</th>
                                    <th>Border Subtle</th>
                                </tr>
                            </thead>
                            <tbody>
                                {intentRows.map((row) => (
                                    <tr key={row.name}>
                                        <th className="text-capitalize">{row.name}</th>
                                        <td>
                                            <div className="d-flex align-items-center gap-2">
                                                <Swatch token={`--bs-${row.name}`} size={20} />
                                                <code className="small">{row.base}</code>
                                            </div>
                                        </td>
                                        <td><code className="small text-body-secondary">{row.rgb || '—'}</code></td>
                                        <td>
                                            {row.textEmphasis ? (
                                                <div className="d-flex align-items-center gap-2">
                                                    <Swatch token={`--bs-${row.name}-text-emphasis`} size={20} />
                                                    <code className="small">{row.textEmphasis}</code>
                                                </div>
                                            ) : '—'}
                                        </td>
                                        <td>
                                            {row.bgSubtle ? (
                                                <div className="d-flex align-items-center gap-2">
                                                    <Swatch token={`--bs-${row.name}-bg-subtle`} size={20} />
                                                    <code className="small">{row.bgSubtle}</code>
                                                </div>
                                            ) : '—'}
                                        </td>
                                        <td>
                                            {row.borderSubtle ? (
                                                <div className="d-flex align-items-center gap-2">
                                                    <Swatch token={`--bs-${row.name}-border-subtle`} size={20} />
                                                    <code className="small">{row.borderSubtle}</code>
                                                </div>
                                            ) : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Section>

                {/* ── 5. Bootstrap Semantic Roles ─────────────────────────── */}
                <Section title="Bootstrap Semantic Roles">
                    <div className="table-responsive">
                        <table className="table table-sm table-hover align-middle mb-0 ds-showcase-table">
                            <thead>
                                <tr className="text-body-secondary">
                                    <th className="ds-showcase-table__swatch-col" />
                                    <th>Token</th>
                                    <th>Value</th>
                                    <th>DS Alias</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    '--bs-body-bg', '--bs-body-color', '--bs-emphasis-color',
                                    '--bs-secondary-bg', '--bs-secondary-color', '--bs-tertiary-bg', '--bs-tertiary-color',
                                    '--bs-border-color', '--bs-border-color-translucent',
                                    '--bs-link-color', '--bs-link-hover-color',
                                    '--bs-code-color', '--bs-highlight-bg', '--bs-highlight-color',
                                ].map((token) => {
                                    const dsAliases = DS_FIELD_CHAIN.filter((r) => r.bs === token).map((r) => r.ds);
                                    const projectAliases = PROJECT_VARS.filter((r) => r.alias === token).map((r) => r.token);
                                    const allAliases = [...dsAliases, ...projectAliases];
                                    return (
                                        <tr key={token}>
                                            <td><Swatch token={token} size={22} /></td>
                                            <td><code>{token}</code></td>
                                            <td><code className="text-body-secondary">{resolve(token)}</code></td>
                                            <td>
                                                {allAliases.length > 0
                                                    ? allAliases.map((a) => <code key={a} className="me-2 text-body-secondary">{a}</code>)
                                                    : <span className="text-body-secondary small">—</span>
                                                }
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Section>

                {/* ── 6. Mantine Color Scales ─────────────────────────────── */}
                <Section title="Mantine Color Scales" badge={MANTINE_COLORS.length}>
                    <p className="text-body-secondary small mb-3">
                        Each color has a 10-step gradient (0-9) plus preset variants: <strong>filled</strong>, <strong>filled-hover</strong>, <strong>light</strong>, <strong>light-hover</strong>, <strong>light-color</strong>, <strong>outline</strong>, <strong>outline-hover</strong>.
                    </p>
                    {MANTINE_COLORS.map((color) => (
                        <div key={color} className="mb-4">
                            <div className="d-flex align-items-center gap-2 mb-2">
                                <h6 className="mb-0 text-capitalize fw-bold small">{color}</h6>
                                <code className="small text-body-secondary">--mantine-color-{color}-[0..9]</code>
                            </div>
                            <GradientScale prefix={`--mantine-color-${color}-`} steps={SCALE_10} />
                            {mantineVariants[color]?.length > 0 && (
                                <div className="d-flex flex-wrap gap-2 mt-2">
                                    {mantineVariants[color].map(({ token, label, value }) => (
                                        <div key={token} className="ds-showcase-variant" title={`${token}: ${value}`}>
                                            <Swatch token={token} size={18} />
                                            <span className="text-body-secondary ds-showcase-variant__label">{label}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </Section>

                {/* ── 7. Button Accent Gradient ───────────────────────────── */}
                <Section title="Button Accent Gradient" badge={BUTTON_ACCENTS.length}>
                    <p className="text-body-secondary small mb-3">
                        Source: <code>src/styles/base.scss</code> — Raw RGB values used in animated blob gradient.
                    </p>
                    <div className="ds-showcase-accent-bar">
                        {BUTTON_ACCENTS.map(({ token }) => {
                            const val = resolve(token);
                            return (
                                <TokenPreview as="div" key={token} token={token} className="ds-showcase-accent-bar__swatch" title={`${token}: ${val}`} />
                            );
                        })}
                    </div>
                    <div className="table-responsive">
                        <table className="table table-sm table-hover align-middle mb-0 ds-showcase-table">
                            <thead>
                                <tr className="text-body-secondary">
                                    <th className="ds-showcase-table__swatch-col" />
                                    <th>Token</th>
                                    <th>Name</th>
                                    <th>RGB Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {BUTTON_ACCENTS.map(({ token, label }) => {
                                    const val = resolve(token);
                                    return (
                                        <tr key={token}>
                                            <td><Swatch token={token} size={22} /></td>
                                            <td><code>{token}</code></td>
                                            <td className="text-body-secondary">{label}</td>
                                            <td><code className="text-body-secondary">{val}</code></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Section>

                {/* ── 8. Project Custom Variables ─────────────────────────── */}
                <Section title="Project Custom Variables" badge={PROJECT_VARS.length}>
                    <p className="text-body-secondary small mb-3">
                        Source: <code>src/styles/base.scss :root</code>
                    </p>
                    <div className="table-responsive">
                        <table className="table table-sm table-hover align-middle mb-0 ds-showcase-table">
                            <thead>
                                <tr className="text-body-secondary">
                                    <th className="ds-showcase-table__swatch-col" />
                                    <th>Token</th>
                                    <th>Alias of</th>
                                    <th>Role</th>
                                    <th>Resolved</th>
                                </tr>
                            </thead>
                            <tbody>
                                {PROJECT_VARS.map((row) => (
                                    <tr key={row.token}>
                                        <td><Swatch token={row.token} size={22} /></td>
                                        <td><code>{row.token}</code></td>
                                        <td><code className="text-body-secondary">{row.alias}</code></td>
                                        <td className="text-body-secondary">{row.role}</td>
                                        <td><code className="text-body-secondary">{resolve(row.token)}</code></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Section>

                {/* ── 9. Semantic Role Map ────────────────────────────────── */}
                <Section title="Semantic Role Map" badge={RECENT_SEMANTIC_COLOR_ROLES.length}>
                    <p className="text-body-secondary small mb-3">
                        Source: <code>src/theme/colorSystem.ts</code> — Maps purpose to token, with usage locations.
                    </p>
                    <div className="table-responsive">
                        <table className="table table-sm table-hover align-middle mb-0 ds-showcase-table">
                            <thead>
                                <tr className="text-body-secondary">
                                    <th className="ds-showcase-table__swatch-col" />
                                    <th>Role Name</th>
                                    <th>Token</th>
                                    <th>Purpose</th>
                                    <th>Used In</th>
                                </tr>
                            </thead>
                            <tbody>
                                {RECENT_SEMANTIC_COLOR_ROLES.map((role) => (
                                    <tr key={role.name}>
                                        <td><Swatch token={role.token} size={22} /></td>
                                        <td><code>{role.name}</code></td>
                                        <td><code className="text-body-secondary">{role.token}</code></td>
                                        <td className="text-body-secondary">{role.purpose}</td>
                                        <td className="ds-showcase-source-list">
                                            {role.usedIn.map((f) => (
                                                <code key={f} className="text-body-secondary">{f}</code>
                                            ))}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Section>

            </div>
        </div>
    );
}
