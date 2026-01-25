# GraphQL Schema Reference

This document provides a comprehensive overview of all available GraphQL queries, mutations, and subscriptions in your Hasura API.

## Query Operations (Read-Only)

Available query fields in `query_root`:

- **additional_services** - Fetch data from the table "additional_services"
- **additional_services_aggregate** - Fetch aggregated fields from the table "additional_services"
- **additional_services_by_pk** - Fetch data from the table "additional_services" using primary key columns
- **assignments** - Fetch data from the table "assignments"
- **assignments_aggregate** - Fetch aggregated fields from the table "assignments"
- **assignments_by_pk** - Fetch data from the table "assignments" using primary key columns
- **businesses** - Fetch data from the table "businesses"
- **businesses_aggregate** - Fetch aggregated fields from the table "businesses"
- **businesses_by_pk** - Fetch data from the table "businesses" using primary key columns
- **contracts** - Fetch data from the table "contracts"
- **contracts_aggregate** - Fetch aggregated fields from the table "contracts"
- **contracts_by_pk** - Fetch data from the table "contracts" using primary key columns
- **guardians** - Fetch data from the table "guardians"
- **guardians_aggregate** - Fetch aggregated fields from the table "guardians"
- **guardians_by_pk** - Fetch data from the table "guardians" using primary key columns
- **invoices** - Fetch data from the table "invoices"
- **invoices_aggregate** - Fetch aggregated fields from the table "invoices"
- **invoices_by_pk** - Fetch data from the table "invoices" using primary key columns
- **notifications** - Fetch data from the table "notifications"
- **notifications_aggregate** - Fetch aggregated fields from the table "notifications"
- **notifications_by_pk** - Fetch data from the table "notifications" using primary key columns
- **operation_tasks** - Fetch data from the table "operation_tasks"
- **operation_tasks_aggregate** - Fetch aggregated fields from the table "operation_tasks"
- **operation_tasks_by_pk** - Fetch data from the table "operation_tasks" using primary key columns
- **packages** - Fetch data from the table "packages"
- **packages_aggregate** - Fetch aggregated fields from the table "packages"
- **packages_by_pk** - Fetch data from the table "packages" using primary key columns
- **residents** - Fetch data from the table "residents"
- **residents_aggregate** - Fetch aggregated fields from the table "residents"
- **residents_by_pk** - Fetch data from the table "residents" using primary key columns
- **rooms** - Fetch data from the table "rooms"
- **rooms_aggregate** - Fetch aggregated fields from the table "rooms"
- **rooms_by_pk** - Fetch data from the table "rooms" using primary key columns
- **sales_orders** - Fetch data from the table "sales_orders"
- **sales_orders_aggregate** - Fetch aggregated fields from the table "sales_orders"
- **sales_orders_by_pk** - Fetch data from the table "sales_orders" using primary key columns
- **staff** - Fetch data from the table "staff"
- **staff_aggregate** - Fetch aggregated fields from the table "staff"
- **staff_by_pk** - Fetch data from the table "staff" using primary key columns
- **staff_shifts** - Fetch data from the table "staff_shifts"
- **staff_shifts_aggregate** - Fetch aggregated fields from the table "staff_shifts"
- **staff_shifts_by_pk** - Fetch data from the table "staff_shifts" using primary key columns
- **teams** - Fetch data from the table "teams"
- **teams_aggregate** - Fetch aggregated fields from the table "teams"
- **teams_by_pk** - Fetch data from the table "teams" using primary key columns

## Mutation Operations (Write)

Available mutation fields in `mutation_root`:

### Insert Operations (Create)

