import { useEffect, useMemo, useRef, useState } from "react";
import Alert from "react-bootstrap/Alert";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import type { ColDef } from "ag-grid-community";

import { mockResults } from "../data/mockResults";
import { useKpiSeries, useSimulatedDataRows, useTopImpact } from "../hooks";
import { exportPdf } from "../services/pdfExport";
import type { SimulatedDataRow } from "../types";
import { PaginatedTable } from "../components/Task1-PaginatedTable";
import { NarrativeCard } from "../components/Task3-ReportGenerator/NarrativeCard";
import { ReportCharts } from "../components/Task3-ReportGenerator/ReportCharts";

type LLMInput = ReturnType<typeof buildLLMInput>;

/**
 * Deterministic fallback narrative built entirely from the JSON data.
 * Used when the LLM endpoint is unavailable (server down, key missing, error).
 */
function buildTemplateNarrative(input: LLMInput): string {
  const { kpi_stats, top_impact, top_variables, setpoint_impact_summary } =
    input;
  const topEntries = Object.entries(top_impact)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const topList = topEntries
    .map(([name, weight]) => `- **${name}**: ${weight.toFixed(2)}%`)
    .join("\n");

  const topVarSummary = top_variables
    .slice(0, 5)
    .map(
      (v) => `- ${v.equipment} — ${v.name} (${v.type}): ${v.value} ${v.unit}`
    )
    .join("\n");

  const setpointSummary = setpoint_impact_summary
    .slice(0, 5)
    .map(
      (s) =>
        `- ${s.equipment} / ${s.setpoint}: ${s.weightage.toFixed(2)}% (${s.unit})`
    )
    .join("\n");

  return [
    `## ${input.main_summary_text}`,
    "",
    input.top_summary_text,
    "",
    `Across **${kpi_stats.n} scenarios**, the KPI ranged from **${kpi_stats.min.toFixed(3)}** to **${kpi_stats.max.toFixed(3)}** (mean **${kpi_stats.avg.toFixed(3)}**).`,
    "",
    "### Top Impact Variables",
    "",
    topList,
    "",
    "### Key Variable Details",
    "",
    topVarSummary,
    "",
    `### ${input.impact_summary_text}`,
    "",
    setpointSummary,
    "",
    "*This narrative was generated from a template because the LLM service was unavailable. Click **Generate** again when the server is running to get an AI-written analysis.*",
  ].join("\n");
}

/**
 * Create a compact JSON payload to send to the backend LLM endpoint.
 *
 * We include summaries + tables + a small sample of scenarios. Keeping the payload
 * small makes requests faster and reduces token usage.
 */
function buildLLMInput() {
  const d = mockResults.data;
  const scenarios = d.simulated_summary.simulated_data.map((s) => ({
    scenario: s.scenario,
    kpi: s.kpi,
    kpi_value: s.kpi_value,
    equipment_specification: s.equipment_specification,
  }));
  const kpiValues = scenarios.map((s) => s.kpi_value);
  const kpiMin = Math.min(...kpiValues);
  const kpiMax = Math.max(...kpiValues);
  const kpiAvg = kpiValues.reduce((a, b) => a + b, 0) / kpiValues.length;

  return {
    main_summary_text: d.main_summary_text,
    top_summary_text: d.top_summary_text,
    top_impact: d.top_impact,
    top_variables: d.top_variables,
    impact_summary_text: d.impact_summary_text,
    setpoint_impact_summary: d.setpoint_impact_summary,
    condition_impact_summary: d.condition_impact_summary,
    kpi_stats: { min: kpiMin, max: kpiMax, avg: kpiAvg, n: kpiValues.length },
    scenarios_sample: scenarios.slice(0, 8),
  };
}

