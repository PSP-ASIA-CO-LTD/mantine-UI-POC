import { spawnSync } from 'node:child_process';

const secret = process.env.VITE_HASURA_ADMIN_SECRET;

if (!secret) {
  console.log('Skipping graphql-codegen: VITE_HASURA_ADMIN_SECRET is not set.');
  process.exit(0);
}

const result = spawnSync('graphql-codegen', {
  stdio: 'inherit',
  shell: true,
});

process.exit(result.status ?? 1);
