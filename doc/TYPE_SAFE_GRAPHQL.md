# Type-Safe GraphQL Setup Guide

This guide explains how we've set up fully type-safe GraphQL operations in this project.

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│  src/graphql/*.graphql                      │
│  (GraphQL operations definitions)           │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│  pnpm codegen                               │
│  (GraphQL Code Generator)                   │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│  src/generated/graphql.ts                   │
│  (Auto-generated TypeScript types)          │
│  - Query types                              │
│  - Mutation types                           │
│  - Typed Document nodes                     │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│  src/hooks/useStaffTypeSafe.ts              │
│  (Type-safe custom hooks)                   │
│  - useGetAllStaff()                         │
│  - useCreateStaff()                         │
│  - etc...                                   │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│  src/pages/Staff.tsx                        │
│  (React components with full type safety)   │
│  - Types from generated/graphql.ts          │
│  - Typed hooks                              │
│  - IDE autocomplete & error checking        │
└─────────────────────────────────────────────┘
```

## Step-by-Step Setup

### 1. Define GraphQL Operations

Create `.graphql` files in `src/graphql/`:

```graphql
# src/graphql/staff.graphql
query GetAllStaff {
  staff {
    id
    name
  }
}

query GetStaffById($id: uuid!) {
  staff_by_pk(id: $id) {
    id
    name
  }
}

mutation CreateStaff($name: String!) {
  insert_staff_one(object: { name: $name }) {
    id
    name
  }
}
```

### 2. Generate Types

```bash
pnpm codegen
```

This generates:

- `src/generated/graphql.ts` - Type definitions
- `src/generated/gql.ts` - Helper functions
- `src/generated/index.ts` - Exports

### 3. Create Type-Safe Hooks

```typescript
// src/hooks/useStaffTypeSafe.ts
import { useQuery, useMutation } from 'graphql-hooks';
import {
  GetAllStaffDocument,
  CreateStaffDocument,
} from '../generated/graphql';
import type {
  GetAllStaffQuery,
  CreateStaffMutation,
} from '../generated/graphql';

export const useGetAllStaff = () => {
  // ✅ Fully typed - TypeScript knows the return type
  return useQuery<GetAllStaffQuery>(GetAllStaffDocument);
};

export const useCreateStaff = () => {
  const [mutate, state] = useMutation<CreateStaffMutation>(
    CreateStaffDocument,
  );

  return [mutate, state];
};
```

### 4. Use in Components with Type Safety

```typescript
// src/pages/Staff.tsx
import { useGetAllStaff, useCreateStaff } from '../hooks/useStaffTypeSafe';

export function Staff() {
  const { loading, error, data } = useGetAllStaff();
  const [createStaff] = useCreateStaff();

  // ✅ TypeScript knows `data.staff` exists and has correct shape
  // ✅ IDE provides autocomplete
  // ✅ Compile errors if you try to access wrong fields

  return (
    <div>
      {data?.staff.map(member => (
        <div key={member.id}>{member.name}</div>
      ))}
    </div>
  );
}
```

## Type Safety Benefits

### ✅ Autocomplete in IDE

When you type `data?.staff.`, your editor shows all available fields:

- `id`
- `name`
- Other fields from your schema

### ✅ Compile-Time Error Checking

```typescript
// ❌ ERROR - Field doesn't exist
const dept = data?.staff[0].dept; // TypeScript error!

// ✅ OK - Field exists
const name = data?.staff[0].name;
```

### ✅ Type-Safe Variables

```typescript
// The hook knows what variables are required
const [createStaff] = useCreateStaff();

// ✅ Correct - all required variables provided
await createStaff({ variables: { name: 'John' } });

// ❌ ERROR - missing required variable 'name'
await createStaff({ variables: {} });
```

### ✅ Mutation Response Types

```typescript
const [createStaff] = useCreateStaff();

const result = await createStaff({
  variables: { name: 'John' },
});

// ✅ TypeScript knows what's in result
if (result.data?.insert_staff_one) {
  const staffId = result.data.insert_staff_one.id;
  console.log('Created staff:', staffId);
}
```

## Generated Files Structure

### graphql.ts (Main Types File)

Contains:

- Scalar types (uuid, String, Int, etc.)
- Query response types (GetAllStaffQuery, GetStaffByIdQuery)
- Mutation input/output types (CreateStaffMutation)
- Subscription types
- Typed DocumentNode objects

Example:

```typescript
// Generated
export type GetAllStaffQuery = {
  staff: Array<{
    id: string;
    name: string;
  }>;
};

export const GetAllStaffDocument: TypedDocumentNode<GetAllStaffQuery> = ...;
```

### gql.ts (Helper Functions)

Provides a `gql` function for creating typed documents:

```typescript
import { gql } from '../generated';

const GetAllStaffQuery = gql(`
  query GetAllStaff {
    staff { id name }
  }
`);
```

## Workflow

1. **Define operations** in `.graphql` files
2. **Run codegen** - generates types automatically
3. **Create hooks** - import typed documents from generated
4. **Use in components** - full type safety and autocomplete

Whenever you add/modify GraphQL operations:

```bash
pnpm codegen  # Regenerate types
```

## Common Patterns

### Type-Safe Query with Variables

```typescript
export const useGetStaffById = (staffId: string | null) => {
  return useQuery<GetStaffByIdQuery>(GetStaffByIdDocument, {
    variables: { id: staffId },
    skip: !staffId,
  });
};
```

### Type-Safe Mutation with Refetch

```typescript
export const useCreateStaff = () => {
  const client = useQueryClient();
  const [mutate, state] = useMutation<CreateStaffMutation>(
    CreateStaffDocument,
  );

  const wrappedMutate = async (options: any) => {
    const result = await mutate({
      ...options,
      onSuccess: () => {
        // Refetch list with type-safe document
        client.invalidateQuery(GetAllStaffDocument);
      },
    });
    return result;
  };

  return [wrappedMutate, state];
};
```

### Component with Type Safety

```typescript
export function Staff() {
  const { loading, error, data } = useGetAllStaff();

  if (loading) return <Loader />;
  if (error) return <Alert color="red">{error.message}</Alert>;

  // ✅ data.staff is typed - no need for type assertion
  return (
    <Table>
      <Table.Tbody>
        {data?.staff.map(member => (
          <Table.Tr key={member.id}>
            <Table.Td>{member.name}</Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}
```

## Advantages Over String-Based Queries

| Feature                | String Queries           | Type-Safe Queries      |
| ---------------------- | ------------------------ | ---------------------- |
| IDE Autocomplete       | ❌ No                    | ✅ Yes                 |
| Variable Type Checking | ❌ No                    | ✅ Yes                 |
| Response Type Checking | ❌ No                    | ✅ Yes                 |
| Catch Typos            | ❌ Runtime errors        | ✅ Compile-time errors |
| Refactoring Safe       | ❌ Manual updates needed | ✅ Automatic updates   |
| Schema Changes         | ❌ No warnings           | ✅ Compiler errors     |

## Configuration Files

- **[codegen.ts](../../codegen.ts)** - Code generator configuration
- **[.graphqlconfig](../../.graphqlconfig)** - GraphQL IDE configuration
- **[tsconfig.app.json](../../tsconfig.app.json)** - TypeScript excludes generated folder from checks

## Next Steps

1. ✅ Convert all your GraphQL operations to type-safe hooks
2. ✅ Update components to use type-safe hooks
3. ✅ Remove old string-based query hooks
4. ✅ Run `pnpm build` to ensure everything compiles

## Resources

- [GraphQL Code Generator Docs](https://the-guild.dev/graphql/codegen)
- [graphql-hooks Documentation](https://www.npmjs.com/package/graphql-hooks)
- [TypeScript with GraphQL](https://the-guild.dev/graphql/codegen/docs/guides/typescript)
