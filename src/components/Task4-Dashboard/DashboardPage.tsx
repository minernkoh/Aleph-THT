import { useMemo } from "react";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

import { mockResults } from "../../data/mockResults";
import {
  useKpiSeries,
  useScatterData,
  useSetpointBarData,
  useTopImpact,
} from "../../hooks";
import { formatNumber } from "../../utils/formatNumber";
import { ImpactPieChart } from "../charts/ImpactPieChart";
import { KpiLineChart } from "../charts/KpiLineChart";
import { ScatterVsKpiChart } from "../charts/ScatterVsKpiChart";
import { SetpointBarChart } from "../charts/SetpointBarChart";

export function DashboardPage() {
  const topImpactRows = useTopImpact();
  const barData = useSetpointBarData();
  const kpiSeries = useKpiSeries();
  const scatterSeries = useScatterData();

  const summary = useMemo(() => {
    const rows = mockResults.data.simulated_summary.simulated_data.map((s) => ({
      scenario: s.scenario,
      kpi: s.kpi_value,
    }));
    const first = rows[0];
    const top = topImpactRows[0];
    if (!first || rows.length === 0) {
      return {
        best: { scenario: "", kpi: 0 },
        worst: { scenario: "", kpi: 0 },
        range: 0,
        topVariable: top ? `${top.name} (${formatNumber(top.weight)})` : "—",
      };
    }
    const best = rows.reduce((a, b) => (b.kpi > a.kpi ? b : a), first);
    const worst = rows.reduce((a, b) => (b.kpi < a.kpi ? b : a), first);
    const range = best.kpi - worst.kpi;

    return {
      best,
      worst,
      range,
      topVariable: top ? `${top.name} (${formatNumber(top.weight)})` : "—",
    };
  }, [topImpactRows]);

  return (
    <Container className="py-4">
      <div className="mb-3">
        <h1 className="page-title mb-1">4. Dashboard</h1>
        <p className="text-body-secondary mb-0">
          Process experiment analysis and variable impact overview.
        </p>
      </div>

      <Card className="mb-3 card-hover">
        <Card.Header className="fw-semibold">Scenario overview</Card.Header>
        <Card.Body>
          <Row className="g-3 align-items-stretch">
            <Col md={6}>
              <div className="d-flex flex-column gap-2">
                <div>
                  <div className="text-body-secondary small">Best scenario</div>
                  <div className="h6 mb-0 tabular-nums">
                    {summary.best.scenario || "—"}
                  </div>
                  <div className="text-body-secondary small tabular-nums">
                    KPI: {formatNumber(summary.best.kpi)}
                  </div>
                </div>
                <div>
                  <div className="text-body-secondary small">Worst scenario</div>
                  <div className="h6 mb-0 tabular-nums">
                    {summary.worst.scenario || "—"}
                  </div>
                  <div className="text-body-secondary small tabular-nums">
                    KPI: {formatNumber(summary.worst.kpi)}
                  </div>
                </div>
              </div>
            </Col>
            <Col md={6}>
              <div className="d-flex flex-column gap-2">
                <div>
                  <div className="text-body-secondary small">KPI range (max − min)</div>
                  <div className="h6 mb-0 tabular-nums">
                    {formatNumber(summary.range)}
                  </div>
                </div>
                <div>
                  <div className="text-body-secondary small">Top impact driver</div>
                  <div className="h6 mb-0 tabular-nums" style={{ lineHeight: 1.2 }}>
                    {summary.topVariable}
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Row className="g-3">
        <Col lg={6}>
          <Card className="card-hover">
            <Card.Header className="fw-semibold">Top impact (pie)</Card.Header>
            <Card.Body style={{ height: 320 }}>
              <ImpactPieChart data={topImpactRows} />
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="card-hover">
            <Card.Header className="fw-semibold">Setpoint weightage (bar)</Card.Header>
            <Card.Body style={{ height: 320 }}>
              <SetpointBarChart data={barData} />
            </Card.Body>
          </Card>
        </Col>

        <Col lg={12}>
          <Card className="card-hover">
            <Card.Header className="fw-semibold">KPI across scenarios (line)</Card.Header>
            <Card.Body style={{ height: 340 }}>
              <KpiLineChart data={kpiSeries} />
            </Card.Body>
          </Card>
        </Col>

        <Col lg={12}>
          <Card className="card-hover">
            <Card.Header className="fw-semibold">
              Variable values vs KPI (scatter)
            </Card.Header>
            <Card.Body style={{ height: 380 }}>
              <ScatterVsKpiChart
                hexCold={scatterSeries.hexCold}
                fuelTemp={scatterSeries.fuelTemp}
                airTemp={scatterSeries.airTemp}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
