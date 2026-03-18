import { useMemo } from "react";
import Container from "react-bootstrap/Container";
import type { ColDef } from "ag-grid-community";

import { PaginatedTable } from "../components/Task1-PaginatedTable";

type Row = {
  id: number;
  equipment: string;
  variable: string;
  value: number;
  unit: string;
};

const SAMPLE: Row[] = Array.from({ length: 137 }).map((_, i) => ({
  id: i + 1,
  equipment: ["HEX-100", "Fuel", "Air"][i % 3]!,
  variable: ["temperature", "cold_fluid_temperature", "global_heat_transfer_coefficient"][
    i % 3
  ]!,
  value: Math.round((280 + (i % 75) * 2.15) * 1000) / 1000,
  unit: "K",
}));

/** Task 1: paginated table example with sample equipment data. */
export function TablePage() {
  const columnDefs = useMemo<ColDef<Row>[]>(
    () => [
      { headerName: "ID", field: "id", width: 90 },
      { headerName: "Equipment", field: "equipment" },
      { headerName: "Variable", field: "variable" },
      { headerName: "Value", field: "value" },
      { headerName: "Unit", field: "unit", width: 100 },
    ],
    []
  );

  return (
    <Container className="py-4">
      <div className="mb-3">
        <h1 className="page-title mb-1">1. Table</h1>
        <div className="text-body-secondary">All-in-One paginated table.</div>
      </div>

      <PaginatedTable<Row>
        title="Sample equipment variables"
        columnDefs={columnDefs}
        data={SAMPLE}
        initialPageSize={10}
        height={520}
        getRowId={(p) => String(p.data.id)}
      />
    </Container>
  );
}
