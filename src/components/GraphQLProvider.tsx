import type { FC, ReactNode } from 'react';
import { ClientContext } from 'graphql-hooks';
import { graphqlClient } from '../api/graphqlClient';

interface GraphQLProviderProps {
  children: ReactNode;
}

/**
 * GraphQL Provider Component
 * Wraps your app with GraphQL Client context for hooks-based queries
 */
export const GraphQLProvider: FC<GraphQLProviderProps> = ({
  children,
}) => {
  return (
    <ClientContext.Provider value={graphqlClient}>
      {children}
    </ClientContext.Provider>
  );
};
