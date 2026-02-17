import type { CodegenConfig } from '@graphql-codegen/cli';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const HASURA_ENDPOINT =
  process.env.VITE_HASURA_GRAPHQL_ENDPOINT ||
  'https://feasible-amoeba-37.hasura.app/v1/graphql';
const HASURA_SECRET = process.env.VITE_HASURA_ADMIN_SECRET || '';

const config: CodegenConfig = {
  schema: {
    [HASURA_ENDPOINT]: {
      headers: {
        'x-hasura-admin-secret': HASURA_SECRET,
      },
    },
  },
  documents: ['src/graphql/**/*.graphql'],
  generates: {
    './src/generated/': {
      preset: 'client',
      plugins: [],
      presetConfig: {
        fragmentMasking: false,
      },
    },
  },
};

export default config;
