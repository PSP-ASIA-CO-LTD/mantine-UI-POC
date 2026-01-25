/**
 * TypeScript types for GraphQL operations
 * Use these for type-safe GraphQL queries and mutations
 */

// Sales Order Types
export interface SalesOrder {
  id: number;
  order_number: string;
  customer_name: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  created_at: string;
  updated_at?: string;
}

export interface GetSalesOrdersResponse {
  sales_orders: SalesOrder[];
}

export interface CreateSalesOrderVariables {
  order_number: string;
  customer_name: string;
  total_amount: number;
}

export interface CreateSalesOrderResponse {
  insert_sales_orders_one: SalesOrder;
}

export interface UpdateSalesOrderVariables {
  id: number;
  status: string;
}

export interface UpdateSalesOrderResponse {
  update_sales_orders_by_pk: SalesOrder;
}

export interface DeleteSalesOrderVariables {
  id: number;
}

export interface DeleteSalesOrderResponse {
  delete_sales_orders_by_pk: {
    id: number;
  };
}

// User Types
export interface User {
  id: number;
  name: string;
  email: string;
  created_at?: string;
}

export interface GetUsersResponse {
  users: User[];
}

export interface GetUserByIdResponse {
  users_by_pk: User;
}

// Generic GraphQL Error Type
export interface GraphQLError {
  message: string;
  extensions?: {
    code?: string;
    path?: string[];
    [key: string]: any;
  };
}

export interface UseQueryError {
  fetchError?: Error;
  httpError?: {
    status: number;
    statusText: string;
    body: string;
  };
  graphQLErrors?: GraphQLError[];
  message?: string;
}
