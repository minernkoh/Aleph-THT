import type {
  ColDef,
  GridOptions,
  GridReadyEvent,
  RowClickedEvent,
} from "ag-grid-community";
import { useMemo, useState } from "react";

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

/** Table wrapper that adds client-side paging controls. */
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

  // Reset to page 1 when the dataset size changes so the user doesn't land on
  // an empty page. Adjusting state during render avoids an extra render cycle
  // compared to useEffect (React docs: "you might not need an effect").
  const [prevDataLength, setPrevDataLength] = useState(data.length);
  if (data.length !== prevDataLength) {
    setPrevDataLength(data.length);
    setPage(1);
  }

  const pageSizeOptions = useMemo(() => {
    const base = pageSizeOptionsProp ?? [5, 10, 20, 50, 100];
    if (base.includes(initialPageSize)) return base;
    return [...base, initialPageSize].sort((a, b) => a - b);
  }, [pageSizeOptionsProp, initialPageSize]);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);

  const pagedData = useMemo(() => {
    // Client-side pagination: slice the already-loaded array.
    const start = (safePage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, safePage, pageSize]);

  const startRow = data.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endRow = Math.min(safePage * pageSize, data.length);

  return (
    <div className="d-flex flex-column gap-3">
      {title ? <h2 className="fw-semibold" style={{ fontSize: "var(--text-lg)" }}>{title}</h2> : null}
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

