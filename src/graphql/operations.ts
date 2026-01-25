export const GET_SALES_ORDERS = `
  query GetSalesOrders {
    sales_orders {
      id
      order_number
      customer_name
      total_amount
      status
      created_at
      updated_at
    }
  }
`;

export const GET_SALES_ORDER_BY_ID = `
  query GetSalesOrderById($id: Int!) {
    sales_orders_by_pk(id: $id) {
      id
      order_number
      customer_name
      total_amount
      status
      created_at
      updated_at
    }
  }
`;

export const CREATE_SALES_ORDER = `
  mutation CreateSalesOrder(
    $order_number: String!
    $customer_name: String!
    $total_amount: Float!
  ) {
    insert_sales_orders_one(
      object: {
        order_number: $order_number
        customer_name: $customer_name
        total_amount: $total_amount
        status: "pending"
      }
    ) {
      id
      order_number
      customer_name
      total_amount
      status
      created_at
    }
  }
`;

export const UPDATE_SALES_ORDER = `
  mutation UpdateSalesOrder($id: Int!, $status: String!) {
    update_sales_orders_by_pk(pk_columns: { id: $id }, _set: { status: $status }) {
      id
      status
      updated_at
    }
  }
`;

export const DELETE_SALES_ORDER = `
  mutation DeleteSalesOrder($id: Int!) {
    delete_sales_orders_by_pk(id: $id) {
      id
    }
  }
`;
