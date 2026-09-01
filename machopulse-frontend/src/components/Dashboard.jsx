import { useState, memo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { websiteService } from "../api/websiteService";
import Header from "./Header";
import AddWebsiteModal from "./AddWebsiteModal";
import { Trash2, ExternalLink, AlertTriangle, X } from "lucide-react";
import { toast } from "sonner";

// Helper component to format timestamps cleanly
const RelativeTimestamp = memo(({ timestamp }) => {
  if (!timestamp) return <span>Never checked</span>;

  const fixedTimestamp =
    timestamp.endsWith("Z") || timestamp.includes("+")
      ? timestamp
      : timestamp + "Z";

  const seconds = Math.floor((new Date() - new Date(fixedTimestamp)) / 1000);
  if (seconds < 0) return <span>Just now</span>;
  if (seconds < 60) return <span>{seconds}s ago</span>;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return <span>{minutes}m ago</span>;

  return (
    <span>
      {new Date(fixedTimestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}
    </span>
  );
});
RelativeTimestamp.displayName = "RelativeTimestamp";

// Renders a colored indicator badge based on the system status
function StatusBadge({ status }) {
  const upper = status?.toUpperCase();
  if (upper === "UP" || upper === "ONLINE") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] border border-emerald-500 bg-emerald-50 text-emerald-700 font-bold">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        ONLINE
      </span>
    );
  }
  if (upper === "DOWN" || upper === "OFFLINE") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] border border-red-500 bg-red-50 text-red-700 font-bold">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        OFFLINE
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] border border-amber-500 bg-amber-50 text-amber-700 font-bold">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
      {upper || "CHECKING..."}
    </span>
  );
}

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [siteToDelete, setSiteToDelete] = useState(null);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Smart polling: checks every 2s if pending, or every 30s if stable
  const { data: websites = [], isPending } = useQuery({
    queryKey: ["websites"],
    queryFn: websiteService.getUserWebsites,
    refetchInterval: (query) => {
      const data = query.state.data || [];
      const hasUncheckedSite = data.some((site) => {
        const status = site.status?.toUpperCase();
        return !status || status === "UNKNOWN" || status === "CHECKING";
      });
      return hasUncheckedSite ? 2000 : 30000;
    },
  });

  // Mutation logic
  const deleteMutation = useMutation({
    mutationFn: (id) => websiteService.deleteWebsite(id),
    onSuccess: () => {
      toast.success("Website removed from tracking.");
      queryClient.invalidateQueries({ queryKey: ["websites"] });
      setSiteToDelete(null);
    },
    onError: () => {
      toast.error("Failed to remove website. Please try again.");
    },
  });

  const confirmDelete = () => {
    if (siteToDelete) {
      deleteMutation.mutate(siteToDelete.id);
    }
  };

  const activeSitesCount = websites.filter(
    (w) =>
      w.status?.toUpperCase() === "UP" || w.status?.toUpperCase() === "ONLINE",
  ).length;

  const offlineSitesCount = websites.filter(
    (w) =>
      w.status?.toUpperCase() === "DOWN" ||
      w.status?.toUpperCase() === "OFFLINE",
  ).length;

  return (
    <div className="min-h-screen text-black font-mono pb-12">
      <Header onOpenAddModal={() => setIsModalOpen(true)} />

      <main className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
        {/* Overview Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border border-[#EAEAEA] bg-white p-4 shadow-xs">
            <span className="text-xs uppercase text-[#666] font-semibold block">
              Total Websites
            </span>
            <span className="text-2xl font-bold text-black mt-1 block">
              {websites.length}
            </span>
          </div>

          <div className="border border-[#EAEAEA] bg-white p-4 shadow-xs">
            <span className="text-xs uppercase text-[#666] font-semibold block">
              Online & Working
            </span>
            <span className="text-2xl font-bold text-emerald-600 mt-1 block">
              {activeSitesCount}
            </span>
          </div>

          <div className="border border-[#EAEAEA] bg-white p-4 shadow-xs">
            <span className="text-xs uppercase text-[#666] font-semibold block">
              Offline / Down
            </span>
            <span
              className={`text-2xl font-bold mt-1 block ${
                offlineSitesCount > 0
                  ? "text-red-600 animate-bounce"
                  : "text-neutral-400"
              }`}
            >
              {offlineSitesCount}
            </span>
          </div>
        </section>

        {/* Monitored Websites Table */}
        <section className="border border-[#EAEAEA] bg-white shadow-xs">
          <div className="border-b border-[#EAEAEA] px-4 py-3 bg-neutral-50 flex justify-between items-center">
            <span className="text-xs font-bold uppercase text-black">
              Monitored Websites
            </span>
            <span className="text-xs text-[#666]">Auto-checks active</span>
          </div>

          {isPending ? (
            <div className="p-8 text-center text-xs text-[#666] uppercase">
              Loading your websites...
            </div>
          ) : websites.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <p className="text-xs text-[#666] uppercase">
                No websites added yet.
              </p>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="text-xs text-[#FF5500] underline uppercase font-bold cursor-pointer"
              >
                + Add your first website
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#EAEAEA] bg-neutral-50 text-[10px] uppercase text-[#666]">
                    <th className="p-3">Status</th>
                    <th className="p-3">Website Name</th>
                    <th className="p-3">URL</th>
                    <th className="p-3">Check Frequency</th>
                    <th className="p-3">Last Checked</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAEAEA]">
                  {websites.map((site) => (
                    <tr
                      key={site.id}
                      onClick={() => navigate(`/websites/${site.id}`)}
                      className="hover:bg-neutral-50 transition-colors cursor-pointer"
                    >
                      <td className="p-3">
                        <StatusBadge status={site.status} />
                      </td>
                      <td className="p-3 font-semibold text-black">
                        {site.name}
                      </td>
                      <td className="p-3 text-[#666]">
                        <a
                          href={site.url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="hover:text-[#FF5500] flex items-center space-x-1"
                        >
                          <span className="truncate max-w-50">{site.url}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </td>
                      <td className="p-3 text-[#666]">
                        Every {site.checkIntervalSeconds}s
                      </td>
                      <td className="p-3 text-[#666]">
                        <RelativeTimestamp timestamp={site.lastChecked} />
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSiteToDelete(site);
                          }}
                          className="p-1 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Remove Website"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* Add Website Modal */}
      <AddWebsiteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Custom Delete Confirmation Modal */}
      {siteToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-mono">
          <div className="w-full max-w-sm border border-[#EAEAEA] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-3 mb-4">
              <div className="flex items-center space-x-2 text-red-600">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Confirm Deletion
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSiteToDelete(null)}
                className="text-[#666] hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#666] mb-6">
              Are you sure you want to stop tracking{" "}
              <span className="font-bold text-black">{siteToDelete.name}</span>?
              This action cannot be undone.
            </p>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setSiteToDelete(null)}
                className="w-1/2 border border-[#EAEAEA] py-2 text-xs font-bold uppercase text-[#666] hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="w-1/2 bg-red-600 text-white py-2 text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors flex items-center justify-center space-x-1 cursor-pointer disabled:opacity-50"
              >
                <span>
                  {deleteMutation.isPending ? "Removing..." : "Remove"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
