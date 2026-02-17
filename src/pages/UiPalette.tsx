import { Anchor, Badge, Card, Code, Divider, Group, Stack, Table, Text, Title } from '@mantine/core';
import { DEFAULT_THEME } from '@mantine/core';
import { COLOR_STORAGE_FILES, RECENT_SEMANTIC_COLOR_ROLES, SURFACE_COLOR_TOKENS } from '../theme/colorSystem';
import {
    DISCOVERED_LITERAL_COLORS,
    DISCOVERED_MISSING_VAR_COLORS,
    DISCOVERED_TOKENIZED_FALLBACK_COLORS,
} from '../theme/discoveredColors';
import './UiPalette.css';

type ColorFamily = [string, readonly string[]];
type ParsedRgb = { r: number; g: number; b: number };
type PaletteColorCandidate = { token: string; hex: string; rgb: ParsedRgb };

const colorFamilies = Object.entries(DEFAULT_THEME.colors as Record<string, readonly string[]>).sort(([a], [b]) =>
    a.localeCompare(b)
) as ColorFamily[];

const MAX_RGB_DISTANCE = Math.sqrt(3 * 255 * 255);

const clampChannel = (value: number) => Math.max(0, Math.min(255, Math.round(value)));

const hslToRgb = (h: number, s: number, l: number): ParsedRgb => {
    const normalizedHue = ((h % 360) + 360) % 360;
    const sat = s / 100;
    const light = l / 100;

    const c = (1 - Math.abs(2 * light - 1)) * sat;
    const x = c * (1 - Math.abs((normalizedHue / 60) % 2 - 1));
    const m = light - c / 2;

    let r = 0;
    let g = 0;
    let b = 0;

    if (normalizedHue < 60) {
        r = c;
        g = x;
    } else if (normalizedHue < 120) {
        r = x;
        g = c;
    } else if (normalizedHue < 180) {
        g = c;
        b = x;
    } else if (normalizedHue < 240) {
        g = x;
        b = c;
    } else if (normalizedHue < 300) {
        r = x;
        b = c;
    } else {
        r = c;
        b = x;
    }

    return {
        r: clampChannel((r + m) * 255),
        g: clampChannel((g + m) * 255),
        b: clampChannel((b + m) * 255),
    };
};

const parseCssColor = (value: string): ParsedRgb | null => {
    const color = value.trim();

    let match = color.match(/^#([0-9a-f]{3})$/i);
    if (match) {
        const hex = match[1];
        return {
            r: Number.parseInt(`${hex[0]}${hex[0]}`, 16),
            g: Number.parseInt(`${hex[1]}${hex[1]}`, 16),
            b: Number.parseInt(`${hex[2]}${hex[2]}`, 16),
        };
    }

    match = color.match(/^#([0-9a-f]{6})$/i);
    if (match) {
        const hex = match[1];
        return {
            r: Number.parseInt(hex.slice(0, 2), 16),
            g: Number.parseInt(hex.slice(2, 4), 16),
            b: Number.parseInt(hex.slice(4, 6), 16),
        };
    }

    match = color.match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*[\d.]+\s*)?\)$/i);
    if (match) {
        return {
            r: clampChannel(Number(match[1])),
            g: clampChannel(Number(match[2])),
            b: clampChannel(Number(match[3])),
        };
    }

    match = color.match(/^hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*(?:,\s*[\d.]+\s*)?\)$/i);
    if (match) {
        return hslToRgb(Number(match[1]), Number(match[2]), Number(match[3]));
    }

    return null;
};

const resolveMantineTokenHex = (token: string): string | null => {
    if (token === '--mantine-color-white') return '#ffffff';
    if (token === '--mantine-color-black') return '#000000';

    const match = token.match(/^--mantine-color-([a-z]+)-(\d)$/);
    if (!match) return null;

    const [, family, shadeRaw] = match;
    const shade = Number(shadeRaw);
    const shades = (DEFAULT_THEME.colors as Record<string, readonly string[]>)[family];
    return shades?.[shade] || null;
};

const getRgbDistance = (source: ParsedRgb, target: ParsedRgb): number =>
    Math.sqrt((source.r - target.r) ** 2 + (source.g - target.g) ** 2 + (source.b - target.b) ** 2);

const getAlphaChannel = (value: string): number | null => {
    const color = value.trim();

    const rgbMatch = color.match(/^rgba\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*([\d.]+)\s*\)$/i);
    if (rgbMatch) return Number(rgbMatch[1]);

    const hslMatch = color.match(/^hsla\(\s*[\d.]+\s*,\s*[\d.]+%\s*,\s*[\d.]+%\s*,\s*([\d.]+)\s*\)$/i);
    if (hslMatch) return Number(hslMatch[1]);

    return null;
};

