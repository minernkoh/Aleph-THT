import { AgGridReact } from "ag-grid-react";
import type {
  CellValueChangedEvent,
  ColDef,
  GridOptions,
  GridReadyEvent,
  RowClickedEvent,
} from "ag-grid-community";
import { themeQuartz } from "ag-grid-community";
import { useMemo } from "react";

export type TableComponentProps<T extends object> = {
  columnDefs: ColDef<T>[];
  rowData: T[];
  getRowId?: GridOptions<T>["getRowId"];
  gridOptions?: GridOptions<T>;
  onGridReady?: (event: GridReadyEvent<T>) => void;
  onCellValueChanged?: (event: CellValueChangedEvent<T>) => void;
  onRowClicked?: (event: RowClickedEvent<T>) => void;
  height?: number | string;
};

export function TableComponent<T extends object>({
  columnDefs,
  rowData,
  getRowId,
  gridOptions,
  onGridReady,
  onCellValueChanged,
  onRowClicked,
  height = 420,
}: TableComponentProps<T>) {
  const defaultColDef = useMemo<ColDef<T>>(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      flex: 1,
      minWidth: 140,
    }),
    [],
  );

  const mergedGridOptions = useMemo<GridOptions<T>>(
    () => ({
      rowSelection: { mode: "singleRow" },
      ...gridOptions,
      getRowId: getRowId ?? gridOptions?.getRowId,
    }),
    [getRowId, gridOptions],
  );

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <div style={{ minWidth: 640, height }}>
        <AgGridReact<T>
          theme={themeQuartz}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowData={rowData}
          gridOptions={mergedGridOptions}
          onGridReady={onGridReady}
          onCellValueChanged={onCellValueChanged}
          onRowClicked={onRowClicked}
        />
      </div>
    </div>
  );
}

