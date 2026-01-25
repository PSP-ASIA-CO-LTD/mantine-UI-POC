import { useQuery, useMutation, useManualQuery } from 'graphql-hooks';

/**
 * Example: Query Hook for fetching data from Hasura
 *
 * Usage in component:
 * const { loading, data, error } = useSalesOrders();
 *
 * Properties in return:
 * - loading: Boolean indicating if data is being fetched
 * - data: The GraphQL response data
 * - error: Error object if something went wrong
 * - refetch: Function to manually refetch the query
 * - cacheHit: Boolean indicating if data came from cache
 */
export const useSalesOrders = () => {
  const query = `
    query GetSalesOrders {
      sales_orders {
        id
        order_number
        customer_name
        total_amount
        status
        created_at
      }
    }
  `;

  return useQuery(query);
};

/**
 * Example: Manual Query Hook for on-demand data fetching
 *
 * Usage in component:
 * const [fetchUser, { loading, data, error }] = useFetchUserManual();
 *
 * Then call fetchUser({ variables: { id: userId } })
 */
export const useFetchUserManual = () => {
  const query = `
    query GetUser($id: Int!) {
      users_by_pk(id: $id) {
        id
        name
        email
      }
    }
  `;

  return useManualQuery(query);
};

/**
 * Example: Mutation Hook for creating data
 *
 * Usage in component:
 * const [createSalesOrder, { loading, data, error }] = useCreateSalesOrder();
 * await createSalesOrder({
 *   variables: {
 *     order_number: 'SO-001',
 *     customer_name: 'John Doe',
 *     total_amount: 1000
 *   },
 *   onSuccess: (result) => {
 *     console.log('Created:', result);
 *   }
 * });
 */
export const useCreateSalesOrder = () => {
  const mutation = `
    mutation CreateSalesOrder($order_number: String!, $customer_name: String!, $total_amount: Float!) {
      insert_sales_orders_one(object: {
        order_number: $order_number
        customer_name: $customer_name
        total_amount: $total_amount
        status: "pending"
      }) {
        id
        order_number
        customer_name
        total_amount
        created_at
      }
    }
  `;

  return useMutation(mutation);
};

/**
 * Example: Mutation Hook for updating data
 *
 * Usage in component:
 * const [updateSalesOrder, { loading }] = useUpdateSalesOrder();
 * await updateSalesOrder({
 *   variables: { id: 1, status: 'completed' }
 * });
 */
export const useUpdateSalesOrder = () => {
  const mutation = `
    mutation UpdateSalesOrder($id: Int!, $status: String!) {
      update_sales_orders_by_pk(pk_columns: {id: $id}, _set: {status: $status}) {
        id
        status
        updated_at
      }
    }
  `;

  return useMutation(mutation);
};

/**
 * Example: Mutation Hook for deleting data
 *
 * Usage in component:
 * const [deleteSalesOrder, { loading }] = useDeleteSalesOrder();
 * await deleteSalesOrder({ variables: { id: 1 } });
 */
export const useDeleteSalesOrder = () => {
  const mutation = `
    mutation DeleteSalesOrder($id: Int!) {
      delete_sales_orders_by_pk(id: $id) {
        id
      }
    }
  `;

  return useMutation(mutation);
};
