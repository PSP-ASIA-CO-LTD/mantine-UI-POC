import {
  useQuery,
  useMutation,
  useQueryClient,
  GraphQLClient,
} from 'graphql-hooks';
import {
  Button,
  Container,
  Table,
  Loader,
  Alert,
  Stack,
} from '@mantine/core';
import { useState } from 'react';

/**
 * Example Component demonstrating graphql-hooks usage
 * This shows how to query and mutate data using graphql-hooks
 */

// Define your GraphQL queries and mutations
const GET_SALES_ORDERS_QUERY = `
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

const CREATE_SALES_ORDER_MUTATION = `
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

export function SalesOrdersExample() {
  const client: GraphQLClient = useQueryClient() as GraphQLClient;
  const [newOrder, setNewOrder] = useState({
    orderNumber: '',
    customerName: '',
    totalAmount: 0,
  });

  // Fetch query - automatically fetches on mount and when dependencies change
  const { loading, error, data, refetch } = useQuery(
    GET_SALES_ORDERS_QUERY,
  );

  // Mutation hook - returns [mutationFn, state, resetFn]
  const [
    createOrder,
    { loading: mutationLoading, error: mutationError },
  ] = useMutation(CREATE_SALES_ORDER_MUTATION);

  const handleCreateOrder = async () => {
    try {
      const result = await createOrder({
        variables: {
          order_number: newOrder.orderNumber,
          customer_name: newOrder.customerName,
          total_amount: parseFloat(
            newOrder.totalAmount as unknown as string,
          ),
        },
        onSuccess: () => {
          // Invalidate cache and refetch
          client.invalidateQuery(GET_SALES_ORDERS_QUERY);
          setNewOrder({
            orderNumber: '',
            customerName: '',
            totalAmount: 0,
          });
        },
      });

      if (result.error) {
        console.error('Mutation error:', result.error);
      }
    } catch (err) {
      console.error('Error creating order:', err);
    }
  };

  if (loading) {
    return (
      <Container>
        <Loader />
      </Container>
    );
  }

  if (error) {
    return (
      <Alert color="red" title="Error">
        Failed to load sales orders:{' '}
        {error.fetchError?.message || 'Unknown error'}
      </Alert>
    );
  }

  return (
    <Container>
      <Stack gap="md">
        <div>
          <h2>Sales Orders</h2>

          {data?.sales_orders && data.sales_orders.length > 0 ? (
            <Table striped>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Order Number</Table.Th>
                  <Table.Th>Customer</Table.Th>
                  <Table.Th>Amount</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Created</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {data.sales_orders.map((order: any) => (
                  <Table.Tr key={order.id}>
                    <Table.Td>{order.order_number}</Table.Td>
                    <Table.Td>{order.customer_name}</Table.Td>
                    <Table.Td>${order.total_amount}</Table.Td>
                    <Table.Td>{order.status}</Table.Td>
                    <Table.Td>
                      {new Date(
                        order.created_at,
                      ).toLocaleDateString()}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          ) : (
            <Alert>No sales orders found</Alert>
          )}

          <Button mt="md" onClick={() => refetch()}>
            Refresh Data
          </Button>
        </div>

        <div>
          <h3>Create New Order</h3>
          {mutationError && (
            <Alert color="red" mb="md">
              Error creating order:{' '}
              {mutationError.fetchError?.message}
            </Alert>
          )}

          <Stack gap="md">
            <input
              type="text"
              placeholder="Order Number"
              value={newOrder.orderNumber}
              onChange={(e) =>
                setNewOrder({
                  ...newOrder,
                  orderNumber: e.target.value,
                })
              }
            />
            <input
              type="text"
              placeholder="Customer Name"
              value={newOrder.customerName}
              onChange={(e) =>
                setNewOrder({
                  ...newOrder,
                  customerName: e.target.value,
                })
              }
            />
            <input
              type="number"
              placeholder="Total Amount"
              value={newOrder.totalAmount}
              onChange={(e) =>
                setNewOrder({
                  ...newOrder,
                  totalAmount: e.target.value as unknown as number,
                })
              }
            />

            <Button
              onClick={handleCreateOrder}
              loading={mutationLoading}
              disabled={
                !newOrder.orderNumber || !newOrder.customerName
              }
            >
              Create Order
            </Button>
          </Stack>
        </div>
      </Stack>
    </Container>
  );
}
