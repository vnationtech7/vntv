"use client";

import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Column<T> {
  key?: string; // For backward compatibility
  label?: string; // For backward compatibility
  header?: string; // New prop name
  accessor?: keyof T | string; // New prop name
  render?: (item: T) => ReactNode;
  cell?: (item: T) => ReactNode; // New prop name (alias for render)
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  itemsPerPage?: number; // For future pagination
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  loading = false,
  emptyMessage = "No data available",
  onRowClick,
  itemsPerPage,
}: DataTableProps<T>) {
  // Normalize column props to support both old and new formats
  const normalizedColumns = columns.map((col) => ({
    key: col.key || (col.accessor as string) || "",
    label: col.label || col.header || "",
    render: col.render || col.cell,
    className: col.className,
  }));

  if (loading) {
    return (
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-background-panel-2">
              <tr>
                {normalizedColumns.map((column, index) => (
                  <th
                    key={column.key || `header-${index}`}
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-border">
                  {normalizedColumns.map((column, colIndex) => (
                    <td key={`${i}-${column.key}-${colIndex}`} className="px-6 py-4">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <p className="text-text-tertiary">{emptyMessage}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-border bg-background-panel-2">
            <tr>
              {normalizedColumns.map((column, index) => (
                <th
                  key={column.key || `header-${index}`}
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary ${
                    column.className || ""
                  }`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((item) => (
              <tr
                key={item.id}
                onClick={() => onRowClick?.(item)}
                className={
                  onRowClick
                    ? "cursor-pointer transition-colors hover:bg-background-panel-2"
                    : ""
                }
              >
                {normalizedColumns.map((column, colIndex) => (
                  <td
                    key={`${item.id}-${column.key}-${colIndex}`}
                    className={`px-6 py-4 text-sm ${column.className || ""}`}
                  >
                    {column.render
                      ? column.render(item)
                      : String((item as any)[column.key] || "-")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
