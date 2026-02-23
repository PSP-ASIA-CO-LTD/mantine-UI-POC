import { useMemo } from 'react';

type TokenRow = {
    token: string;
    value: string;
};

type IntentRoleRow = {
    name: string;
    base?: TokenRow;
    textEmphasis?: TokenRow;
    bgSubtle?: TokenRow;
    borderSubtle?: TokenRow;
};

const CORE_PALETTE_TOKENS = [
    '--bs-blue',
    '--bs-indigo',
    '--bs-purple',
    '--bs-pink',
    '--bs-red',
    '--bs-orange',
    '--bs-yellow',
    '--bs-green',
    '--bs-teal',
    '--bs-cyan',
    '--bs-white',
    '--bs-gray',
    '--bs-gray-dark',
    '--bs-gray-100',
    '--bs-gray-200',
    '--bs-gray-300',
    '--bs-gray-400',
    '--bs-gray-500',
    '--bs-gray-600',
    '--bs-gray-700',
    '--bs-gray-800',
    '--bs-gray-900',
    '--bs-black',
];

const THEME_INTENTS = ['primary', 'secondary', 'success', 'info', 'warning', 'danger', 'light', 'dark'];

const ROLE_TOKENS = [
    '--bs-body-bg',
    '--bs-body-color',
    '--bs-emphasis-color',
    '--bs-secondary-bg',
    '--bs-secondary-color',
    '--bs-border-color',
    '--bs-border-color-translucent',
    '--bs-link-color',
    '--bs-link-hover-color',
    '--bs-code-color',
    '--bs-highlight-bg',
    '--bs-highlight-color',
];

const getRootStyles = (): CSSStyleDeclaration | null => {
    if (typeof window === 'undefined' || !window.document?.documentElement) {
        return null;
    }
    return getComputedStyle(window.document.documentElement);
};

const readToken = (styles: CSSStyleDeclaration | null, token: string): TokenRow | null => {
    if (!styles) return null;
    const value = styles.getPropertyValue(token).trim();
    if (!value) return null;
    return { token, value };
};

const readTokenGroup = (styles: CSSStyleDeclaration | null, tokens: string[]): TokenRow[] =>
    tokens.map((token) => readToken(styles, token)).filter((row): row is TokenRow => row !== null);

const toTokenLabel = (token: string) => token.replace(/^--bs-/, '').replace(/-/g, ' ');

const toPreviewColor = (token: string) => (token.endsWith('-rgb') ? `rgb(var(${token}))` : `var(${token})`);

export function UiPalette() {
    const styles = getRootStyles();

    const corePalette = useMemo(() => readTokenGroup(styles, CORE_PALETTE_TOKENS), [styles]);
    const semanticRoles = useMemo(() => readTokenGroup(styles, ROLE_TOKENS), [styles]);
    const intentRoles = useMemo<IntentRoleRow[]>(
        () =>
            THEME_INTENTS.map((name) => ({
                name,
                base: readToken(styles, `--bs-${name}`) || undefined,
                textEmphasis: readToken(styles, `--bs-${name}-text-emphasis`) || undefined,
                bgSubtle: readToken(styles, `--bs-${name}-bg-subtle`) || undefined,
                borderSubtle: readToken(styles, `--bs-${name}-border-subtle`) || undefined,
            })).filter((item) => item.base),
        [styles]
    );

    return (
        <div className="ui-palette-bootstrap container-fluid px-0">
            <div className="d-flex flex-column gap-4">
                <section className="card shadow-sm">
                    <div className="card-body">
                        <h2 className="h4 mb-2">Bootstrap Quartz Palette</h2>
                        <p className="text-body-secondary mb-0">
                            Live output from current <code>/public/bootswatch/quartz/bootstrap.min.css</code>. Only tokens available in this CSS are shown.
                        </p>
                    </div>
                </section>

                <section className="card shadow-sm">
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h3 className="h5 mb-0">Theme Intents</h3>
                            <span className="badge text-bg-secondary">{intentRoles.length}</span>
                        </div>
                        <div className="d-flex flex-wrap gap-2 mb-3">
                            {intentRoles.map((intent) => (
                                <span key={`preview-${intent.name}`} className={`badge text-bg-${intent.name}`}>
                                    text-bg-{intent.name}
                                </span>
                            ))}
                        </div>
                        <div className="ui-palette-grid">
                            {intentRoles.map((intent) =>
                                intent.base ? (
                                    <article key={intent.base.token} className="ui-palette-token-card">
                                        <div className="ui-palette-swatch" style={{ backgroundColor: toPreviewColor(intent.base.token) }} />
                                        <p className="small text-body-secondary mb-1 text-capitalize">{intent.name}</p>
                                        <code className="d-block small">{intent.base.token}</code>
                                        <code className="d-block small text-body-secondary">{intent.base.value}</code>
                                    </article>
                                ) : null
                            )}
                        </div>
                    </div>
                </section>

                <section className="card shadow-sm">
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h3 className="h5 mb-0">Core Palette Tokens</h3>
                            <span className="badge text-bg-secondary">{corePalette.length}</span>
                        </div>
                        <div className="ui-palette-grid">
                            {corePalette.map((token) => (
                                <article key={token.token} className="ui-palette-token-card">
                                    <div className="ui-palette-swatch" style={{ backgroundColor: toPreviewColor(token.token) }} />
                                    <p className="small text-body-secondary mb-1 text-capitalize">{toTokenLabel(token.token)}</p>
                                    <code className="d-block small">{token.token}</code>
                                    <code className="d-block small text-body-secondary">{token.value}</code>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="card shadow-sm">
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h3 className="h5 mb-0">Semantic Roles</h3>
                            <span className="badge text-bg-secondary">{semanticRoles.length}</span>
                        </div>
                        <div className="ui-palette-grid">
                            {semanticRoles.map((token) => (
                                <article key={token.token} className="ui-palette-token-card">
                                    <div className="ui-palette-swatch" style={{ backgroundColor: toPreviewColor(token.token) }} />
                                    <p className="small text-body-secondary mb-1 text-capitalize">{toTokenLabel(token.token)}</p>
                                    <code className="d-block small">{token.token}</code>
                                    <code className="d-block small text-body-secondary">{token.value}</code>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="card shadow-sm">
                    <div className="card-body">
                        <h3 className="h5 mb-3">Intent Role Matrix</h3>
                        <div className="table-responsive">
                            <table className="table table-sm align-middle mb-0">
                                <thead>
                                    <tr>
                                        <th>Intent</th>
                                        <th>Base</th>
                                        <th>Text Emphasis</th>
                                        <th>Bg Subtle</th>
                                        <th>Border Subtle</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {intentRoles.map((intent) => (
                                        <tr key={`matrix-${intent.name}`}>
                                            <th className="text-capitalize">{intent.name}</th>
                                            {[intent.base, intent.textEmphasis, intent.bgSubtle, intent.borderSubtle].map((cell, idx) => (
                                                <td key={`${intent.name}-${idx}`}>
                                                    {cell ? (
                                                        <div className="d-flex align-items-center gap-2">
                                                            <span
                                                                className="ui-palette-swatch-inline"
                                                                style={{ backgroundColor: toPreviewColor(cell.token) }}
                                                            />
                                                            <code className="small">{cell.token}</code>
                                                        </div>
                                                    ) : (
                                                        <span className="text-body-secondary small">n/a</span>
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
