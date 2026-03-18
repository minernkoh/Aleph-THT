import { useState } from "react";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Stack from "react-bootstrap/Stack";
import Spinner from "react-bootstrap/Spinner";
import ReactMarkdown from "react-markdown";
import {
  ArrowsClockwiseIcon,
  EyeIcon,
  FilePdfIcon,
  PencilSimpleIcon,
} from "@phosphor-icons/react";

type NarrativeCardProps = {
  narrative: string;
  isGenerating: boolean;
  isExporting: boolean;
  onGenerate: () => void;
  onExport: () => void;
  onNarrativeChange: (nextNarrative: string) => void;
};

export function NarrativeCard({
  narrative,
  isGenerating,
  isExporting,
  onGenerate,
  onExport,
  onNarrativeChange,
}: NarrativeCardProps) {
  const [mode, setMode] = useState<"preview" | "edit">("preview");

  return (
    <Card className="mb-3 card-hover">
      <Card.Header className="fw-semibold">Narrative</Card.Header>
      <Card.Body>
        <Row className="g-3 align-items-center">
          <Col>
            <Stack direction="horizontal" gap={2} className="justify-content-between">
              <Stack direction="horizontal" gap={2}>
                <Button
                  variant={mode === "preview" ? "secondary" : "outline-secondary"}
                  size="sm"
                  className="touch-target-min"
                  onClick={() => setMode("preview")}
                  disabled={isGenerating}
                >
                  <span className="d-inline-flex align-items-center gap-1">
                    <EyeIcon size={16} aria-hidden="true" />
                    Preview
                  </span>
                </Button>
                <Button
                  variant={mode === "edit" ? "secondary" : "outline-secondary"}
                  size="sm"
                  className="touch-target-min"
                  onClick={() => setMode("edit")}
                  disabled={isGenerating}
                >
                  <span className="d-inline-flex align-items-center gap-1">
                    <PencilSimpleIcon size={16} aria-hidden="true" />
                    Edit
                  </span>
                </Button>
              </Stack>
              <Button
                variant="primary"
                onClick={onGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <span className="d-inline-flex align-items-center gap-2">
                    <Spinner animation="border" size="sm" />
                    Generating…
                  </span>
                ) : (
                  <span className="d-inline-flex align-items-center gap-2">
                    <ArrowsClockwiseIcon size={18} aria-hidden="true" />
                    Regenerate narrative
                  </span>
                )}
              </Button>
              <Button
                variant="outline-secondary"
                onClick={onExport}
                disabled={isExporting}
              >
                {isExporting ? (
                  <span className="d-inline-flex align-items-center gap-2">
                    <Spinner animation="border" size="sm" />
                    Exporting…
                  </span>
                ) : (
                  <span className="d-inline-flex align-items-center gap-2">
                    <FilePdfIcon size={18} aria-hidden="true" />
                    Export PDF
                  </span>
                )}
              </Button>
            </Stack>
          </Col>
        </Row>
        <div className="mt-3" aria-busy={isGenerating}>
          {mode === "edit" && !isGenerating ? (
            <Form.Group controlId="narrative-editor">
              <Form.Label className="text-body-secondary">
                Edit narrative (Markdown supported)
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={10}
                value={narrative}
                onChange={(e) => onNarrativeChange(e.currentTarget.value)}
              />
            </Form.Group>
          ) : (
            <div className="text-body">
              {isGenerating && !narrative.trim() ? (
                <div className="d-flex flex-column gap-2">
                  <div className="skeleton-line skeleton-line--lg" style={{ width: "72%" }} />
                </div>
              ) : (
                <>
                  <ReactMarkdown>{narrative}</ReactMarkdown>
                  {isGenerating && narrative.trim() ? (
                    <span
                      className="streaming-cursor align-baseline"
                      aria-hidden
                    />
                  ) : null}
                </>
              )}
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}