- **insert_additional_services** - Insert records into "additional_services"
- **insert_additional_services_one** - Insert a single record into "additional_services"
- **insert_assignments** - Insert records into "assignments"
- **insert_assignments_one** - Insert a single record into "assignments"
- **insert_businesses** - Insert records into "businesses"
- **insert_businesses_one** - Insert a single record into "businesses"
- **insert_contracts** - Insert records into "contracts"
- **insert_contracts_one** - Insert a single record into "contracts"
- **insert_guardians** - Insert records into "guardians"
- **insert_guardians_one** - Insert a single record into "guardians"
- **insert_invoices** - Insert records into "invoices"
- **insert_invoices_one** - Insert a single record into "invoices"
- **insert_notifications** - Insert records into "notifications"
- **insert_notifications_one** - Insert a single record into "notifications"
- **insert_operation_tasks** - Insert records into "operation_tasks"
- **insert_operation_tasks_one** - Insert a single record into "operation_tasks"
- **insert_packages** - Insert records into "packages"
- **insert_packages_one** - Insert a single record into "packages"
- **insert_residents** - Insert records into "residents"
- **insert_residents_one** - Insert a single record into "residents"
- **insert_rooms** - Insert records into "rooms"
- **insert_rooms_one** - Insert a single record into "rooms"
- **insert_sales_orders** - Insert records into "sales_orders"
- **insert_sales_orders_one** - Insert a single record into "sales_orders"
- **insert_staff** - Insert records into "staff"
- **insert_staff_one** - Insert a single record into "staff"
- **insert_staff_shifts** - Insert records into "staff_shifts"
- **insert_staff_shifts_one** - Insert a single record into "staff_shifts"
- **insert_teams** - Insert records into "teams"
- **insert_teams_one** - Insert a single record into "teams"

### Update Operations (Modify)

- **update_additional_services** - Update records in "additional_services"
- **update_additional_services_by_pk** - Update a record in "additional_services" using primary key
- **update_assignments** - Update records in "assignments"
- **update_assignments_by_pk** - Update a record in "assignments" using primary key
- **update_businesses** - Update records in "businesses"
- **update_businesses_by_pk** - Update a record in "businesses" using primary key
- **update_contracts** - Update records in "contracts"
- **update_contracts_by_pk** - Update a record in "contracts" using primary key
- **update_guardians** - Update records in "guardians"
- **update_guardians_by_pk** - Update a record in "guardians" using primary key
- **update_invoices** - Update records in "invoices"
- **update_invoices_by_pk** - Update a record in "invoices" using primary key
- **update_notifications** - Update records in "notifications"
- **update_notifications_by_pk** - Update a record in "notifications" using primary key
- **update_operation_tasks** - Update records in "operation_tasks"
- **update_operation_tasks_by_pk** - Update a record in "operation_tasks" using primary key
- **update_packages** - Update records in "packages"
- **update_packages_by_pk** - Update a record in "packages" using primary key
- **update_residents** - Update records in "residents"
- **update_residents_by_pk** - Update a record in "residents" using primary key
- **update_rooms** - Update records in "rooms"
- **update_rooms_by_pk** - Update a record in "rooms" using primary key
- **update_sales_orders** - Update records in "sales_orders"
- **update_sales_orders_by_pk** - Update a record in "sales_orders" using primary key
- **update_staff** - Update records in "staff"
- **update_staff_by_pk** - Update a record in "staff" using primary key
- **update_staff_shifts** - Update records in "staff_shifts"
- **update_staff_shifts_by_pk** - Update a record in "staff_shifts" using primary key
- **update_teams** - Update records in "teams"
- **update_teams_by_pk** - Update a record in "teams" using primary key

### Delete Operations (Remove)

