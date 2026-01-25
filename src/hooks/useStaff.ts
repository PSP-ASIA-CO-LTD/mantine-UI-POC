import { useQuery, useMutation, useQueryClient } from 'graphql-hooks';
import type { UseClientRequestResult } from 'graphql-hooks';
import {
  GetAllStaffDocument,
  GetStaffByIdDocument,
  CreateStaffDocument,
  UpdateStaffDocument,
  DeleteStaffDocument,
} from '../generated/graphql';
import type {
  GetAllStaffQuery,
  GetStaffByIdQuery,
  CreateStaffMutation,
  UpdateStaffMutation,
  DeleteStaffMutation,
} from '../generated/graphql';

interface MutationOptions {
  variables?: Record<string, unknown>;
  onSuccess?: () => void;
}

/**
 * Fetch all staff members (Type-Safe)
 * @returns Query state with fully typed staff data
 */
export const useGetAllStaff = () => {
  return useQuery<GetAllStaffQuery>(
    GetAllStaffDocument as unknown as string,
  );
};

/**
 * Fetch a single staff member by ID (Type-Safe)
 * @param staffId - The UUID of the staff member
 * @returns Query state with fully typed staff data
 */
export const useGetStaffById = (staffId: string | null) => {
  return useQuery<GetStaffByIdQuery>(
    GetStaffByIdDocument as unknown as string,
    {
      variables: { id: staffId },
      skip: !staffId,
    },
  );
};

/**
 * Create a new staff member (Type-Safe)
 * @returns Mutation function and state with typed inputs and outputs
 *
 * Usage:
 * const [createStaff, { loading, error }] = useCreateStaff();
 * await createStaff({
 *   variables: { name: 'John Doe' }
 * });
 */
export const useCreateStaff = (): [
  (
    options: MutationOptions,
  ) => Promise<UseClientRequestResult<CreateStaffMutation, object>>,
  UseClientRequestResult<CreateStaffMutation, object>,
] => {
  const client = useQueryClient();

  const [mutate, state] = useMutation<CreateStaffMutation>(
    CreateStaffDocument as unknown as string,
  );

  const wrappedMutate = async (options: MutationOptions) => {
    const result = await mutate({
      ...options,
      onSuccess: () => {
        client?.invalidateQuery(
          GetAllStaffDocument as unknown as string,
        );
        options.onSuccess?.();
      },
    });
    return result;
  };

  return [wrappedMutate, state] as [
    (
      options: MutationOptions,
    ) => Promise<UseClientRequestResult<CreateStaffMutation, object>>,
    UseClientRequestResult<CreateStaffMutation, object>,
  ];
};

/**
 * Update an existing staff member (Type-Safe)
 * @returns Mutation function and state with typed inputs and outputs
 *
 * Usage:
 * const [updateStaff, { loading }] = useUpdateStaff();
 * await updateStaff({
 *   variables: {
 *     id: 'staff-uuid',
 *     name: 'Jane Doe'
 *   }
 * });
 */
export const useUpdateStaff = (): [
  (
    options: MutationOptions,
  ) => Promise<UseClientRequestResult<UpdateStaffMutation, object>>,
  UseClientRequestResult<UpdateStaffMutation, object>,
] => {
  const client = useQueryClient();

  const [mutate, state] = useMutation<UpdateStaffMutation>(
    UpdateStaffDocument as unknown as string,
  );

  const wrappedMutate = async (options: MutationOptions) => {
    const result = await mutate({
      ...options,
      onSuccess: () => {
        client?.invalidateQuery(
          GetAllStaffDocument as unknown as string,
        );
        options.onSuccess?.();
      },
    });
    return result;
  };

  return [wrappedMutate, state] as [
    (
      options: MutationOptions,
    ) => Promise<UseClientRequestResult<UpdateStaffMutation, object>>,
    UseClientRequestResult<UpdateStaffMutation, object>,
  ];
};

/**
 * Delete a staff member (Type-Safe)
 * @returns Mutation function and state with typed inputs
 *
 * Usage:
 * const [deleteStaff, { loading }] = useDeleteStaff();
 * await deleteStaff({
 *   variables: { id: 'staff-uuid' }
 * });
 */
export const useDeleteStaff = (): [
  (
    options: MutationOptions,
  ) => Promise<UseClientRequestResult<DeleteStaffMutation, object>>,
  UseClientRequestResult<DeleteStaffMutation, object>,
] => {
  const client = useQueryClient();

  const [mutate, state] = useMutation<DeleteStaffMutation>(
    DeleteStaffDocument as unknown as string,
  );

  const wrappedMutate = async (options: MutationOptions) => {
    const result = await mutate({
      ...options,
      onSuccess: () => {
        client?.invalidateQuery(
          GetAllStaffDocument as unknown as string,
        );
        options.onSuccess?.();
      },
    });
    return result;
  };

  return [wrappedMutate, state] as [
    (
      options: MutationOptions,
    ) => Promise<UseClientRequestResult<DeleteStaffMutation, object>>,
    UseClientRequestResult<DeleteStaffMutation, object>,
  ];
};
