import { Fragment } from "react";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Form from "react-bootstrap/Form";
import Stack from "react-bootstrap/Stack";
import {
  CaretDoubleLeftIcon,
  CaretDoubleRightIcon,
  CaretLeftIcon,
  CaretRightIcon,
} from "@phosphor-icons/react";

export type PaginationProps = {
  page: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  startItem: number;
  endItem: number;
  pageSizeOptions: number[];
  onPageChange: (nextPage: number) => void;
  onPageSizeChange: (nextPageSize: number) => void;
};

// Keep a number within [min, max]. Helps avoid out-of-range page numbers.
function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

// Create a small list of pages around the current page, plus first/last.
// The UI inserts an ellipsis ("…") whenever there's a gap.
function buildPageList(page: number, totalPages: number) {
  const pages = new Set<number>();
  pages.add(1);
  pages.add(totalPages);
  for (let p = page - 2; p <= page + 2; p++) pages.add(p);
  return Array.from(pages)
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);
}

/** Pagination controls and page-size selector for tables. */
export function Pagination({
  page,
  totalPages,
  pageSize,
  totalItems,
  startItem,
  endItem,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const safeTotalPages = Math.max(1, totalPages);
  const safePage = clamp(page, 1, safeTotalPages);
  const pages = buildPageList(safePage, safeTotalPages);

  return (
    <Stack
      direction="horizontal"
      className="justify-content-between flex-wrap gap-3 pagination-bar"
    >
      <ButtonGroup aria-label="Pagination controls">
        <Button
          className="touch-target-min"
          variant="outline-secondary"
          onClick={() => onPageChange(1)}
          disabled={safePage === 1}
          aria-label="First page"
        >
          <CaretDoubleLeftIcon size={18} weight="bold" aria-hidden="true" />
        </Button>
        <Button
          className="touch-target-min"
          variant="outline-secondary"
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage === 1}
          aria-label="Previous page"
        >
          <CaretLeftIcon size={18} weight="bold" aria-hidden="true" />
        </Button>
        {pages.map((p, i) => (
          <Fragment key={p}>
            {/* Insert a disabled ellipsis button when we skip page numbers. */}
            {i > 0 && p - pages[i - 1] > 1 && (
              <Button
                className="touch-target-min"
                variant="outline-secondary"
                disabled
                aria-hidden="true"
              >
                …
              </Button>
            )}
            <Button
              className="touch-target-min"
              variant={p === safePage ? "secondary" : "outline-secondary"}
              onClick={() => onPageChange(p)}
              aria-label={`Page ${p}`}
              aria-current={p === safePage ? "page" : undefined}
            >
              {p}
            </Button>
          </Fragment>
        ))}
        <Button
          className="touch-target-min"
          variant="outline-secondary"
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage === safeTotalPages}
          aria-label="Next page"
        >
          <CaretRightIcon size={18} weight="bold" aria-hidden="true" />
        </Button>
        <Button
          className="touch-target-min"
          variant="outline-secondary"
          onClick={() => onPageChange(safeTotalPages)}
          disabled={safePage === safeTotalPages}
          aria-label="Last page"
        >
          <CaretDoubleRightIcon size={18} weight="bold" aria-hidden="true" />
        </Button>
      </ButtonGroup>

      <div className="text-body-secondary tabular-nums" style={{ fontSize: "var(--text-sm)" }}>
        {totalItems === 0 ? "No results" : `Showing ${startItem}-${endItem} of ${totalItems}`}
      </div>

      <Form className="d-flex align-items-center gap-2">
        <Form.Label className="m-0" htmlFor="page-size">
          Rows/page
        </Form.Label>
        <Form.Select
          id="page-size"
          className="touch-target-min"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          style={{ width: "var(--size-page-size-select, 110px)" }}
        >
          {pageSizeOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </Form.Select>
      </Form>
    </Stack>
  );
}

