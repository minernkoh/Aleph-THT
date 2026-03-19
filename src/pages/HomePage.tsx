import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import { Link } from "react-router-dom";

const tasks = [
  {
    to: "/task-1",
    number: "01",
    title: "Table",
    description: "Browse and filter tabular data with configurable columns, sorting, and page size.",
  },
  {
    to: "/task-2",
    number: "02",
    title: "Process Flow",
    description: "Define nodes and edges in tables; see the flow update live on the canvas.",
  },
  {
    to: "/task-3",
    number: "03",
    title: "Report",
    description: "Generate an LLM narrative from experiment results and export to PDF.",
  },
  {
    to: "/task-4",
    number: "04",
    title: "Dashboard",
    description: "Explore scenario KPIs and variable impact across multiple chart types.",
  },
];

/** Landing page with links to the four demo tasks. */
export function HomePage() {
  return (
    <Container className="py-5">
      <section style={{ marginBottom: "var(--space-12)" }}>
        <h1 className="page-title--lg mb-3">Process First LLC</h1>
        <p className="text-body-secondary mb-0" style={{ maxWidth: "38rem" }}>
          Tools for visualizing and troubleshooting process flow inefficiencies
          in the chemical industry.
        </p>
      </section>

      <div className="row g-3">
        {tasks.map(({ to, number, title, description }) => (
          <div key={to} className="col-md-6">
            <Card
              as={Link}
              to={to}
              className="card-hover text-decoration-none text-body h-100"
              style={{ color: "inherit" }}
            >
              <Card.Body className="d-flex gap-3 align-items-start">
                <span
                  className="tabular-nums"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "var(--text-xs)",
                    color: "var(--text-muted)",
                    lineHeight: "var(--leading-tight)",
                    paddingTop: "2px",
                    flexShrink: 0,
                  }}
                >
                  {number}
                </span>
                <div>
                  <Card.Title
                    as="h2"
                    className="mb-1"
                    style={{
                      fontSize: "var(--text-md)",
                      fontWeight: 600,
                      fontFamily: "var(--font-display)",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {title}
                  </Card.Title>
                  <Card.Text
                    className="text-body-secondary mb-0"
                    style={{ fontSize: "var(--text-sm)" }}
                  >
                    {description}
                  </Card.Text>
                </div>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>
    </Container>
  );
}