- **delete_additional_services** - Delete records from "additional_services"
- **delete_additional_services_by_pk** - Delete a record from "additional_services" using primary key
- **delete_assignments** - Delete records from "assignments"
- **delete_assignments_by_pk** - Delete a record from "assignments" using primary key
- **delete_businesses** - Delete records from "businesses"
- **delete_businesses_by_pk** - Delete a record from "businesses" using primary key
- **delete_contracts** - Delete records from "contracts"
- **delete_contracts_by_pk** - Delete a record from "contracts" using primary key
- **delete_guardians** - Delete records from "guardians"
- **delete_guardians_by_pk** - Delete a record from "guardians" using primary key
- **delete_invoices** - Delete records from "invoices"
- **delete_invoices_by_pk** - Delete a record from "invoices" using primary key
- **delete_notifications** - Delete records from "notifications"
- **delete_notifications_by_pk** - Delete a record from "notifications" using primary key
- **delete_operation_tasks** - Delete records from "operation_tasks"
- **delete_operation_tasks_by_pk** - Delete a record from "operation_tasks" using primary key
- **delete_packages** - Delete records from "packages"
- **delete_packages_by_pk** - Delete a record from "packages" using primary key
- **delete_residents** - Delete records from "residents"
- **delete_residents_by_pk** - Delete a record from "residents" using primary key
- **delete_rooms** - Delete records from "rooms"
- **delete_rooms_by_pk** - Delete a record from "rooms" using primary key
- **delete_sales_orders** - Delete records from "sales_orders"
- **delete_sales_orders_by_pk** - Delete a record from "sales_orders" using primary key
- **delete_staff** - Delete records from "staff"
- **delete_staff_by_pk** - Delete a record from "staff" using primary key
- **delete_staff_shifts** - Delete records from "staff_shifts"
- **delete_staff_shifts_by_pk** - Delete a record from "staff_shifts" using primary key
- **delete_teams** - Delete records from "teams"
- **delete_teams_by_pk** - Delete a record from "teams" using primary key

## Subscription Operations (Real-time)

Available subscription fields in `subscription_root`:

Real-time subscriptions are available for all tables (same as queries):

- Tables: additional_services, assignments, businesses, contracts, guardians, invoices, notifications, operation_tasks, packages, residents, rooms, sales_orders, staff, staff_shifts, teams

Each table has:

- `{table_name}` - Subscribe to changes in table
- `{table_name}_aggregate` - Subscribe to aggregated changes
- `{table_name}_by_pk` - Subscribe to specific record changes

## Query Arguments

All queries support these common arguments:

- **distinct_on** - Select distinct values (list of columns)
- **limit** - Limit the number of rows returned
- **offset** - Skip the first n rows (use with order_by)
- **order_by** - Sort rows by one or more columns
- **where** - Filter rows using boolean expressions

## Tables Overview

| Table                   | Purpose                                     |
| ----------------------- | ------------------------------------------- |
| **additional_services** | Extra services associated with sales orders |
| **assignments**         | Staff assignments and task allocations      |
| **businesses**          | Business information and settings           |
| **contracts**           | Sales contracts and agreements              |
| **guardians**           | Guardian/carer information                  |
| **invoices**            | Financial invoices and billing              |
| **notifications**       | System notifications                        |
| **operation_tasks**     | Operational tasks and workflows             |
| **packages**            | Service packages offered                    |
| **residents**           | Resident/customer information               |
| **rooms**               | Room/facility information                   |
| **sales_orders**        | Customer orders and transactions            |
| **staff**               | Staff member information                    |
| **staff_shifts**        | Work shifts and schedules                   |
| **teams**               | Team groupings                              |

## Usage Examples

### Fetch All Records

```graphql
query GetAllStaff {
  staff {
    id
    name
    # Add other fields from schema
  }
}
```

### Fetch Single Record

```graphql
query GetStaffById($id: uuid!) {
  staff_by_pk(id: $id) {
    id
    name
  }
}
```

### Filter Records

```graphql
query GetActiveStaff {
  staff(where: { status: { _eq: "active" } }) {
    id
    name
    status
  }
}
```

### Create Record

```graphql
mutation CreateStaff($name: String!) {
  insert_staff_one(object: { name: $name }) {
    id
    name
  }
}
```

### Update Record

```graphql
mutation UpdateStaff($id: uuid!, $name: String) {
  update_staff_by_pk(pk_columns: { id: $id }, _set: { name: $name }) {
    id
    name
  }
}
```

### Delete Record

```graphql
mutation DeleteStaff($id: uuid!) {
  delete_staff_by_pk(id: $id) {
    id
  }
}
```

## Next Steps

1. Check the actual fields for each table in the [api.json](./api.json) file
2. Create `.graphql` files in [src/graphql/](../src/graphql/) for each feature
3. Run `pnpm codegen` to generate TypeScript types
4. Create custom hooks in [src/hooks/](../src/hooks/) using graphql-hooks
5. Use hooks in your React components

For detailed field information for each table, refer to the complete schema in [api.json](./api.json).