const isOpacityLiteralColor = (value: string): boolean => {
    const alpha = getAlphaChannel(value);
    return alpha !== null && alpha < 1;
};

const getLikenessPercent = (source: string, targetHex: string | null): number | null => {
    if (!targetHex) return null;
    const sourceRgb = parseCssColor(source);
    const targetRgb = parseCssColor(targetHex);
    if (!sourceRgb || !targetRgb) return null;

    const distance = getRgbDistance(sourceRgb, targetRgb);
    const ratio = Math.max(0, 1 - distance / MAX_RGB_DISTANCE);
    return Math.round(ratio * 100);
};

const paletteColorCandidates: PaletteColorCandidate[] = [
    {
        token: '--mantine-color-white',
        hex: '#ffffff',
        rgb: { r: 255, g: 255, b: 255 },
    },
    {
        token: '--mantine-color-black',
        hex: '#000000',
        rgb: { r: 0, g: 0, b: 0 },
    },
    ...colorFamilies.flatMap(([family, shades]) =>
        shades.map((hex, shadeIndex) => ({
            token: `--mantine-color-${family}-${shadeIndex}`,
            hex,
            rgb: parseCssColor(hex),
        }))
    ),
].filter((item): item is PaletteColorCandidate => item.rgb !== null);

const findNearestPaletteColor = (source: string): PaletteColorCandidate | null => {
    const sourceRgb = parseCssColor(source);
    if (!sourceRgb) return null;

    let nearestCandidate: PaletteColorCandidate | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const candidate of paletteColorCandidates) {
        const distance = getRgbDistance(sourceRgb, candidate.rgb);
        if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestCandidate = candidate;
        }
    }

    return nearestCandidate;
};

