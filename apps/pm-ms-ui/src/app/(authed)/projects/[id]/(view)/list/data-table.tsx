'use client';

import React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@shadcn-ui/components/table';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
  DataTablePagination,
  DataTableToolbar,
  RowCreate,
}: DataTableProps<TData, TValue> & {
  DataTableToolbar?: React.ComponentType<{ table: ReturnType<typeof useReactTable<TData>> }>;
  DataTablePagination?: React.ComponentType<{ table: ReturnType<typeof useReactTable<TData>> }>;
  RowCreate?: React.ComponentType<{ table: ReturnType<typeof useReactTable<TData>> }>;
}) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [rowSelection, setRowSelection] = React.useState({});

  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div className='space-y-4'>
      {/* <DataTableToolbar table={table} /> */}

      {DataTableToolbar && <DataTableToolbar table={table} />}

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  No results.
                </TableCell>
              </TableRow>
            )}

            {RowCreate && <RowCreate table={table} />}
          </TableBody>
        </Table>
      </div>
      {DataTablePagination && <DataTablePagination table={table} />}
    </div>
  );
}

{
  /* <TableRow>
  <TableCell colSpan={columns.length} className='h-24 text-center'>
    <form
      className='flex items-center justify-between gap-2'
      onSubmit={(e) => {
        e.preventDefault();
        // Handle form submission logic here
      }}
    >
      <div>Type</div>
      <div>
        <input type='text' name='type' />
      </div>
      <div>Due Date</div>
      <div>Assignee</div>
      <div>Create Button</div>
    </form>
  </TableCell>
</TableRow>; */
}
