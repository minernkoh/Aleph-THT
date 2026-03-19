import { useMemo } from "react";
import Container from "react-bootstrap/Container";
import type { ColDef, GetRowIdParams, ValueFormatterParams } from "ag-grid-community";

import { PaginatedTable } from "../components/Task1-PaginatedTable";
import { useSimulatedDataRows } from "../hooks";
import type { SimulatedDataRow } from "../types";
import { formatNumber } from "../utils/formatNumber";

const getRowId = (p: GetRowIdParams<SimulatedDataRow>) =>
  `${p.data.scenario}::${p.data.equipment}::${p.data.variable_name}`;

/** Task 1: paginated table driven by `mock_results.json` scenario data. */
export function TablePage() {
  const rows = useSimulatedDataRows();

  const columnDefs = useMemo<ColDef<SimulatedDataRow>[]>(
    () => [
      { headerName: "Scenario", field: "scenario", width: 130 },
      { headerName: "Equipment", field: "equipment" },
      { headerName: "Variable", field: "variable_name" },
      { headerName: "Type", field: "variable_type", width: 110 },
      {
        headerName: "Value",
        field: "value",
        valueFormatter: (p: ValueFormatterParams<SimulatedDataRow, number>) =>
          p.value != null ? formatNumber(p.value) : "",
      },
      { headerName: "Unit", field: "unit", width: 100 },
      {
        headerName: "KPI",
        field: "kpi_value",
        valueFormatter: (p: ValueFormatterParams<SimulatedDataRow, number>) =>
          p.value != null ? formatNumber(p.value) : "",
      },
    ],
    [],
  );

  return (
    <Container className="py-4">
      <div className="mb-3">
        <h1 className="page-title mb-1">1. Table</h1>
        <div className="text-body-secondary">
          Simulated scenario data from <code>mock_results.json</code>.
        </div>
      </div>

      <PaginatedTable<SimulatedDataRow>
        title="Simulated equipment variables"
        columnDefs={columnDefs}
        data={rows}
        initialPageSize={10}
        height="var(--size-table-height, 420px)"
        getRowId={getRowId}
      />
    </Container>
  );
}
