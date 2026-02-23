import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const isWatchMode = process.argv.includes('--watch');
const rootDir = process.cwd();
const sourceFile = resolve(rootDir, 'src/styles/app.scss');
const outputDir = resolve(rootDir, 'public/bootswatch/quartz');
const expandedOutput = resolve(outputDir, 'bootstrap.css');
const minifiedOutput = resolve(outputDir, 'bootstrap.min.css');

mkdirSync(outputDir, { recursive: true });

const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const charsetPrefix = '@charset "UTF-8";';

const normalizeCssOutput = (outputFile) => {
  let css = readFileSync(outputFile, 'utf8');
  css = css.replace(/^\uFEFF/, '');

  if (!css.startsWith(charsetPrefix)) {
    css = `${charsetPrefix}${css.startsWith('/*!') ? '' : '\n'}${css}`;
  }

  writeFileSync(outputFile, css);
};

const runSassOnce = (style, input, output) => {
  const result = spawnSync(
    npxCmd,
    ['sass', `--style=${style}`, '--source-map', '--no-error-css', '--load-path=node_modules', `${input}:${output}`],
    { stdio: 'inherit' },
  );

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

if (!isWatchMode) {
  runSassOnce('expanded', sourceFile, expandedOutput);
  runSassOnce('compressed', sourceFile, minifiedOutput);
  normalizeCssOutput(expandedOutput);
  normalizeCssOutput(minifiedOutput);
  console.log(`[styles] built ${expandedOutput}`);
  console.log(`[styles] built ${minifiedOutput}`);
  process.exit(0);
}

const watchProcesses = [
  spawn(
    npxCmd,
    ['sass', '--watch', '--style=expanded', '--source-map', '--no-error-css', '--load-path=node_modules', `${sourceFile}:${expandedOutput}`],
    { stdio: 'inherit' },
  ),
  spawn(
    npxCmd,
    ['sass', '--watch', '--style=compressed', '--source-map', '--no-error-css', '--load-path=node_modules', `${sourceFile}:${minifiedOutput}`],
    { stdio: 'inherit' },
  ),
];

const stopWatchers = () => {
  for (const processHandle of watchProcesses) {
    if (!processHandle.killed) {
      processHandle.kill('SIGTERM');
    }
  }
};

process.on('SIGINT', () => {
  stopWatchers();
  process.exit(0);
});

process.on('SIGTERM', () => {
  stopWatchers();
  process.exit(0);
});

for (const processHandle of watchProcesses) {
  processHandle.on('exit', (code) => {
    if (code && code !== 0) {
      stopWatchers();
      process.exit(code);
    }
  });
}
