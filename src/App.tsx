import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { Layout } from "./components/Layout";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { HomePage } from "./pages/HomePage";

const Task1TablePage = lazy(() =>
  import("./pages/Task1TablePage").then((m) => ({ default: m.Task1TablePage })),
);
const ProcessFlowPage = lazy(() =>
  import("./components/Task2-ProcessFlow/ProcessFlowPage").then((m) => ({ default: m.ProcessFlowPage })),
);
const ReportPage = lazy(() =>
  import("./components/Task3-ReportGenerator/ReportPage").then((m) => ({ default: m.ReportPage })),
);
const DashboardPage = lazy(() =>
  import("./components/Task4-Dashboard/DashboardPage").then((m) => ({ default: m.DashboardPage })),
);

function RouteFallback() {
  return (
    <div className="p-4 text-body-secondary" aria-live="polite">
      Loading…
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/task-1"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <Task1TablePage />
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

