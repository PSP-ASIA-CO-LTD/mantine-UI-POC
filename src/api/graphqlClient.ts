import { GraphQLClient } from 'graphql-hooks';
import memCache from 'graphql-hooks-memcache';

const HASURA_GRAPHQL_ENDPOINT =
  import.meta.env.VITE_HASURA_GRAPHQL_ENDPOINT ||
  'https://feasible-amoeba-37.hasura.app/v1/graphql';
const HASURA_ADMIN_SECRET =
  import.meta.env.VITE_HASURA_ADMIN_SECRET ||
  'zHwOFBAMLrYqIN6UcV57Cg7t4HtnB5kUFoszMmqYCuP4n4wfH0GzKpZ8k1gs3yL7';

// Create GraphQL client with Hasura configuration
export const graphqlClient = new GraphQLClient({
  url: HASURA_GRAPHQL_ENDPOINT,
  cache: memCache(),
  headers: {
    'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
    'Content-Type': 'application/json',
  },
  logErrors: true,
});
