import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { UploadTrace } from "./pages/UploadTrace";
import { TestRuns } from "./pages/TestRuns";
import { AnalysisDetail } from "./pages/AnalysisDetail";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="upload" element={<UploadTrace />} />
          <Route path="test-runs" element={<TestRuns />} />
          <Route path="analysis/:runId" element={<AnalysisDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
