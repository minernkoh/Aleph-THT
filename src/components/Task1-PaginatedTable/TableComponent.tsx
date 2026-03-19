import { AgGridReact } from "ag-grid-react";
import type {
  CellValueChangedEvent,
  ColDef,
  GridOptions,
  GridReadyEvent,
  RowClickedEvent,
  SelectionChangedEvent,
} from "ag-grid-community";
import { themeQuartz } from "ag-grid-community";
import { useMemo } from "react";

const agTheme = themeQuartz.withParams({
  backgroundColor: "var(--bg)",
  foregroundColor: "var(--text)",
  borderColor: "var(--border)",
  chromeBackgroundColor: "var(--surface-1)",
});

export type TableComponentProps<T extends object> = {
  columnDefs: ColDef<T>[];
  rowData: T[];
  getRowId?: GridOptions<T>["getRowId"];
  gridOptions?: GridOptions<T>;
  onGridReady?: (event: GridReadyEvent<T>) => void;
  onCellValueChanged?: (event: CellValueChangedEvent<T>) => void;
  onRowClicked?: (event: RowClickedEvent<T>) => void;
  onSelectionChanged?: (event: SelectionChangedEvent<T>) => void;
  height?: number | string;
};

/** Shared AG Grid wrapper with sensible defaults. */
export function TableComponent<T extends object>({
  columnDefs,
  rowData,
  getRowId,
  gridOptions,
  onGridReady,
  onCellValueChanged,
  onRowClicked,
  onSelectionChanged,
  height = "var(--size-table-height, 420px)",
}: TableComponentProps<T>) {
  const defaultColDef = useMemo<ColDef<T>>(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      flex: 1,
      minWidth: 110,
    }),
    [],
  );

  const mergedGridOptions = useMemo<GridOptions<T>>(
    () => ({
      ...gridOptions,
      getRowId: getRowId ?? gridOptions?.getRowId,
      overlayNoRowsTemplate:
        '<div class="text-body-secondary py-4">No rows to display</div>',
    }),
    [getRowId, gridOptions],
  );

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <div style={{ minWidth: "var(--size-table-min-width, 480px)", height }}>
        <AgGridReact<T>
          theme={agTheme}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowData={rowData}
          gridOptions={mergedGridOptions}
          onGridReady={onGridReady}
          onCellValueChanged={onCellValueChanged}
          onRowClicked={onRowClicked}
          onSelectionChanged={onSelectionChanged}
        />
      </div>
    </div>
  );
}