export function UiPalette() {
    const toHref = (pathWithLine: string) => {
        const filePath = pathWithLine.split(':')[0];
        return filePath.startsWith('/') ? filePath : `/${filePath}`;
    };

    const canPreviewLiteral = (value: string) => {
        if (value.includes('${')) return false;
        if (value.startsWith('rgb(var(') || value.startsWith('rgba(var(')) return false;
        return true;
    };

    const tokenizedFallbackRows = DISCOVERED_TOKENIZED_FALLBACK_COLORS.map((item) => {
        const tokenHex = resolveMantineTokenHex(item.token);
        const likeness = getLikenessPercent(item.value, tokenHex);
        return { ...item, tokenHex, likeness };
    }).sort((a, b) => (a.likeness ?? 101) - (b.likeness ?? 101));

    const opacityLiteralColors = DISCOVERED_LITERAL_COLORS.filter((item) => isOpacityLiteralColor(item.value));
    const opaqueLiteralColors = DISCOVERED_LITERAL_COLORS.filter((item) => !isOpacityLiteralColor(item.value));

    const literalNearestPaletteRows = opaqueLiteralColors.map((item) => {
        const nearest = findNearestPaletteColor(item.value);
        const likeness = nearest ? getLikenessPercent(item.value, nearest.hex) : null;
        return {
            ...item,
            nearestToken: nearest?.token ?? null,
            nearestHex: nearest?.hex ?? null,
            likeness,
        };
    }).sort((a, b) => (a.likeness ?? 101) - (b.likeness ?? 101));

    return (
        <div className="ui-palette">
            <Stack gap="xl">
                <div>
                    <Title order={2}>UI Palette</Title>
                    <Text c="dimmed" size="sm">
                        All palette families sorted by name with shades in grids. Manage semantic roles from one place.
                    </Text>
                </div>

                <Card withBorder radius="md" padding="lg">
                    <Stack gap="sm">
                        <Title order={4}>Color Storage Files</Title>
                        <Text size="sm" c="dimmed">
                            Update semantic mapping in these files. Links open the source directly from Vite.
                        </Text>
                        <Stack gap={6}>
                            {COLOR_STORAGE_FILES.map((item) => (
                                <Anchor key={item.path} href={item.path} target="_blank" rel="noreferrer">
                                    {item.label}: <Code>{item.path}</Code>
                                </Anchor>
                            ))}
                        </Stack>
                    </Stack>
                </Card>

                {(SURFACE_COLOR_TOKENS.length > 0 ||
                    DISCOVERED_LITERAL_COLORS.length > 0 ||
                    DISCOVERED_MISSING_VAR_COLORS.length > 0) ? (
                    <Card withBorder radius="md" padding="lg">
                        <Stack gap="lg">
                            <Title order={4}>Surface + Non-Tokenized Color Audit</Title>

                            {SURFACE_COLOR_TOKENS.length > 0 ? (
                                <Stack gap="sm">
                                    <Group justify="space-between" align="center">
                                        <Text fw={700}>Background & Surface Tokens</Text>
                                        <Badge variant="light">{SURFACE_COLOR_TOKENS.length}</Badge>
                                    </Group>
                                    <Text size="sm" c="dimmed">
                                        Extra palette for non-shade tokens (for example <Code>--mantine-color-body</Code>).
                                    </Text>
                                    <div className="ui-palette__shades-grid">
                                        {SURFACE_COLOR_TOKENS.map((item) => (
                                            <div key={item.token} className="ui-palette__shade-cell">
                                                <div className="ui-palette__swatch-checker">
                                                    <div className="ui-palette__swatch" style={{ backgroundColor: `var(${item.token})` }} />
                                                </div>
                                                <Text size="xs" fw={600}>
                                                    {item.name}
                                                </Text>
                                                <Code>{item.token}</Code>
                                                <Text size="xs" c="dimmed">
                                                    {item.purpose}
                                                </Text>
                                            </div>
                                        ))}
                                    </div>
                                </Stack>
                            ) : null}

                            {opaqueLiteralColors.length > 0 ? (
                                <Stack gap="sm">
                                    <Group justify="space-between" align="center">
                                        <Text fw={700}>Literal Colors In Code (Not Tokenized, Opaque)</Text>
                                        <Badge variant="light">{opaqueLiteralColors.length}</Badge>
                                    </Group>
                                    <Text size="sm" c="dimmed">
                                        Hard-coded colors without opacity values, shown separately for palette matching review.
                                    </Text>
                                    <div className="ui-palette__family-list ui-palette__family-list--literal">
                                        {opaqueLiteralColors.map((item) => (
                                            <div key={item.value} className="ui-palette__family">
                                                <div className="ui-palette__shade-cell">
                                                    <div className="ui-palette__swatch-checker">
                                                        <div
                                                            className="ui-palette__swatch"
                                                            style={canPreviewLiteral(item.value) ? { backgroundColor: item.value } : undefined}
                                                        />
                                                    </div>
                                                    <Code>{item.value}</Code>
                                                    <Stack gap={2}>
                                                        {item.usedIn.map((loc) => (
                                                            <Anchor key={`${item.value}-${loc}`} href={toHref(loc)} target="_blank" rel="noreferrer">
                                                                <Code>{loc}</Code>
                                                            </Anchor>
                                                        ))}
                                                    </Stack>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Stack>
                            ) : null}

                            {opacityLiteralColors.length > 0 ? (
                                <Stack gap="sm">
                                    <Group justify="space-between" align="center">
                                        <Text fw={700}>Opacity Literal Colors (Grouped)</Text>
                                        <Badge variant="light">{opacityLiteralColors.length}</Badge>
                                    </Group>
                                    <Text size="sm" c="dimmed">
                                        Colors using alpha (for example <Code>rgba</Code> and <Code>hsla</Code>) grouped together and excluded from nearest palette matching.
                                    </Text>
                                    <div className="ui-palette__family-list ui-palette__family-list--literal">
                                        {opacityLiteralColors.map((item) => (
                                            <div key={item.value} className="ui-palette__family">
                                                <div className="ui-palette__shade-cell">
                                                    <div className="ui-palette__swatch-checker">
                                                        <div
                                                            className="ui-palette__swatch"
                                                            style={canPreviewLiteral(item.value) ? { backgroundColor: item.value } : undefined}
                                                        />
                                                    </div>
                                                    <Code>{item.value}</Code>
                                                    <Stack gap={2}>
                                                        {item.usedIn.map((loc) => (
                                                            <Anchor key={`${item.value}-${loc}`} href={toHref(loc)} target="_blank" rel="noreferrer">
                                                                <Code>{loc}</Code>
                                                            </Anchor>
                                                        ))}
                                                    </Stack>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Stack>
                            ) : null}

                            {literalNearestPaletteRows.length > 0 ? (
                                <Stack gap="sm">
                                    <Group justify="space-between" align="center">
                                        <Text fw={700}>Literal Color to Nearest Palette Match (Review)</Text>
                                        <Badge variant="light">{literalNearestPaletteRows.length}</Badge>
                                    </Group>
                                    <Text size="sm" c="dimmed">
                                        Review-only mapping to nearest palette tokens. No color replacement is applied yet.
                                    </Text>
                                    <Table.ScrollContainer minWidth={960}>
                                        <Table striped highlightOnHover withTableBorder withColumnBorders>
                                            <Table.Thead>
                                                <Table.Tr>
                                                    <Table.Th>Literal Color</Table.Th>
                                                    <Table.Th>Nearest Palette Token</Table.Th>
                                                    <Table.Th>Likeness</Table.Th>
                                                    <Table.Th>Used In</Table.Th>
                                                </Table.Tr>
                                            </Table.Thead>
                                            <Table.Tbody>
                                                {literalNearestPaletteRows.map((item) => (
                                                    <Table.Tr key={`nearest-${item.value}`}>
                                                        <Table.Td>
                                                            <Group gap="xs" wrap="nowrap">
                                                                <div className="ui-palette__swatch-checker ui-palette__match-swatch-wrap">
                                                                    <div
                                                                        className="ui-palette__swatch ui-palette__match-swatch"
                                                                        style={
                                                                            canPreviewLiteral(item.value)
                                                                                ? { backgroundColor: item.value }
                                                                                : undefined
                                                                        }
                                                                    />
                                                                </div>
                                                                <Code>{item.value}</Code>
                                                            </Group>
                                                        </Table.Td>
                                                        <Table.Td>
                                                            {item.nearestToken && item.nearestHex ? (
                                                                <Group gap="xs" wrap="nowrap">
                                                                    <div className="ui-palette__swatch-checker ui-palette__match-swatch-wrap">
                                                                        <div
                                                                            className="ui-palette__swatch ui-palette__match-swatch"
                                                                            style={{ backgroundColor: item.nearestHex }}
                                                                        />
                                                                    </div>
                                                                    <Stack gap={2}>
                                                                        <Code>{item.nearestToken}</Code>
                                                                        <Code>{item.nearestHex}</Code>
                                                                    </Stack>
                                                                </Group>
                                                            ) : (
                                                                <Text size="sm" c="dimmed">
                                                                    n/a
                                                                </Text>
                                                            )}
                                                        </Table.Td>
                                                        <Table.Td>
                                                            <Badge size="sm" variant="light">
                                                                {item.likeness === null ? 'n/a' : `${item.likeness}%`}
                                                            </Badge>
                                                        </Table.Td>
                                                        <Table.Td>
                                                            <Stack gap={2}>
                                                                {item.usedIn.map((loc) => (
                                                                    <Anchor
                                                                        key={`nearest-${item.value}-${loc}`}
                                                                        href={toHref(loc)}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                    >
                                                                        <Code>{loc}</Code>
                                                                    </Anchor>
                                                                ))}
                                                            </Stack>
                                                        </Table.Td>
                                                    </Table.Tr>
                                                ))}
                                            </Table.Tbody>
                                        </Table>
                                    </Table.ScrollContainer>
                                </Stack>
                            ) : null}

                            {DISCOVERED_MISSING_VAR_COLORS.length > 0 ? (
                                <Stack gap="sm">
                                    <Group justify="space-between" align="center">
                                        <Text fw={700}>Missing CSS Variable Colors (Not Yet in Palette)</Text>
                                        <Badge variant="light">{DISCOVERED_MISSING_VAR_COLORS.length}</Badge>
                                    </Group>
                                    <Text size="sm" c="dimmed">
                                        Auto-collected color-like CSS variables currently used in app code but not covered by existing palette groups.
                                    </Text>
                                    <div className="ui-palette__shades-grid">
                                        {DISCOVERED_MISSING_VAR_COLORS.map((item) => (
                                            <div key={item.token} className="ui-palette__shade-cell">
                                                <div className="ui-palette__swatch-checker">
                                                    <div className="ui-palette__swatch" style={{ backgroundColor: `var(${item.token})` }} />
                                                </div>
                                                <Code>{item.token}</Code>
                                                <Stack gap={2}>
                                                    {item.usedIn.map((loc) => (
                                                        <Anchor key={`${item.token}-${loc}`} href={toHref(loc)} target="_blank" rel="noreferrer">
                                                            <Code>{loc}</Code>
                                                        </Anchor>
                                                    ))}
                                                </Stack>
                                            </div>
                                        ))}
                                    </div>
                                </Stack>
                            ) : null}
                        </Stack>
                    </Card>
                ) : null}

                {tokenizedFallbackRows.length > 0 ? (
                    <Card withBorder radius="md" padding="lg">
                        <Stack gap="lg">
                            <Group justify="space-between" align="center">
                                <Title order={4}>Tokenized Fallback Colors (Backward Compatible)</Title>
                                <Badge variant="light">{tokenizedFallbackRows.length}</Badge>
                            </Group>
                            <Text size="sm" c="dimmed">
                                Literal colors already migrated to <Code>var(--mantine-*, literal)</Code>. Sorted by lowest likeness first.
                            </Text>
                            <div className="ui-palette__family-list ui-palette__family-list--literal">
                                {tokenizedFallbackRows.map((item) => (
                                    <div key={`${item.token}-${item.value}`} className="ui-palette__family">
                                        <div className="ui-palette__shade-cell">
                                            <div className="ui-palette__swatch-checker">
                                                <div
                                                    className="ui-palette__swatch"
                                                    style={canPreviewLiteral(item.value) ? { backgroundColor: item.value } : undefined}
                                                />
                                            </div>
                                            <Text size="xs" c="dimmed">Fallback</Text>
                                            <div className="ui-palette__swatch-checker">
                                                <div
                                                    className="ui-palette__swatch"
                                                    style={canPreviewLiteral(item.value) ? { backgroundColor: `var(${item.token})` } : undefined}
                                                />
                                            </div>
                                            <Text size="xs" c="dimmed">Token Result</Text>
                                            <Code>{item.value}</Code>
                                            <Code>{item.token}</Code>
                                            <Group gap={6}>
                                                <Badge size="sm" variant="light">
                                                    {item.likeness === null ? 'n/a' : `${item.likeness}%`}
                                                </Badge>
                                                {item.tokenHex ? <Code>{item.tokenHex}</Code> : null}
                                            </Group>
                                            <Stack gap={2}>
                                                {item.usedIn.map((loc) => (
                                                    <Anchor key={`${item.token}-${item.value}-${loc}`} href={toHref(loc)} target="_blank" rel="noreferrer">
                                                        <Code>{loc}</Code>
                                                    </Anchor>
                                                ))}
                                            </Stack>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Stack>
                    </Card>
                ) : null}

                <Card withBorder radius="md" padding="lg">
                    <Stack gap="lg">
                        <Title order={4}>Palette Families (Shades 0-9)</Title>
                        <div className="ui-palette__family-list">
                            {colorFamilies.map(([family, shades]) => (
                                <div key={family} className="ui-palette__family">
                                    <Group justify="space-between" mb={8}>
                                        <Text fw={700}>{family}</Text>
                                        <Badge variant="light">{shades.length} shades</Badge>
                                    </Group>
                                    <div className="ui-palette__shades-grid">
                                        {shades.map((hex, idx) => {
                                            const token = `--mantine-color-${family}-${idx}`;
                                            return (
                                                <div key={token} className="ui-palette__shade-cell">
                                                    <div className="ui-palette__swatch-checker">
                                                        <div className="ui-palette__swatch" style={{ backgroundColor: hex }} />
                                                    </div>
                                                    <Text size="xs" fw={600}>
                                                        {family}.{idx}
                                                    </Text>
                                                    <Code>{token}</Code>
                                                    <Code>{hex}</Code>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Stack>
                </Card>

                <Divider />

                <Card withBorder radius="md" padding="lg">
                    <Stack gap="md">
                        <Title order={4}>Recent Semantic Roles (Used in App)</Title>
                        <Text size="sm" c="dimmed">
                            Role names below are grouped for app-level meaning. Edit mapping in{' '}
                            <Code>/src/theme/colorSystem.ts</Code>.
                        </Text>

                        <Table striped highlightOnHover withTableBorder withColumnBorders>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Semantic Role</Table.Th>
                                    <Table.Th>Token</Table.Th>
                                    <Table.Th>Preview</Table.Th>
                                    <Table.Th>Purpose</Table.Th>
                                    <Table.Th>Used In</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {RECENT_SEMANTIC_COLOR_ROLES.map((role) => (
                                    <Table.Tr key={role.name}>
                                        <Table.Td>
                                            <Code>{role.name}</Code>
                                        </Table.Td>
                                        <Table.Td>
                                            <Code>{role.token}</Code>
                                        </Table.Td>
                                        <Table.Td>
                                            <div className="ui-palette__role-preview" style={{ background: `var(${role.token})` }} />
                                        </Table.Td>
                                        <Table.Td>{role.purpose}</Table.Td>
                                        <Table.Td>
                                            <Stack gap={4}>
                                                {role.usedIn.map((file) => (
                                                    <Anchor key={`${role.name}-${file}`} href={file} target="_blank" rel="noreferrer">
                                                        <Code>{file}</Code>
                                                    </Anchor>
                                                ))}
                                            </Stack>
                                        </Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    </Stack>
                </Card>
            </Stack>
        </div>
    );
}
