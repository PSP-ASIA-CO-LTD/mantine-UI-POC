import { Table, type TableProps } from '@mantine/core';
import './StyledTable.css';

const BaseStyledTable = ({ className, ...props }: TableProps) => {
    return (
        <Table
            {...props}
            className={['styled-table', className].filter(Boolean).join(' ')}
            striped
            highlightOnHover
            verticalSpacing="sm"
            horizontalSpacing="md"
        />
    );
};

export const StyledTable = Object.assign(BaseStyledTable, Table);
