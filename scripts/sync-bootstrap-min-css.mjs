import { copyFileSync, watch } from 'node:fs';
import { resolve } from 'node:path';

const source = resolve(process.cwd(), 'src/styles/vendor/bootswatch-quartz-bootstrap.min.css');
const target = resolve(process.cwd(), 'public/bootstrap.min.css');
const isWatchMode = process.argv.includes('--watch');

const sync = () => {
    copyFileSync(source, target);
    console.log(`[styles] synced ${source} -> ${target}`);
};

sync();

if (isWatchMode) {
    watch(source, { persistent: true }, () => {
        sync();
    });
}
