import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatNumber } from "../utils/formatNumber";
import type { ImpactRow } from "../types";
import type { MockResults } from "../types";
import type { SimulatedDataRow } from "../types";

/** jspdf-autotable attaches lastAutoTable to the doc; not in jsPDF types */
function getLastAutoTableY(doc: jsPDF): number | undefined {
  const docWithTable = doc as jsPDF & { lastAutoTable?: { finalY?: number } };
  return docWithTable.lastAutoTable?.finalY;
}

export type ExportPdfParams = {
  narrative: string;
  topImpactRows: ImpactRow[];
  reportData: MockResults["data"];
  simulatedDataRows: SimulatedDataRow[];
  pieChartElement: HTMLDivElement | null;
  lineChartElement: HTMLDivElement | null;
};

const CHART_IMAGE_MAX_HEIGHT = 200;
const CHART_IMAGE_HORIZONTAL_GAP = 5;

function getCaptureBackgroundColor(): string {
  if (typeof window === "undefined") return "#ffffff";
  const bg = getComputedStyle(document.documentElement)
    .getPropertyValue("--bg")
    .trim();
  return bg || "#ffffff";
}

/**
 * Generates and downloads a PDF report. Resolves when done; throws on failure.
 */
export async function exportPdf(params: ExportPdfParams): Promise<void> {
  const {
    narrative,
    topImpactRows,
    reportData,
    simulatedDataRows,
    pieChartElement,
    lineChartElement,
  } = params;

  const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;
  let y = margin;

  const addPageIfNeeded = (required: number) => {
    if (y + required > pageHeight - margin) {
      pdf.addPage();
      y = margin;
    }
  };

  // Narrative as searchable text (strip markdown for plain text)
  const plainNarrative = narrative.replace(/#{1,6}\s/g, "").replace(/\*\*/g, "");
  pdf.setFontSize(11);
  const narrativeLines = pdf.splitTextToSize(plainNarrative, maxWidth);
  for (const line of narrativeLines) {
    addPageIfNeeded(14);
    pdf.text(line, margin, y);
    y += 14;
  }
  y += 10;
  addPageIfNeeded(80);

  // Top impact table
  autoTable(pdf, {
    startY: y,
    head: [["Variable", "Weight"]],
    body: topImpactRows.map((r) => [r.name, formatNumber(r.weight)]),
    margin: { left: margin, right: margin },
    theme: "grid",
    styles: { fontSize: 9 },
  });
  y = getLastAutoTableY(pdf) ?? y;
  y += 15;
  addPageIfNeeded(80);

  // Charts as images (placeholder text if capture fails)
  let chartRegionHeight = 0;
  const halfWidth = maxWidth / 2 - CHART_IMAGE_HORIZONTAL_GAP / 2;
  const captureOpts = {
    scale: 2,
    useCORS: true,
    backgroundColor: getCaptureBackgroundColor(),
  };

  const placeholderChartHeight = 40;
  if (pieChartElement) {
    try {
      const pieCanvas = await html2canvas(pieChartElement, captureOpts);
      const imgW = halfWidth;
      const imgH = Math.min(
        CHART_IMAGE_MAX_HEIGHT,
        (pieCanvas.height * imgW) / pieCanvas.width,
      );
      addPageIfNeeded(imgH + 20);
      pdf.addImage(
        pieCanvas.toDataURL("image/png"),
        "PNG",
        margin,
        y,
        imgW,
        imgH,
      );
      chartRegionHeight = Math.max(chartRegionHeight, imgH);
    } catch {
      addPageIfNeeded(placeholderChartHeight + 20);
      pdf.setFontSize(9);
      pdf.text("Chart could not be rendered (Top impact)", margin, y + 14);
      chartRegionHeight = Math.max(chartRegionHeight, placeholderChartHeight);
    }
  }
  if (lineChartElement) {
    try {
      const lineCanvas = await html2canvas(lineChartElement, captureOpts);
      const imgW = halfWidth;
      const imgH = Math.min(
        CHART_IMAGE_MAX_HEIGHT,
        (lineCanvas.height * imgW) / lineCanvas.width,
      );
      addPageIfNeeded(imgH + 20);
      pdf.addImage(
        lineCanvas.toDataURL("image/png"),
        "PNG",
        margin + halfWidth + CHART_IMAGE_HORIZONTAL_GAP,
        y,
        imgW,
        imgH,
      );
      chartRegionHeight = Math.max(chartRegionHeight, imgH);
    } catch {
      addPageIfNeeded(placeholderChartHeight + 20);
      pdf.setFontSize(9);
      pdf.text(
        "Chart could not be rendered (KPI across scenarios)",
        margin + halfWidth + CHART_IMAGE_HORIZONTAL_GAP,
        y + 14,
      );
      chartRegionHeight = Math.max(chartRegionHeight, placeholderChartHeight);
    }
  }

  y += chartRegionHeight + 20;
  addPageIfNeeded(50);

  // Top variables table
  autoTable(pdf, {
    startY: y,
    head: [["Equipment", "Type", "Name", "Value", "Unit"]],
    body: reportData.top_variables.map((r) => [
      r.equipment,
      r.type,
      r.name,
      String(r.value),
      r.unit,
    ]),
    margin: { left: margin, right: margin },
    theme: "grid",
    styles: { fontSize: 8 },
  });
  y = getLastAutoTableY(pdf) ?? y;
  y += 15;
  addPageIfNeeded(50);

  // Setpoint impact summary
  autoTable(pdf, {
    startY: y,
    head: [["Equipment", "Setpoint", "Weightage", "Unit"]],
    body: reportData.setpoint_impact_summary.map((r) => [
      r.equipment,
      r.setpoint,
      formatNumber(r.weightage),
      r.unit,
    ]),
    margin: { left: margin, right: margin },
    theme: "grid",
    styles: { fontSize: 8 },
  });
  y = getLastAutoTableY(pdf) ?? y;
  y += 15;

  if (reportData.condition_impact_summary.length > 0) {
    addPageIfNeeded(50);
    autoTable(pdf, {
      startY: y,
      head: [["Equipment", "Condition", "Weightage", "Unit"]],
      body: reportData.condition_impact_summary.map((r) => [
        r.equipment,
        r.condition,
        formatNumber(r.weightage),
        r.unit,
      ]),
      margin: { left: margin, right: margin },
      theme: "grid",
      styles: { fontSize: 8 },
    });
    y = getLastAutoTableY(pdf) ?? y;
    y += 15;
  }

  addPageIfNeeded(50);
  const simulatedSlice = simulatedDataRows.slice(0, 100);
  autoTable(pdf, {
    startY: y,
    head: [
      ["Scenario", "KPI value", "Equipment", "Variable", "Type", "Value", "Unit"],
    ],
    body: simulatedSlice.map((r) => [
      r.scenario,
      formatNumber(r.kpi_value),
      r.equipment,
      r.variable_name,
      r.variable_type,
      String(r.value),
      r.unit,
    ]),
    margin: { left: margin, right: margin },
    theme: "grid",
    styles: { fontSize: 7 },
  });
  y = getLastAutoTableY(pdf) ?? y;
  if (simulatedDataRows.length > 100) {
    y += 8;
    pdf.setFontSize(8);
    pdf.text(
      `Showing first 100 of ${simulatedDataRows.length} rows.`,
      margin,
      y,
    );
  }

  pdf.save("process-report.pdf");
}
