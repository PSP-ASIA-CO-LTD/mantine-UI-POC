import type { HTMLAttributes, TableHTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from 'react';

type StyledTableProps = TableHTMLAttributes<HTMLTableElement>;
type StyledTheadProps = HTMLAttributes<HTMLTableSectionElement>;
type StyledTbodyProps = HTMLAttributes<HTMLTableSectionElement>;
type StyledTfootProps = HTMLAttributes<HTMLTableSectionElement>;
type StyledTrProps = HTMLAttributes<HTMLTableRowElement>;
type StyledThProps = ThHTMLAttributes<HTMLTableCellElement>;
type StyledTdProps = TdHTMLAttributes<HTMLTableCellElement>;
type StyledCaptionProps = HTMLAttributes<HTMLTableCaptionElement>;

const BaseStyledTable = ({ className, ...props }: StyledTableProps) => (
    <table
        {...props}
        className={['styled-table', 'table', 'table-striped', 'table-hover', 'align-middle', className].filter(Boolean).join(' ')}
    />
);

const StyledThead = (props: StyledTheadProps) => <thead {...props} />;
const StyledTbody = (props: StyledTbodyProps) => <tbody {...props} />;
const StyledTfoot = (props: StyledTfootProps) => <tfoot {...props} />;
const StyledTr = (props: StyledTrProps) => <tr {...props} />;
const StyledTh = (props: StyledThProps) => <th {...props} />;
const StyledTd = (props: StyledTdProps) => <td {...props} />;
const StyledCaption = (props: StyledCaptionProps) => <caption {...props} />;

export const StyledTable = Object.assign(BaseStyledTable, {
    Thead: StyledThead,
    Tbody: StyledTbody,
    Tfoot: StyledTfoot,
    Tr: StyledTr,
    Th: StyledTh,
    Td: StyledTd,
    Caption: StyledCaption,
});
