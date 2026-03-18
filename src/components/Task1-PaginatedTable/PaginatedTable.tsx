import type {
  ColDef,
  GridOptions,
  GridReadyEvent,
  RowClickedEvent,
} from "ag-grid-community";
import { useMemo, useState, useEffect } from "react";

import { Pagination } from "./Pagination";
import { TableComponent } from "./TableComponent";

export type PaginatedTableProps<T extends object> = {
  title?: string;
  columnDefs: ColDef<T>[];
  data: T[];
  initialPageSize?: number;
  pageSizeOptions?: number[];
  getRowId?: GridOptions<T>["getRowId"];
  gridOptions?: GridOptions<T>;
  height?: number | string;
  onGridReady?: (event: GridReadyEvent<T>) => void;
  onRowClicked?: (event: RowClickedEvent<T>) => void;
};

export function PaginatedTable<T extends object>({
  title,
  columnDefs,
  data,
  initialPageSize = 10,
  pageSizeOptions: pageSizeOptionsProp,
  getRowId,
  gridOptions,
  height,
  onGridReady,
  onRowClicked,
}: PaginatedTableProps<T>) {
  const [pageSize, setPageSize] = useState<number>(initialPageSize);
  const [page, setPage] = useState<number>(1);

  const pageSizeOptions = useMemo(() => {
    const base = pageSizeOptionsProp ?? [5, 10, 20, 50, 100];
    if (base.includes(initialPageSize)) return base;
    return [...base, initialPageSize].sort((a, b) => a - b);
  }, [pageSizeOptionsProp, initialPageSize]);

  useEffect(() => {
    setPage(1);
  }, [data.length]);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);

  const pagedData = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, safePage, pageSize]);

  const startRow = data.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endRow = Math.min(safePage * pageSize, data.length);

  return (
    <div className="d-flex flex-column gap-3">
      {title ? <div className="fw-semibold">{title}</div> : null}
      <TableComponent
        columnDefs={columnDefs}
        rowData={pagedData}
        getRowId={getRowId}
        gridOptions={gridOptions}
        height={height}
        onGridReady={onGridReady}
        onRowClicked={onRowClicked}
      />
      <Pagination
        page={safePage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={data.length}
        startItem={startRow}
        endItem={endRow}
        pageSizeOptions={pageSizeOptions}
        onPageChange={(p) => setPage(p)}
        onPageSizeChange={(s) => {
          setPageSize(s);
          setPage(1);
        }}
      />
    </div>
  );
}

