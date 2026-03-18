import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { Layout } from "./components/Layout";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { HomePage } from "./pages/HomePage";

// Each task page is lazy-loaded so the initial bundle stays small.
const TablePage = lazy(() =>
  import("./pages/TablePage").then((m) => ({ default: m.TablePage }))
);
const ProcessFlowPage = lazy(() =>
  import("./pages/ProcessFlowPage").then((m) => ({ default: m.ProcessFlowPage }))
);
const ReportPage = lazy(() =>
  import("./pages/ReportPage").then((m) => ({
    default: m.ReportPage,
  }))
);
const DashboardPage = lazy(() =>
  import("./pages/DashboardPage").then((m) => ({
    default: m.DashboardPage,
  }))
);

/** Loading placeholder shown while a lazy-loaded route chunk downloads. */
function RouteFallback() {
  return (
    <div className="p-4 text-body-secondary" aria-live="polite">
      Loading…
    </div>
  );
}

/** App routes and lazy-loading entrypoint. */
export default function App() {
  return (
    <BrowserRouter>
      {/* Catch render-time crashes and show a friendly fallback UI. */}
      <ErrorBoundary>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/task-1"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <TablePage />
                </Suspense>
              }
            />
            <Route
              path="/task-2"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <ProcessFlowPage />
                </Suspense>
              }
            />
            <Route
              path="/task-3"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <ReportPage />
                </Suspense>
              }
            />
            <Route
              path="/task-4"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <DashboardPage />
                </Suspense>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
