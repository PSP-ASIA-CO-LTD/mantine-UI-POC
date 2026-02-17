import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, 'src');
const OUTPUT_FILE = path.join(SRC_DIR, 'theme', 'discoveredColors.ts');
const EXCLUDE_FILE = path.normalize(path.join(SRC_DIR, 'theme', 'discoveredColors.ts'));
const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.css']);
const MANTINE_COLOR_PREFIXES = ['--mantine-color-', '--mantine-primary-color-'];
const HEX_RE = /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g;
const FUNC_RE = /\b(?:rgb|rgba|hsl|hsla)\([^)]*\)/g;

const isPaletteToken = (token) => MANTINE_COLOR_PREFIXES.some((prefix) => token.startsWith(prefix));
const isColorLikeToken = (token) =>
    /(color|bg|fg|accent|surface|white|black|border|overlay|ink|fill|stroke)/i.test(token);

const toPosix = (filePath) => filePath.split(path.sep).join('/');

const isSourceFile = (filePath) => SOURCE_EXTENSIONS.has(path.extname(filePath));

async function listSourceFiles(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...(await listSourceFiles(fullPath)));
            continue;
        }
        if (!entry.isFile()) continue;
        if (!isSourceFile(fullPath)) continue;
        if (path.normalize(fullPath) === EXCLUDE_FILE) continue;
        files.push(fullPath);
    }

    return files;
}

function splitTopLevelComma(content) {
    let depth = 0;
    for (let i = 0; i < content.length; i += 1) {
        const ch = content[i];
        if (ch === '(') depth += 1;
        if (ch === ')') depth -= 1;
        if (ch === ',' && depth === 0) {
            return [content.slice(0, i), content.slice(i + 1)];
        }
    }
    return [content, ''];
}

function parseVarCalls(line) {
    const calls = [];
    let start = line.indexOf('var(');

    while (start !== -1) {
        let depth = 0;
        let end = -1;
        for (let i = start; i < line.length; i += 1) {
            const ch = line[i];
            if (ch === '(') depth += 1;
            if (ch === ')') {
                depth -= 1;
                if (depth === 0) {
                    end = i;
                    break;
                }
            }
        }

        if (end === -1) break;

        const inner = line.slice(start + 4, end);
        const [tokenRaw, fallbackRaw] = splitTopLevelComma(inner);
        const token = tokenRaw.trim();
        const fallback = fallbackRaw.trim();

        calls.push({ start, end: end + 1, token, fallback });
        start = line.indexOf('var(', end + 1);
    }

    return calls;
}

function parseTokenColorCalls(line) {
    const calls = [];
    const re = /tokenColor\(\s*(['"`])(--[^'"`]+)\1\s*,\s*(['"`])([^'"`]+)\3\s*\)/g;

    for (const match of line.matchAll(re)) {
        const full = match[0];
        const token = match[2];
        const fallback = match[4];
        const start = match.index ?? 0;
        const end = start + full.length;
        calls.push({ start, end, token, fallback });
    }

    return calls;
}

function collectLiteralMatches(text, offset = 0) {
    const matches = [];
    for (const re of [HEX_RE, FUNC_RE]) {
        re.lastIndex = 0;
        for (const match of text.matchAll(re)) {
            if (!match[0]) continue;
            const value = match[0];
            matches.push({
                value,
                start: offset + (match.index ?? 0),
                end: offset + (match.index ?? 0) + value.length,
            });
        }
    }
    return matches.sort((a, b) => a.start - b.start);
}

function addUsage(map, key, usage) {
    if (!map.has(key)) map.set(key, new Set());
    map.get(key).add(usage);
}

function makeFileUsage(filePath, lineNumber) {
    return `${toPosix(path.relative(ROOT, filePath))}:${lineNumber}`;
}

function valueSort(a, b) {
    return a.localeCompare(b, undefined, { sensitivity: 'base' });
}

function mapToSortedArray(map, mapper) {
    return [...map.entries()]
        .map(([key, usages]) => mapper(key, [...usages].sort(valueSort)))
        .sort((a, b) => {
            if ('token' in a && 'token' in b && a.token !== b.token) return valueSort(a.token, b.token);
            return valueSort(a.value ?? a.token, b.value ?? b.token);
        });
}

async function main() {
    const sourceFiles = await listSourceFiles(SRC_DIR);

    const missingVarUsages = new Map();
    const literalColorUsages = new Map();
    const tokenizedFallbackUsages = new Map();

    for (const filePath of sourceFiles) {
        const content = await readFile(filePath, 'utf8');
        const lines = content.split(/\r?\n/);

        lines.forEach((line, index) => {
            const lineNumber = index + 1;
            const usage = makeFileUsage(filePath, lineNumber);
            const varCalls = parseVarCalls(line);
            const tokenHelperCalls = parseTokenColorCalls(line);
            const tokenLikeCalls = [...varCalls, ...tokenHelperCalls];

            for (const call of tokenLikeCalls) {
                if (call.token.startsWith('--') && !isPaletteToken(call.token) && isColorLikeToken(call.token)) {
                    addUsage(missingVarUsages, call.token, usage);
                }

                if (!call.fallback) continue;
                const fallbackLiterals = collectLiteralMatches(call.fallback);
                for (const lit of fallbackLiterals) {
                    if (lit.value.includes('${') || lit.value.includes('var(')) continue;
                    const key = `${call.token}|||${lit.value}`;
                    addUsage(tokenizedFallbackUsages, key, usage);
                }
            }

            const literals = collectLiteralMatches(line);
            for (const lit of literals) {
                const inVarCall = tokenLikeCalls.some((call) => lit.start >= call.start && lit.end <= call.end);
                if (inVarCall) continue;
                if (lit.value.includes('${') || lit.value.includes('var(')) continue;
                addUsage(literalColorUsages, lit.value, usage);
            }
        });
    }

    const missingVars = mapToSortedArray(missingVarUsages, (token, usedIn) => ({ token, usedIn }));
    const literalColors = mapToSortedArray(literalColorUsages, (value, usedIn) => ({ value, usedIn }));
    const tokenizedFallbackColors = mapToSortedArray(tokenizedFallbackUsages, (key, usedIn) => {
        const [token, value] = key.split('|||');
        return { token, value, usedIn };
    });

    const generated = `export type DiscoveredVarColor = {
  token: string;
  usedIn: string[];
};

export type DiscoveredLiteralColor = {
  value: string;
  usedIn: string[];
};

export type DiscoveredTokenizedFallbackColor = {
  token: string;
  value: string;
  usedIn: string[];
};

export const DISCOVERED_MISSING_VAR_COLORS: DiscoveredVarColor[] = ${JSON.stringify(missingVars, null, 2)};

export const DISCOVERED_LITERAL_COLORS: DiscoveredLiteralColor[] = ${JSON.stringify(literalColors, null, 2)};

export const DISCOVERED_TOKENIZED_FALLBACK_COLORS: DiscoveredTokenizedFallbackColor[] = ${JSON.stringify(tokenizedFallbackColors, null, 2)};
`;

    await writeFile(OUTPUT_FILE, generated);
    console.log(`Updated ${toPosix(path.relative(ROOT, OUTPUT_FILE))}`);
    console.log(`Missing vars: ${missingVars.length}`);
    console.log(`Literal colors (non-tokenized): ${literalColors.length}`);
    console.log(`Tokenized fallback literals: ${tokenizedFallbackColors.length}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
