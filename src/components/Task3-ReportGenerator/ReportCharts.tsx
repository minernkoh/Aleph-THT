import type { RefObject } from "react";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { ImpactPieChart } from "../charts/ImpactPieChart";
import { KpiLineChart } from "../charts/KpiLineChart";
import type { ImpactRow } from "../../types";
import type { KpiSeriesRow } from "../../types";

type ReportChartsProps = {
  topImpactRows: ImpactRow[];
  kpiSeries: KpiSeriesRow[];
  pieChartRef: RefObject<HTMLDivElement | null>;
  lineChartRef: RefObject<HTMLDivElement | null>;
};

export function ReportCharts({
  topImpactRows,
  kpiSeries,
  pieChartRef,
  lineChartRef,
}: ReportChartsProps) {
  return (
    <Row className="g-3">
      <Col lg={6}>
        <Card className="card-hover">
          <Card.Header className="fw-semibold">Top impact (pie)</Card.Header>
          <Card.Body style={{ height: 320 }}>
            <ImpactPieChart ref={pieChartRef} data={topImpactRows} />
          </Card.Body>
        </Card>
      </Col>
      <Col lg={6}>
        <Card className="card-hover">
          <Card.Header className="fw-semibold">KPI across scenarios</Card.Header>
          <Card.Body style={{ height: 320 }}>
            <KpiLineChart ref={lineChartRef} data={kpiSeries} angledLabels />
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}
