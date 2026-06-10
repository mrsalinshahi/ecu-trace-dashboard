import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { clsx } from "clsx";
import { api } from "../api/client";
import { Card } from "../components/ui/Card";

type UploadState = "idle" | "uploading" | "success" | "error";

export function UploadTrace() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [progress, setProgress] = useState(0);
  const [state, setState] = useState<UploadState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) {
      setFile(accepted[0]);
      setState("idle");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/json": [".json"],
      "text/plain": [".asc"],
    },
    maxFiles: 1,
    disabled: state === "uploading",
  });

  async function handleUpload() {
    if (!file) return;
    setState("uploading");
    setProgress(0);
    setErrorMsg("");

    try {
      const run = await api.uploadTrace(file, description || undefined, setProgress);
      setState("success");
      setTimeout(() => navigate(`/analysis/${run.id}`), 1000);
    } catch (err: unknown) {
      setState("error");
      const msg =
        err instanceof Error
          ? err.message
          : "Upload failed. Check the file format.";
      setErrorMsg(msg);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Upload Trace File</h1>
        <p className="text-slate-400 text-sm mt-1">
          Supports CSV, JSON, and ASC (Vector CANalyzer) formats
        </p>
      </div>

      {/* Drop zone */}
      <Card>
        <div
          {...getRootProps()}
          className={clsx(
            "border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors",
            isDragActive
              ? "border-brand-500 bg-brand-500/5"
              : file
              ? "border-green-500/50 bg-green-500/5"
              : "border-slate-700 hover:border-slate-600 hover:bg-slate-800/50"
          )}
        >
          <input {...getInputProps()} />
          {file ? (
            <div className="flex flex-col items-center gap-3">
              <FileText className="w-10 h-10 text-green-400" />
              <div>
                <p className="font-medium text-slate-200">{file.name}</p>
                <p className="text-sm text-slate-500 mt-0.5">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <p className="text-xs text-slate-500">
                Drop a new file to replace
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Upload
                className={clsx(
                  "w-10 h-10",
                  isDragActive ? "text-brand-400" : "text-slate-500"
                )}
              />
              <div>
                <p className="font-medium text-slate-300">
                  {isDragActive
                    ? "Drop the file here"
                    : "Drag & drop your trace file"}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  or click to browse — .csv, .json, .asc
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Description */}
      <Card title="Description (optional)">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., Engine cold-start test, highway cruise, braking event..."
          rows={3}
          className="input resize-none"
        />
      </Card>

      {/* Progress */}
      {state === "uploading" && (
        <div className="card space-y-2">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
            Uploading and analysing...
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 text-right">{progress}%</p>
        </div>
      )}

      {state === "success" && (
        <div className="card flex items-center gap-3 border-green-500/30 bg-green-500/5">
          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
          <p className="text-sm text-green-300">
            Upload complete — redirecting to analysis...
          </p>
        </div>
      )}

      {state === "error" && (
        <div className="card flex items-center gap-3 border-red-500/30 bg-red-500/5">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-300">{errorMsg}</p>
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleUpload}
        disabled={!file || state === "uploading" || state === "success"}
        className="btn-primary w-full justify-center py-3"
      >
        {state === "uploading" ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Analysing trace...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            Upload & Analyse
          </>
        )}
      </button>

      {/* Format hints */}
      <Card title="Supported Formats">
        <div className="space-y-3 text-sm text-slate-400">
          <FormatHint
            ext=".csv"
            desc="Columns: timestamp, signal_name, value — optional: unit, bus_channel, message_id"
          />
          <FormatHint
            ext=".json"
            desc='Array of records or {"records": [...]} — each with timestamp, signal_name, value'
          />
          <FormatHint
            ext=".asc"
            desc="Vector CANalyzer ASCII log — standard CAN bus message format"
          />
        </div>
      </Card>
    </div>
  );
}

function FormatHint({ ext, desc }: { ext: string; desc: string }) {
  return (
    <div className="flex gap-3">
      <span className="font-mono text-brand-400 text-xs bg-brand-500/10 border border-brand-500/20 px-1.5 py-0.5 rounded self-start">
        {ext}
      </span>
      <span className="text-xs leading-relaxed">{desc}</span>
    </div>
  );
}
