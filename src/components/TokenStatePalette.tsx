import { useMemo } from 'react';
import { TokenPreview } from './TokenPreview';

export interface TokenDef {
    token: string;
    label: string;
    state?: string;
}

export interface TokenGroup {
    title: string;
    source: string;
    tokens: TokenDef[];
}

function resolveColor(token: string): string {
    const styles = getComputedStyle(document.documentElement);
    return styles.getPropertyValue(token).trim() || '';
}

function SwatchRow({ def }: { def: TokenDef }) {
    const resolved = useMemo(() => resolveColor(def.token), [def.token]);

    return (
        <tr>
            <td className="ds-showcase-table__swatch-col ds-showcase-table__cell">
                <TokenPreview token={def.token} className="ds-token-preview--table" title={`${def.token}: ${resolved}`} />
            </td>
            <td className="ds-showcase-table__cell">
                <code className="small">{def.token}</code>
            </td>
            <td className="ds-showcase-table__cell">
                <span className="small text-body-secondary">{def.label}</span>
            </td>
            {def.state && (
                <td className="ds-showcase-table__cell">
                    <span className="badge text-bg-light border small">{def.state}</span>
                </td>
            )}
            {!def.state && <td className="ds-showcase-table__cell" />}
            <td className="ds-showcase-table__cell">
                <code className="small text-body-secondary">{resolved}</code>
            </td>
        </tr>
    );
}

export function TokenStatePalette({ groups }: { groups: TokenGroup[] }) {
    return (
        <section className="card shadow-sm mt-4 ds-showcase-muted-panel">
            <div className="card-body">
                <h5 className="h6 text-uppercase text-body-secondary mb-3 ds-showcase-kicker">
                    Token Palette
                </h5>
                {groups.map((group) => (
                    <div key={group.title} className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="mb-0 small fw-bold">{group.title}</h6>
                            <code className="small text-body-secondary">{group.source}</code>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-sm table-hover align-middle mb-0 ds-showcase-table">
                                <thead>
                                    <tr className="text-body-secondary">
                                        <th className="ds-showcase-table__swatch-col ds-showcase-table__cell" />
                                        <th className="ds-showcase-table__cell">Token</th>
                                        <th className="ds-showcase-table__cell">Role</th>
                                        <th className="ds-showcase-table__cell">State</th>
                                        <th className="ds-showcase-table__cell">Resolved</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {group.tokens.map((def) => (
                                        <SwatchRow key={def.token} def={def} />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
