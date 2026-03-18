import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import { Link } from "react-router-dom";

const tasks = [
  {
    to: "/task-1",
    title: "1. Table",
    description: "Browse and filter tabular data with configurable columns, sorting, and page size.",
  },
  {
    to: "/task-2",
    title: "2. Process Flow",
    description: "Define nodes and edges in tables; see the flow update live on the canvas.",
  },
  {
    to: "/task-3",
    title: "3. Report",
    description: "Generate an LLM narrative from experiment results and export to PDF with tables and charts.",
  },
  {
    to: "/task-4",
    title: "4. Dashboard",
    description: "Explore scenario KPIs and variable impact with pie, bar, line, and scatter charts.",
  },
];

export function HomePage() {
  return (
    <Container className="py-4">
      <section className="mb-4">
        <h1 className="page-title--lg mb-2">Process First LLC</h1>
        <p className="text-body-secondary mb-0" style={{ maxWidth: "42rem" }}>
          Tools for visualizing and troubleshooting process flow inefficiencies
          in the chemical industry. Use the links below or the navbar to open
          each module.
        </p>
      </section>

      <div className="row g-3">
        {tasks.map(({ to, title, description }) => (
          <div key={to} className="col-md-6">
            <Card
              as={Link}
              to={to}
              className="card-hover text-decoration-none text-body h-100"
              style={{ color: "inherit" }}
            >
              <Card.Body>
                <Card.Title className="h6 mb-2">{title}</Card.Title>
                <Card.Text className="text-body-secondary small mb-0">
                  {description}
                </Card.Text>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>
    </Container>
  );
}
