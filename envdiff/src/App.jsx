import React, { useState } from "react";
import Header from "./components/Header";
import { processEnvDiff } from "./utils/diffEngine";
import {
  ArrowLeftRight,
  Download,
  Copy,
  Check,
  Play,
  RefreshCw,
} from "lucide-react";

const SAMPLE_A = `PORT=8000
DATABASE_URL=postgres://user:pass@localhost:5432/mydb
STRIPE_KEY=sk_live_992138129381239
ENABLE_FEATURE_X=true
CACHE_TTL=3600`;

const SAMPLE_B = `PORT=8000
DATABASE_URL=postgres://user:pass@staging-db:5432/mydb
ENABLE_FEATURE_X=false
API_TIMEOUT=5000`;

export default function App() {
  // Raw input state
  const [textA, setTextA] = useState(SAMPLE_A);
  const [textB, setTextB] = useState(SAMPLE_B);

  // Active state evaluated during "Execute"
  const [activeA, setActiveA] = useState(SAMPLE_A);
  const [activeB, setActiveB] = useState(SAMPLE_B);

  // Feedback states
  const [isExecuting, setIsExecuting] = useState(false);
  const [copiedType, setCopiedType] = useState(null);

  // Compute diff against active evaluated state
  const { results, summary } = processEnvDiff(activeA, activeB);

  // Functional Execution Trigger
  const handleExecute = () => {
    setIsExecuting(true);
    setActiveA(textA);
    setActiveB(textB);

    setTimeout(() => {
      setIsExecuting(false);
    }, 300);
  };

  // Swap Inputs & Re-evaluate
  const handleSwap = () => {
    const tempA = textA;
    const tempB = textB;
    setTextA(tempB);
    setTextB(tempA);
    setActiveA(tempB);
    setActiveB(tempA);
  };

  // Generate .env.example
  const generateExample = () => {
    const lines = activeA.split("\n").map((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return line;
      const parts = trimmed.split("=");
      const key = parts[0];
      return `${key}=your_${key.toLowerCase()}_here`;
    });
    return lines.join("\n");
  };

  // Copy to Clipboard
  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  // File Download Helper
  const handleDownloadFile = (filename, content) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#FBF8F3] text-stone-900 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Editor Split View */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
          {/* File A Editor */}
          <div className="bg-white border border-stone-300 rounded-lg p-4 shadow-xs">
            <div className="flex justify-between items-center mb-2">
              <span className="font-mono text-xs font-bold text-stone-600">
                File A (.env.production)
              </span>
              <button
                onClick={() => handleCopy(textA, "fileA")}
                className="text-xs text-stone-600 hover:text-stone-900 flex items-center space-x-1 cursor-pointer"
                title="Copy File A"
              >
                {copiedType === "fileA" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedType === "fileA" ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <textarea
              value={textA}
              onChange={(e) => setTextA(e.target.value)}
              className="w-full h-44 font-mono text-xs p-3 bg-stone-50 border border-stone-200 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-400 resize-none"
              placeholder="Paste .env content A..."
            />
          </div>

          {/* File B Editor */}
          <div className="bg-white border border-stone-300 rounded-lg p-4 shadow-xs">
            <div className="flex justify-between items-center mb-2">
              <span className="font-mono text-xs font-bold text-stone-600">
                File B (.env.local)
              </span>
              <button
                onClick={() => handleCopy(textB, "fileB")}
                className="text-xs text-stone-600 hover:text-stone-900 flex items-center space-x-1 cursor-pointer"
                title="Copy File B"
              >
                {copiedType === "fileB" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedType === "fileB" ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <textarea
              value={textB}
              onChange={(e) => setTextB(e.target.value)}
              className="w-full h-44 font-mono text-xs p-3 bg-stone-50 border border-stone-200 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-400 resize-none"
              placeholder="Paste .env content B..."
            />
          </div>

          {/* Swap Button */}
          <button
            onClick={handleSwap}
            className="absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2 bg-stone-900 text-white p-2.5 rounded-full shadow-md hover:bg-stone-800 transition-all cursor-pointer hidden md:flex items-center justify-center"
            title="Swap Files"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>
        </div>

        {/* Functional Execution Bar */}
        <div className="flex flex-wrap items-center justify-between bg-white p-4 border border-stone-300 rounded-lg gap-4 shadow-xs">
          {/* Functional EXECUTE Button */}
          <button
            onClick={handleExecute}
            disabled={isExecuting}
            className="flex items-center space-x-2 bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-all cursor-pointer shadow-sm active:scale-98 disabled:opacity-50"
          >
            {isExecuting ? (
              <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
            ) : (
              <Play className="w-4 h-4 text-amber-300 fill-amber-300" />
            )}
            <span>
              {isExecuting ? "Executing..." : "Execute Diff Comparison"}
            </span>
          </button>

          {/* Download Action Group */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() =>
                handleDownloadFile(".env.example", generateExample())
              }
              className="flex items-center space-x-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold px-3.5 py-2 rounded-md transition-all border border-stone-300 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .env.example</span>
            </button>
            <button
              onClick={() =>
                handleDownloadFile(
                  "envdiff-report.json",
                  JSON.stringify({ summary, results }, null, 2),
                )
              }
              className="flex items-center space-x-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold px-3.5 py-2 rounded-md transition-all border border-stone-300 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Report (JSON)</span>
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-white p-3 border border-stone-200 rounded-lg text-center">
            <div className="text-xs text-stone-600 font-medium">Total Keys</div>
            <div className="text-xl font-bold">{summary.total}</div>
          </div>
          <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-center text-red-900">
            <div className="text-xs font-medium">Missing in B</div>
            <div className="text-xl font-bold">{summary.missingInB}</div>
          </div>
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-center text-amber-900">
            <div className="text-xs font-medium">Missing in A</div>
            <div className="text-xl font-bold">{summary.missingInA}</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg text-center text-orange-900">
            <div className="text-xs font-medium">Type Mismatches</div>
            <div className="text-xl font-bold">{summary.mismatches}</div>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-center text-emerald-900">
            <div className="text-xs font-medium">Matches</div>
            <div className="text-xl font-bold">{summary.matches}</div>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white border border-stone-300 rounded-lg overflow-hidden shadow-xs">
          <div className="px-4 py-3 bg-stone-100 border-b border-stone-200 flex justify-between items-center">
            <h2 className="font-bold text-sm text-stone-800">
              Key Comparison Breakdown
            </h2>
            <button
              onClick={() => handleCopy(generateExample(), "example")}
              className="flex items-center space-x-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium px-3 py-1.5 rounded-md transition-all cursor-pointer"
            >
              {copiedType === "example" ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>
                {copiedType === "example"
                  ? "Copied Template"
                  : "Copy .env.example Template"}
              </span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-600">
                  <th className="p-3 font-semibold">Key Name</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold">File A Value</th>
                  <th className="p-3 font-semibold">File B Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {results.map((row) => (
                  <tr key={row.key} className="hover:bg-stone-50/80">
                    <td className="p-3 font-bold text-stone-900">{row.key}</td>
                    <td className="p-3">
                      {row.status === "MISSING_IN_B" && (
                        <span className="bg-red-100 text-red-800 border border-red-300 px-2 py-0.5 rounded-xs font-semibold">
                          Missing in B
                        </span>
                      )}
                      {row.status === "MISSING_IN_A" && (
                        <span className="bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-xs font-semibold">
                          Missing in A
                        </span>
                      )}
                      {row.status === "TYPE_MISMATCH" && (
                        <span className="bg-orange-100 text-orange-800 border border-orange-300 px-2 py-0.5 rounded-xs font-semibold">
                          Type Mismatch
                        </span>
                      )}
                      {row.status === "MATCH" && (
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-xs font-semibold">
                          Match
                        </span>
                      )}
                      {row.status === "EMPTY_VALUE" && (
                        <span className="bg-stone-200 text-stone-700 border border-stone-300 px-2 py-0.5 rounded-xs font-semibold">
                          Empty Value
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-stone-700 truncate max-w-xs">
                      {row.valA ?? (
                        <span className="text-stone-600 font-sans italic">
                          Not present
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-stone-700 truncate max-w-xs">
                      {row.valB ?? (
                        <span className="text-stone-600 font-sans italic">
                          Not present
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