/** Task 3: report builder (tables + charts + narrative + PDF export). */
export function ReportPage() {
  const topImpactRows = useTopImpact();
  const [narrative, setNarrative] = useState<string>(() => {
    try {
      return localStorage.getItem("report-narrative") ?? "";
    } catch {
      return "";
    }
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const pieChartRef = useRef<HTMLDivElement | null>(null);
  const lineChartRef = useRef<HTMLDivElement | null>(null);
  const narrativeAbortRef = useRef<AbortController | null>(null);

  const kpiSeries = useKpiSeries();
  const simulatedDataRows = useSimulatedDataRows();

  const topVariablesColumnDefs = useMemo<
    ColDef<(typeof mockResults.data.top_variables)[number]>[]
  >(
    () => [
      { headerName: "Equipment", field: "equipment" },
      { headerName: "Type", field: "type" },
      { headerName: "Name", field: "name" },
      { headerName: "Value", field: "value" },
      { headerName: "Unit", field: "unit" },
    ],
    []
  );

  const setpointColumnDefs = useMemo<
    ColDef<(typeof mockResults.data.setpoint_impact_summary)[number]>[]
  >(
    () => [
      { headerName: "Equipment", field: "equipment" },
      { headerName: "Setpoint", field: "setpoint" },
      { headerName: "Weightage", field: "weightage" },
      { headerName: "Unit", field: "unit" },
    ],
    []
  );

  const conditionImpactColumnDefs = useMemo<
    ColDef<(typeof mockResults.data.condition_impact_summary)[number]>[]
  >(
    () => [
      { headerName: "Equipment", field: "equipment" },
      { headerName: "Condition", field: "condition" },
      { headerName: "Weightage", field: "weightage" },
      { headerName: "Unit", field: "unit" },
    ],
    []
  );

  const simulatedDataColumnDefs = useMemo<ColDef<SimulatedDataRow>[]>(
    () => [
      { headerName: "Scenario", field: "scenario", width: 120 },
      { headerName: "KPI value", field: "kpi_value", width: 100 },
      { headerName: "Equipment", field: "equipment", width: 110 },
      { headerName: "Variable", field: "variable_name" },
      { headerName: "Type", field: "variable_type", width: 100 },
      { headerName: "Value", field: "value", width: 100 },
      { headerName: "Unit", field: "unit", width: 80 },
    ],
    []
  );

  const hasConditionImpact = mockResults.data.condition_impact_summary.length > 0;

  useEffect(() => {
    // Auto-dismiss non-critical info messages after a few seconds.
    if (!info) return;
    const t = window.setTimeout(() => setInfo(null), 5000);
    return () => window.clearTimeout(t);
  }, [info]);

  useEffect(() => {
    // Clean up any in-flight streaming request when leaving the page.
    return () => {
      narrativeAbortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!narrative.trim()) return;
    try {
      localStorage.setItem("report-narrative", narrative);
    } catch {
      // ignore: storage may be unavailable (private mode / disabled)
    }
  }, [narrative]);

  const LLM_TIMEOUT_MS = 30_000;

  /**
   * Generate narrative text using the backend endpoint.
   *
   * The server can respond in two ways:
   * - **SSE streaming** (`text/event-stream`): we append text chunks as they arrive
   * - **JSON** (non-streaming): we set the final narrative in one shot
   *
   * On failure (server down, bad key, timeout) the UI falls back to a deterministic
   * template narrative so the report is still usable without the LLM.
   */
  async function generateWithLLM() {
    setError(null);
    setInfo(null);
    setIsGenerating(true);
    narrativeAbortRef.current?.abort();
    const ac = new AbortController();
    narrativeAbortRef.current = ac;
    // Client-side timeout so a hanging request doesn't keep the UI stuck.
    const timeoutId = window.setTimeout(() => ac.abort(), LLM_TIMEOUT_MS);
    const input = buildLLMInput();
    try {
      const res = await fetch("/api/generate-narrative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        signal: ac.signal,
      });

      const contentType = res.headers.get("Content-Type") ?? "";
      if (!res.ok) {
        const data =
          contentType.includes("application/json") &&
          (await res.json().catch(() => ({})));
        const msg =
          (data as { error?: string })?.error ?? `Request failed (${res.status})`;
        setError(msg);
        if (!narrative.trim()) setNarrative(buildTemplateNarrative(input));
        return;
      }

      if (!contentType.includes("text/event-stream")) {
        // Non-streaming response shape: `{ narrative: string }`.
        const data = await res.json();
        const text = (data.narrative ?? "").trim();
        if (text) setNarrative(text);
        return;
      }

      // Streaming SSE response: parse `data: ...` lines as they arrive.
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) {
        return;
      }

      let buffer = "";
      let fullText = "";
      let streamDone = false;
      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // SSE frames are line-based. We keep any partial last line in `buffer`.
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const payload = line.slice(6);
            if (payload === "[DONE]") {
              streamDone = true;
              break;
            }
            try {
              // Payload is either `{ text: string }` or `{ error: string }`.
              const parsed = JSON.parse(payload) as { text?: string; error?: string };
              if (parsed.error) {
                setError(parsed.error);
                return;
              }
              if (typeof parsed.text === "string") {
                fullText += parsed.text;
                setNarrative(fullText);
              }
            } catch {
              // Ignore malformed JSON chunks; we'll keep listening for the next event.
            }
          }
        }
      }

      // If the stream ended without a trailing newline, handle a final buffered event.
      if (buffer.startsWith("data: ")) {
        const payload = buffer.slice(6).trim();
        if (payload !== "[DONE]") {
          try {
            const parsed = JSON.parse(payload) as { text?: string; error?: string };
            if (parsed.error) {
              setError(parsed.error);
              return;
            }
            if (typeof parsed.text === "string") {
              fullText += parsed.text;
              setNarrative(fullText);
            }
          } catch {
            // ignore
          }
        }
      }
      if (!fullText.trim()) {
        setError("Narrative generation returned empty content. Please try again.");
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") {
        setError("Request timed out. Click Generate again to retry.");
        if (!narrative.trim()) setNarrative(buildTemplateNarrative(input));
        return;
      }
      setError(e instanceof Error ? e.message : String(e));
      if (!narrative.trim()) setNarrative(buildTemplateNarrative(input));
    } finally {
      window.clearTimeout(timeoutId);
      setIsGenerating(false);
      narrativeAbortRef.current = null;
    }
  }

  /** Export the current report (narrative + charts + tables) as a PDF. */
  async function handleExportPdf() {
    setError(null);
    setInfo(null);
    setIsExporting(true);
    try {
      await exportPdf({
        narrative,
        topImpactRows,
        reportData: mockResults.data,
        simulatedDataRows,
        pieChartElement: pieChartRef.current,
        lineChartElement: lineChartRef.current,
      });
      setInfo("PDF exported successfully (searchable text and tables).");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <Container className="py-4">
      <div className="mb-3">
        <h1 className="page-title mb-1">3. Report</h1>
        <div className="text-body-secondary">
          Turn experiment results into a shareable PDF with narrative, charts, and tables.
        </div>
      </div>

      <div role="status" aria-live="polite" aria-atomic="true" className="mb-0">
        {error ? (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        ) : null}
        {info ? (
          <Alert variant="info" className="mb-3">
            {info}
          </Alert>
        ) : null}
      </div>

      <NarrativeCard
        narrative={narrative}
        hasNarrative={Boolean(narrative.trim())}
        isGenerating={isGenerating}
        isExporting={isExporting}
        onGenerate={generateWithLLM}
        onExport={handleExportPdf}
        onNarrativeChange={setNarrative}
      />

      <ReportCharts
        topImpactRows={topImpactRows}
        kpiSeries={kpiSeries}
        pieChartRef={pieChartRef}
        lineChartRef={lineChartRef}
      />

      <Row className="g-5 mt-5">
        <Col lg={12}>
          <PaginatedTable
            title="Top variables"
            columnDefs={topVariablesColumnDefs}
            data={mockResults.data.top_variables}
            initialPageSize={5}
            height={320}
          />
        </Col>
        <Col lg={12}>
          <PaginatedTable
            title="Setpoint impact summary"
            columnDefs={setpointColumnDefs}
            data={mockResults.data.setpoint_impact_summary}
            initialPageSize={10}
            height={320}
          />
        </Col>
        {hasConditionImpact ? (
          <Col lg={12}>
            <PaginatedTable
              title="Condition impact summary"
              columnDefs={conditionImpactColumnDefs}
              data={mockResults.data.condition_impact_summary}
              initialPageSize={10}
              height={320}
            />
          </Col>
        ) : null}
        <Col lg={12}>
          <PaginatedTable
            title="Simulated data (equipment & variables per scenario)"
            columnDefs={simulatedDataColumnDefs}
            data={simulatedDataRows}
            initialPageSize={10}
            height={320}
          />
        </Col>
      </Row>
    </Container>
  );
}
