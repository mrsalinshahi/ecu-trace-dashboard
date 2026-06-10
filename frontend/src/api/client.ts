import axios from "axios";
import type {
  AnalysisResult,
  AnalysisSummary,
  DashboardStats,
  TestRunDetail,
  TestRunSummary,
  TraceRecord,
  Severity,
} from "../types";

const http = axios.create({
  baseURL: "/api",
  timeout: 60_000,
});

export const api = {
  // Dashboard
  getDashboardStats(): Promise<DashboardStats> {
    return http.get("/dashboard-stats").then((r) => r.data);
  },

  // Test runs
  getTestRuns(skip = 0, limit = 50): Promise<TestRunSummary[]> {
    return http.get("/test-runs", { params: { skip, limit } }).then((r) => r.data);
  },

  getTestRun(id: number): Promise<TestRunDetail> {
    return http.get(`/test-runs/${id}`).then((r) => r.data);
  },

  getTraceRecords(
    runId: number,
    signal?: string,
    limit = 1000
  ): Promise<TraceRecord[]> {
    return http
      .get(`/test-runs/${runId}/records`, {
        params: { signal_name: signal, limit },
      })
      .then((r) => r.data);
  },

  // Analysis
  getAnalysis(
    runId: number,
    severity?: Severity,
    limit = 500
  ): Promise<AnalysisResult[]> {
    return http
      .get(`/analysis/${runId}`, { params: { severity, limit } })
      .then((r) => r.data);
  },

  getAnalysisSummary(runId: number): Promise<AnalysisSummary> {
    return http.get(`/analysis/${runId}/summary`).then((r) => r.data);
  },

  // Upload
  uploadTrace(
    file: File,
    description?: string,
    onProgress?: (pct: number) => void
  ): Promise<TestRunDetail> {
    const form = new FormData();
    form.append("file", file);
    if (description) form.append("description", description);

    return http
      .post("/upload-trace", form, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (e.total && onProgress) {
            onProgress(Math.round((e.loaded / e.total) * 100));
          }
        },
      })
      .then((r) => r.data);
  },
};
