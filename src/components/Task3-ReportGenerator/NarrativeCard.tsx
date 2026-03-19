import { useEffect, useState } from "react";
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
  FilePdfIcon,
  FloppyDiskIcon,
  PencilSimpleIcon,
  XIcon,
} from "@phosphor-icons/react";

type NarrativeCardProps = {
  narrative: string;
  hasNarrative: boolean;
  isGenerating: boolean;
  isExporting: boolean;
  onGenerate: () => void;
  onExport: () => void;
  onNarrativeChange: (nextNarrative: string) => void;
};

/** Narrative card with read/edit modes and generate/export actions. */
export function NarrativeCard({
  narrative,
  hasNarrative,
  isGenerating,
  isExporting,
  onGenerate,
  onExport,
  onNarrativeChange,
}: NarrativeCardProps) {
  const [mode, setMode] = useState<"read" | "edit">("read");
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (isGenerating) setMode("read");
  }, [isGenerating]);

  function enterEdit() {
    setDraft(narrative);
    setMode("edit");
  }

  function handleSave() {
    onNarrativeChange(draft);
    setMode("read");
  }

  function handleCancel() {
    setDraft("");
    setMode("read");
  }

  return (
    <Card className="mb-3 card-hover">
      <Card.Header className="fw-semibold">Narrative</Card.Header>
      <Card.Body>
        <Row className="g-3 align-items-center">
          <Col>
            <Stack
              direction="horizontal"
              gap={2}
              className="justify-content-between flex-wrap"
            >
              {hasNarrative && mode === "read" ? (
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="touch-target-min"
                  onClick={enterEdit}
                  disabled={isGenerating}
                  aria-label="Edit narrative"
                >
                  <span className="d-inline-flex align-items-center gap-1">
                    <PencilSimpleIcon size={16} aria-hidden="true" />
                    Edit
                  </span>
                </Button>
              ) : mode === "edit" ? (
                <Stack direction="horizontal" gap={2}>
                  <Button
                    variant="primary"
                    size="sm"
                    className="touch-target-min"
                    onClick={handleSave}
                    aria-label="Save narrative edits"
                  >
                    <span className="d-inline-flex align-items-center gap-1">
                      <FloppyDiskIcon size={16} aria-hidden="true" />
                      Save
                    </span>
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="touch-target-min"
                    onClick={handleCancel}
                    aria-label="Cancel editing"
                  >
                    <span className="d-inline-flex align-items-center gap-1">
                      <XIcon size={16} aria-hidden="true" />
                      Cancel
                    </span>
                  </Button>
                </Stack>
              ) : null}
              <Stack direction="horizontal" gap={2} className="ms-auto flex-wrap">
                <Button
                  variant="primary"
                  className="touch-target-min"
                  onClick={onGenerate}
                  disabled={isGenerating}
                  aria-label={hasNarrative ? "Regenerate narrative" : "Generate narrative"}
                >
                  {isGenerating ? (
                    <span className="d-inline-flex align-items-center gap-2">
                      <Spinner animation="border" size="sm" />
                      Generating…
                    </span>
                  ) : (
                    <span className="d-inline-flex align-items-center gap-2">
                      <ArrowsClockwiseIcon size={18} aria-hidden="true" />
                      {hasNarrative ? "Regenerate narrative" : "Generate narrative"}
                    </span>
                  )}
                </Button>
                <Button
                  variant="outline-secondary"
                  className="touch-target-min"
                  onClick={onExport}
                  disabled={isExporting}
                  aria-label="Export report as PDF"
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
            </Stack>
          </Col>
        </Row>
        <div className="mt-3" aria-busy={isGenerating}>
          {mode === "edit" ? (
            <Form.Group controlId="narrative-editor">
              <Form.Label className="text-body-secondary">
                Edit narrative (Markdown supported)
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={10}
                value={draft}
                onChange={(e) => setDraft(e.currentTarget.value)}
              />
            </Form.Group>
          ) : (
            <div className="text-body">
              {isGenerating && !narrative.trim() ? (
                <div className="d-flex flex-column gap-2">
                  <div className="skeleton-line skeleton-line--lg" style={{ width: "72%" }} />
                </div>
              ) : !hasNarrative && !isGenerating ? (
                <div className="text-center py-4 text-body-secondary">
                  <div className="mb-2" style={{ fontSize: "var(--text-lg)" }}>
                    No narrative yet
                  </div>
                  <div className="small">
                    Click <strong>Generate narrative</strong> to create an AI analysis of
                    the experiment results.
                  </div>
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
