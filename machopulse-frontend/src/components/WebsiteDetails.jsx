import { useState, useMemo, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { websiteService } from "../api/websiteService";
import Header from "./Header";
import WebsiteSettings from "./WebsiteSettings";
import {
  ArrowLeft,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  AlertTriangle,
  Settings,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

// Helper function to safely parse backend LocalDateTime strings as UTC
const parseUtcDate = (dateString) => {
  if (!dateString) return null;
  const fixedString =
    dateString.endsWith("Z") || dateString.includes("+")
      ? dateString
      : dateString + "Z";
  return new Date(fixedString);
};

export default function WebsiteDetails() {
  const { id } = useParams();
  const [period, setPeriod] = useState("24h");
  const [pingStatusMessage, setPingStatusMessage] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const queryClient = useQueryClient();

  // Fetch website metadata
  const {
    data: website,
    isError: isWebsiteError,
    refetch: refetchWebsite,
  } = useQuery({
    queryKey: ["website", id],
    queryFn: () => websiteService.getWebsiteById(id),
    enabled: !!id,
  });

  // Fetch summary stats (polls every 30s)
  const {
    data: stats,
    isPending: isStatsLoading,
    isError: isStatsError,
  } = useQuery({
    queryKey: ["websiteStats", id, period],
    queryFn: () => websiteService.getWebsiteStats(id, period),
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
    enabled: !!id,
  });

  // Fetch ping logs (polls every 10s)
  const {
    data: logs = [],
    isPending: isLogsLoading,
    isError: isLogsError,
    refetch: refetchLogs,
  } = useQuery({
    queryKey: ["websiteLogs", id],
    queryFn: () => websiteService.getWebsiteLogs(id, 50),
    refetchInterval: 10000,
    refetchIntervalInBackground: false,
    enabled: !!id,
  });

  // Manual trigger with auto-dismissing status alert
  const pingMutation = useMutation({
    mutationFn: () => websiteService.triggerManualPing(id),
    onSuccess: () => {
      setPingStatusMessage({ type: "success", text: "✓ Pinged" });
      queryClient.invalidateQueries({ queryKey: ["website", id], exact: true });
      queryClient.invalidateQueries({
        queryKey: ["websiteLogs", id],
        exact: true,
      });
      queryClient.invalidateQueries({ queryKey: ["websiteStats", id] });
      queryClient.invalidateQueries({ queryKey: ["websites"], exact: true });
    },
    onError: () => {
      setPingStatusMessage({ type: "error", text: "✕ Failed" });
    },
  });

  // Hide ping notification after 3s
  useEffect(() => {
    if (!pingStatusMessage) return;
    const timer = setTimeout(() => setPingStatusMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [pingStatusMessage]);

  // Format chart data by date and cache it for safe timezone handling
  const chartData = useMemo(() => {
    if (!Array.isArray(logs) || logs.length === 0) return [];

    return [...logs]
      .sort((a, b) => {
        const dateA = parseUtcDate(a.timestamp || a.createdAt);
        const dateB = parseUtcDate(b.timestamp || b.createdAt);
        return dateA - dateB;
      })
      .map((log) => {
        const rawDate = parseUtcDate(log.timestamp || log.createdAt);
        return {
          rawTime: log.timestamp || log.createdAt,
          time: rawDate
            ? rawDate.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "N/A",
          responseTimeMs:
            typeof log.responseTimeMs === "number" ? log.responseTimeMs : 0,
          status: log.isUp ? "UP" : "DOWN",
          code: log.statusCode ?? "ERR",
        };
      });
  }, [logs]);

  if (isWebsiteError) {
    return (
      <div className="min-h-screen text-black font-mono bg-white">
        <Header />
        <main className="max-w-6xl mx-auto p-4 md:p-8">
          <div className="border border-red-200 bg-red-50 p-6 text-center space-y-4">
            <AlertTriangle className="w-8 h-8 text-red-600 mx-auto" />
            <h2 className="text-sm font-bold uppercase text-red-900">
              Failed to load website monitor configuration
            </h2>
            <p className="text-xs text-red-700">
              The requested target ID could not be retrieved from the server.
            </p>
            <div className="flex justify-center gap-4 pt-2">
              <Link
                to="/dashboard"
                className="border border-black bg-white px-3 py-1.5 text-xs font-bold uppercase hover:bg-neutral-100"
              >
                Return to Dashboard
              </Link>
              <button
                onClick={() => refetchWebsite()}
                className="border border-black bg-black text-white px-3 py-1.5 text-xs font-bold uppercase hover:bg-neutral-800 cursor-pointer"
              >
                Retry Request
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-black font-mono pb-12 bg-white">
      <Header />

      <main className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
        {/* Navigation & Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAEAEA] pb-4">
          <div className="space-y-1">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase text-[#666] hover:text-black transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
            {website ? (
              <h1 className="text-lg font-bold uppercase tracking-tight block">
                {website.name}{" "}
                <span className="text-xs font-normal text-[#666]">
                  ({website.url})
                </span>
              </h1>
            ) : (
              <div className="h-6 w-48 bg-neutral-100 animate-pulse" />
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Temporary manual ping status alert */}
            {pingStatusMessage && (
              <span
                className={`text-[10px] font-bold uppercase ${
                  pingStatusMessage.type === "success"
                    ? "text-emerald-600"
                    : "text-red-600"
                }`}
              >
                {pingStatusMessage.text}
              </span>
            )}

            {/* Manual Trigger Action */}
            <button
              onClick={() => pingMutation.mutate()}
              disabled={pingMutation.isPending}
              aria-label="Trigger manual site ping"
              className="inline-flex items-center gap-2 border border-black bg-black text-white px-3 py-1.5 text-xs font-bold uppercase hover:bg-[#FF5500] hover:border-[#FF5500] transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  pingMutation.isPending ? "animate-spin" : ""
                }`}
              />
              {pingMutation.isPending ? "Pinging..." : "Ping Now"}
            </button>

            {/* Settings Modal Toggle Button */}
            <button
              onClick={() => setShowSettingsModal(true)}
              aria-label="Open monitor settings"
              className="inline-flex items-center gap-2 border border-[#EAEAEA] bg-white text-black px-3 py-1.5 text-xs font-bold uppercase hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-[#FF5500]" />
              Settings
            </button>

            {/* Timeframe Selector */}
            <div className="flex gap-1 border border-[#EAEAEA] bg-white p-1 text-xs font-bold">
              {["24h", "7d", "30d"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1 cursor-pointer uppercase transition-colors ${
                    period === p
                      ? "bg-black text-white"
                      : "text-[#666] hover:bg-neutral-100"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Telemetry Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="border border-[#EAEAEA] bg-white p-4 shadow-xs">
            <span className="text-[10px] uppercase text-[#666] font-semibold flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-600" /> Uptime (
              {period})
            </span>
            <span className="text-2xl font-bold text-black mt-1 block">
              {isStatsLoading
                ? "..."
                : isStatsError || stats?.uptimePercentage == null
                  ? "N/A"
                  : `${stats.uptimePercentage}%`}
            </span>
          </div>

          <div className="border border-[#EAEAEA] bg-white p-4 shadow-xs">
            <span className="text-[10px] uppercase text-[#666] font-semibold flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#FF5500]" /> Avg Latency
            </span>
            <span className="text-2xl font-bold text-black mt-1 block">
              {isStatsLoading
                ? "..."
                : isStatsError || stats?.avgResponseTimeMs == null
                  ? "N/A"
                  : `${stats.avgResponseTimeMs} ms`}
            </span>
          </div>

          <div className="border border-[#EAEAEA] bg-white p-4 shadow-xs">
            <span className="text-[10px] uppercase text-[#666] font-semibold flex items-center gap-1">
              <Activity className="w-3 h-3 text-blue-600" /> Total Checks
            </span>
            <span className="text-2xl font-bold text-black mt-1 block">
              {isStatsLoading
                ? "..."
                : isStatsError
                  ? "N/A"
                  : (stats?.totalChecks ?? 0)}
            </span>
          </div>

          <div className="border border-[#EAEAEA] bg-white p-4 shadow-xs">
            <span className="text-[10px] uppercase text-[#666] font-semibold flex items-center gap-1">
              <XCircle className="w-3 h-3 text-red-600" /> Incidents
            </span>
            <span
              className={`text-2xl font-bold mt-1 block ${
                stats?.totalDown > 0 ? "text-red-600" : "text-black"
              }`}
            >
              {isStatsLoading
                ? "..."
                : isStatsError
                  ? "N/A"
                  : (stats?.totalDown ?? 0)}
            </span>
          </div>
        </section>

        {/* Latency trend chart panel */}
        <section className="border border-[#EAEAEA] bg-white p-4 shadow-xs">
          <div className="mb-4 flex justify-between items-start">
            <div>
              <h3 className="text-xs font-bold uppercase text-black">
                Response Latency (ms)
              </h3>
              <p className="text-[10px] text-[#666]">
                Real-time monitor history
              </p>
            </div>
            {isLogsError && (
              <button
                onClick={() => refetchLogs()}
                className="text-[10px] font-bold uppercase text-red-600 hover:underline cursor-pointer"
              >
                Retry Logs
              </button>
            )}
          </div>

          {isLogsLoading ? (
            <div className="h-64 flex items-center justify-center text-xs text-[#666] uppercase animate-pulse">
              Loading Chart Data...
            </div>
          ) : isLogsError ? (
            <div className="h-64 flex flex-col items-center justify-center gap-2 text-xs text-red-600 uppercase border border-dashed border-red-200 bg-red-50/50">
              <AlertTriangle className="w-5 h-5" />
              <span>Unable to load latency metrics</span>
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-[#666] uppercase">
              No telemetry entries recorded yet.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 10, right: 15, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#EAEAEA" />
                  <XAxis
                    dataKey="time"
                    stroke="#666"
                    fontSize={10}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#666"
                    fontSize={10}
                    tickLine={false}
                    unit="ms"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #EAEAEA",
                      borderRadius: "0px",
                      fontSize: "11px",
                      fontFamily: "monospace",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="responseTimeMs"
                    name="Latency"
                    stroke="#FF5500"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        {/* Recent activity log table */}
        <section className="border border-[#EAEAEA] bg-white shadow-xs">
          <div className="border-b border-[#EAEAEA] px-4 py-3 bg-neutral-50 flex justify-between items-center">
            <span className="text-xs font-bold uppercase text-black">
              Recent Ping Log History
            </span>
            <span className="text-xs text-[#666]">
              {isLogsLoading ? "Loading..." : `Last ${logs.length} pings`}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#EAEAEA] bg-neutral-50 text-[10px] uppercase text-[#666]">
                  <th className="p-3">Status</th>
                  <th className="p-3">HTTP Code</th>
                  <th className="p-3">Latency</th>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Error Diagnostic</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEAEA]">
                {isLogsLoading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-8 text-center text-[#666] uppercase"
                    >
                      Loading ping logs...
                    </td>
                  </tr>
                ) : isLogsError ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-8 text-center text-red-600 uppercase"
                    >
                      Failed to fetch ping log history.
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-8 text-center text-[#666] uppercase"
                    >
                      No logs available.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => {
                    const parsedDate = parseUtcDate(
                      log.timestamp || log.createdAt,
                    );
                    return (
                      <tr
                        key={log.id}
                        className="hover:bg-neutral-50 transition-colors"
                      >
                        <td className="p-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold border ${
                              log.isUp
                                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                : "border-red-500 bg-red-50 text-red-700"
                            }`}
                          >
                            {log.isUp ? "PASS" : "FAIL"}
                          </span>
                        </td>
                        <td className="p-3 font-semibold">
                          {log.statusCode ?? "N/A"}
                        </td>
                        <td className="p-3 text-[#666]">
                          {typeof log.responseTimeMs === "number"
                            ? `${log.responseTimeMs} ms`
                            : "-"}
                        </td>
                        <td className="p-3 text-[#666]">
                          {parsedDate ? parsedDate.toLocaleString() : "-"}
                        </td>
                        <td className="p-3 text-red-600 wrap-break-word max-w-md">
                          {log.errorMessage || "-"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Modal Overlay for Settings */}
        {showSettingsModal && website && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="relative w-full max-w-2xl bg-white border border-black shadow-xl max-h-[90vh] overflow-y-auto">
              <WebsiteSettings
                website={website}
                onClose={() => setShowSettingsModal(false)}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
