import React, { useState, useMemo } from "react";
import Header from "./components/Header";
import { processEnvDiff } from "./utils/diffEngine";
import { compressToHash } from "./utils/compressor";
import {
  ArrowLeftRight,
  Download,
  Copy,
  Check,
  RotateCcw,
  Share2,
  Trash2,
  Sparkles,
  Upload,
  Search,
} from "lucide-react";

const SAMPLE_A = `PORT=8000
NODE_ENV=production
DATABASE_URL=your_production_database_url_here
REDIS_URL=your_production_redis_url_here
ENABLE_ANALYTICS=true
JWT_SECRET=your_production_jwt_secret_here
STRIPE_KEY=your_production_api_key_here
MAX_CONNECTIONS=100
ALLOWED_ORIGINS=["https://yourdomain.com"]`;

const SAMPLE_B = `PORT=3000
NODE_ENV=development
DATABASE_URL=your_local_database_url_here
REDIS_URL=your_local_redis_url_here
ENABLE_ANALYTICS=false
JWT_SECRET=your_local_jwt_secret_here
STRIPE_KEY=
DEBUG_MODE=true
LOCAL_MOCK_SERVER=localhost`;

export default function App() {
  const [textA, setTextA] = useState(SAMPLE_A);
  const [textB, setTextB] = useState(SAMPLE_B);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");
  const [copiedKey, setCopiedKey] = useState(null);
  const [copiedTemplate, setCopiedTemplate] = useState(false);
  const [secretPlaceholder, setSecretPlaceholder] = useState("your_value_here");
  const [shareNotice, setShareNotice] = useState(false);

  // Process Diff
  const { results, summary } = useMemo(
    () => processEnvDiff(textA, textB),
    [textA, textB],
  );

  // Filtered results based on search & tabs
  const filteredResults = useMemo(() => {
    return results.filter((row) => {
      const matchesSearch = row.key
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (activeTab === "MISSING")
        return (
          row.status === "MISSING_IN_B" ||
          row.status === "MISSING_IN_A" ||
          row.status === "EXTRA_IN_B"
        );
      if (activeTab === "MISMATCH")
        return row.status === "TYPE_MISMATCH" || row.status === "EMPTY_VALUE";
      if (activeTab === "MATCH") return row.status === "MATCH";
      return true; // ALL
    });
  }, [results, searchQuery, activeTab]);

  const handleSwap = () => {
    const temp = textA;
    setTextA(textB);
    setTextB(temp);
  };

  const handleClear = () => {
    setTextA("");
    setTextB("");
  };

  const handleReloadSample = () => {
    setTextA(SAMPLE_A);
    setTextB(SAMPLE_B);
  };

  const handleCleanAndSort = () => {
    const sortEnv = (txt) => {
      const lines = txt.split("\n");
      const comments = lines.filter(
        (l) => l.trim().startsWith("#") || !l.trim(),
      );
      const kvs = lines
        .filter((l) => l.trim() && !l.trim().startsWith("#"))
        .sort();
      return [...comments, ...kvs].join("\n");
    };
    setTextA(sortEnv(textA));
    setTextB(sortEnv(textB));
  };

  const handleShareHash = () => {
    const compressed = compressToHash({ a: textA, b: textB });
    const shareUrl = `${window.location.origin}${window.location.pathname}#data=${compressed}`;
    navigator.clipboard.writeText(shareUrl);
    setShareNotice(true);
    setTimeout(() => setShareNotice(false), 2500);
  };

  const handleFileUpload = (e, setter) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setter(event.target.result);
    reader.readAsText(file);
  };

  const generateExample = () => {
    const lines = textA.split("\n").map((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return line;
      const key = trimmed.split("=")[0];
      return `${key}=${secretPlaceholder}`;
    });
    return lines.join("\n");
  };

  const handleCopyText = (text, identifier) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(identifier);
    setTimeout(() => setCopiedKey(null), 2000);
  };

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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      {/* Top Banner Notice */}
      <div className="bg-slate-900 text-cyan-300 text-center py-2 text-xs font-mono font-medium tracking-wide flex items-center justify-center space-x-2 border-b border-slate-800">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
        <span>
          100% Client-Side Executed • Zero secrets or environment variables
          leave your local browser memory.
        </span>
      </div>

      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* Top Secondary Action Bar */}
        <div className="flex flex-wrap items-center justify-between bg-white border border-slate-200 p-4 rounded-xl shadow-sm gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSwap}
              className="flex items-center space-x-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 px-3.5 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-all active:scale-95"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-slate-500" />
              <span>Swap A ⇄ B</span>
            </button>
            <button
              onClick={handleClear}
              className="flex items-center space-x-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 px-3.5 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-all active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              <span>Clear All</span>
            </button>
            <button
              onClick={handleCleanAndSort}
              className="flex items-center space-x-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 px-3.5 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Clean & Sort Keys</span>
            </button>
          </div>

          <div className="flex items-center space-x-6 font-mono text-xs font-medium bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
            <span className="text-slate-600">
              Total Keys:{" "}
              <span className="text-slate-900 font-bold">{summary.total}</span>
            </span>
            <span className="text-slate-600">
              Discrepancies:{" "}
              <span className="text-amber-600 font-bold">
                {summary.missingInB + summary.missingInA + summary.mismatches}
              </span>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleReloadSample}
              className="flex items-center space-x-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 px-3.5 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reload Sample</span>
            </button>
            <button
              onClick={handleShareHash}
              className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-all shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>{shareNotice ? "URL Copied!" : "Share URL Hash"}</span>
            </button>
          </div>
        </div>

        {/* Dual Editor Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* File A */}
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs flex flex-col transition-all hover:border-slate-300">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="bg-slate-900 text-white px-2.5 py-1 font-mono text-[11px] font-bold rounded-md">
                  FILE A
                </span>
                <span className="font-mono text-xs font-semibold text-slate-600">
                  .env.production
                </span>
              </div>
              <div className="flex items-center space-x-3 font-mono text-xs text-slate-600">
                <label className="cursor-pointer hover:text-slate-900 flex items-center space-x-1 transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, setTextA)}
                  />
                </label>
                <span>•</span>
                <button
                  onClick={() => handleCopyText(textA, "fileA")}
                  className="hover:text-slate-900 flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedKey === "fileA" ? "Copied!" : "Copy"}</span>
                </button>
              </div>
            </div>
            <textarea
              value={textA}
              onChange={(e) => setTextA(e.target.value)}
              className="w-full h-72 font-mono text-xs p-3.5 bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 resize-y"
              placeholder="Paste production .env..."
            />
          </div>

          {/* File B */}
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs flex flex-col transition-all hover:border-slate-300">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="bg-indigo-600 text-white px-2.5 py-1 font-mono text-[11px] font-bold rounded-md">
                  FILE B
                </span>
                <span className="font-mono text-xs font-semibold text-slate-600">
                  .env.local
                </span>
              </div>
              <div className="flex items-center space-x-3 font-mono text-xs text-slate-600">
                <label className="cursor-pointer hover:text-slate-900 flex items-center space-x-1 transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, setTextB)}
                  />
                </label>
                <span>•</span>
                <button
                  onClick={() => handleCopyText(textB, "fileB")}
                  className="hover:text-slate-900 flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedKey === "fileB" ? "Copied!" : "Copy"}</span>
                </button>
              </div>
            </div>
            <textarea
              value={textB}
              onChange={(e) => setTextB(e.target.value)}
              className="w-full h-72 font-mono text-xs p-3.5 bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-400 resize-y"
              placeholder="Paste local .env..."
            />
          </div>
        </div>

        {/* Comparative Variable Analysis Section */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          {/* Table Header Bar */}
          <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-slate-500" />
              <h2 className="font-bold text-sm tracking-tight text-slate-800">
                Comparative Variable Analysis
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Filter key name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white border border-slate-300 px-3 py-1.5 text-xs font-mono w-48 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                />
              </div>

              {/* Tabs */}
              <div className="flex bg-slate-200/70 p-0.5 rounded-lg border border-slate-300 text-xs font-mono font-semibold">
                <button
                  onClick={() => setActiveTab("ALL")}
                  className={`px-3 py-1 rounded-md cursor-pointer transition-all ${activeTab === "ALL" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
                >
                  All ({results.length})
                </button>
                <button
                  onClick={() => setActiveTab("MISSING")}
                  className={`px-3 py-1 rounded-md cursor-pointer transition-all ${activeTab === "MISSING" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
                >
                  Missing ({summary.missingInB + summary.missingInA})
                </button>
                <button
                  onClick={() => setActiveTab("MISMATCH")}
                  className={`px-3 py-1 rounded-md cursor-pointer transition-all ${activeTab === "MISMATCH" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
                >
                  Mismatch ({summary.mismatches})
                </button>
                <button
                  onClick={() => setActiveTab("MATCH")}
                  className={`px-3 py-1 rounded-md cursor-pointer transition-all ${activeTab === "MATCH" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
                >
                  Match ({summary.matches})
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-500">
                  <th className="p-3.5 font-bold tracking-wide">
                    VARIABLE KEY
                  </th>
                  <th className="p-3.5 font-bold tracking-wide">DIFF STATUS</th>
                  <th className="p-3.5 font-bold tracking-wide">
                    FILE A VALUE & TYPE
                  </th>
                  <th className="p-3.5 font-bold tracking-wide">
                    FILE B VALUE & TYPE
                  </th>
                  <th className="p-3.5 font-bold tracking-wide text-right">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredResults.map((row) => (
                  <tr
                    key={row.key}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="p-3.5 font-bold text-slate-900">
                      {row.key}
                    </td>
                    <td className="p-3.5">
                      {row.status === "MISSING_IN_B" && (
                        <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-1 rounded-md text-[10px] font-bold">
                          MISSING IN B
                        </span>
                      )}
                      {row.status === "MISSING_IN_A" && (
                        <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-1 rounded-md text-[10px] font-bold">
                          MISSING IN A
                        </span>
                      )}
                      {row.status === "EXTRA_IN_B" && (
                        <span className="bg-indigo-50 text-indigo-800 border border-indigo-200 px-2 py-1 rounded-md text-[10px] font-bold">
                          EXTRA IN B
                        </span>
                      )}
                      {row.status === "TYPE_MISMATCH" && (
                        <span className="bg-orange-50 text-orange-800 border border-orange-200 px-2 py-1 rounded-md text-[10px] font-bold">
                          TYPE MISMATCH
                        </span>
                      )}
                      {row.status === "MATCH" && (
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-1 rounded-md text-[10px] font-bold">
                          MATCH
                        </span>
                      )}
                      {row.status === "EMPTY_VALUE" && (
                        <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-1 rounded-md text-[10px] font-bold">
                          EMPTY VALUE
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-700 max-w-xs truncate">
                      {row.valA !== null ? (
                        <div>
                          <div className="truncate">{row.valA}</div>
                          <div className="text-[10px] text-slate-400 capitalize">
                            {row.typeA}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic font-sans">
                          — absent in .env.production —
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-700 max-w-xs truncate">
                      {row.valB !== null ? (
                        <div>
                          <div className="truncate">{row.valB}</div>
                          <div className="text-[10px] text-slate-400 capitalize">
                            {row.typeB}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic font-sans">
                          — absent in .env.local —
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() =>
                          handleCopyText(
                            `${row.key}=${row.valB ?? row.valA}`,
                            row.key,
                          )
                        }
                        className="p-1.5 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer inline-flex items-center justify-center text-slate-600 transition-colors"
                        title="Copy Key-Value"
                      >
                        {copiedKey === row.key ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sanitized Template Exporter Section */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-slate-800">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            <h2 className="font-bold text-sm tracking-tight uppercase">
              Sanitized Template Exporter
            </h2>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <h3 className="text-base font-bold text-slate-900">
                Generate .env.example
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Creates a production-safe template combining union keys from
                File A and File B. Automatically strips secrets, passwords, and
                sensitive keys, replacing them with standard mock placeholders.
              </p>

              <div className="flex items-center space-x-2 pt-2">
                <span className="text-xs font-mono font-medium text-slate-700">
                  Secret Placeholder:
                </span>
                <input
                  type="text"
                  value={secretPlaceholder}
                  onChange={(e) => setSecretPlaceholder(e.target.value)}
                  className="bg-slate-50 border border-slate-300 px-3 py-1.5 text-xs font-mono rounded-lg w-48 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() =>
                  handleDownloadFile(".env.example", generateExample())
                }
                className="flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-5 py-3 rounded-lg shadow-sm cursor-pointer transition-all active:scale-95"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>DOWNLOAD .ENV.EXAMPLE</span>
              </button>
              <button
                onClick={() => {
                  handleCopyText(generateExample(), "template");
                  setCopiedTemplate(true);
                  setTimeout(() => setCopiedTemplate(false), 2000);
                }}
                className="flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs px-5 py-3 rounded-lg border border-slate-300 cursor-pointer transition-all active:scale-95"
              >
                <Copy className="w-4 h-4 text-slate-500" />
                <span>
                  {copiedTemplate ? "Copied Template!" : "Copy Template Text"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-6 py-4 mt-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between text-xs font-mono text-slate-500 gap-4">
          <div>EnvDiff &copy; 2026 Client-Side Dev Utilities</div>
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Local Sandbox Active</span>
            </span>
            <span>•</span>
            <a
              href="#"
              target="_blank"
              rel="noreferrer"
              className="hover:underline font-bold text-slate-800"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
