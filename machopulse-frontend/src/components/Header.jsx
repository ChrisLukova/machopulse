import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { websiteService } from "../api/websiteService";
import {
  Eye,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Plus,
  LogOut,
} from "lucide-react";

export default function Header({ onOpenAddModal }) {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user websites with a short cache time
  const {
    data: websites = [],
    isPending,
    isRefetching,
  } = useQuery({
    queryKey: ["websites"],
    queryFn: websiteService.getUserWebsites,
    staleTime: 10000,
  });

  const totalSites = websites.length;
  const downSites = websites.filter(
    (w) =>
      w.status?.toUpperCase() === "DOWN" ||
      w.status?.toUpperCase() === "OFFLINE",
  ).length;

  const hasIssues = downSites > 0;

  // Force a hard refresh ignoring staleTime
  const handleManualRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["websites"] });
  };

  return (
    <header className="border-b border-[#EAEAEA] bg-white/90 backdrop-blur-md sticky top-0 z-50 px-4 py-3 font-mono">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand Logo & Health Badge */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Eye className="w-5 h-5 text-[#FF5500]" />
            <span className="text-sm font-bold tracking-tight text-black uppercase">
              Macho<span className="text-[#FF5500]">Pulse</span>
            </span>
          </div>

          {/* Dynamic Health Status Indicator */}
          {isPending ? (
            <div className="flex items-center space-x-2 bg-neutral-100 border border-[#EAEAEA] px-2.5 py-1 text-xs text-neutral-500 font-semibold">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#FF5500]" />
              <span>Updating...</span>
            </div>
          ) : totalSites === 0 ? (
            <div className="flex items-center space-x-2 bg-neutral-100 border border-[#EAEAEA] px-2.5 py-1 text-xs text-neutral-600 font-semibold">
              <span className="h-2 w-2 rounded-full bg-neutral-400" />
              <span>No Websites Monitored</span>
            </div>
          ) : hasIssues ? (
            <div className="flex items-center space-x-2 bg-red-50 border border-red-200 px-2.5 py-1 text-xs text-red-700 font-bold animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
              <span>
                {downSites}{" "}
                {downSites === 1
                  ? "Site Needs Attention"
                  : "Sites Need Attention"}
              </span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs text-emerald-800 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                All Systems Normal ({totalSites}/{totalSites} Working)
              </span>
            </div>
          )}
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:block text-right text-xs">
            <span className="font-bold text-black block">{user?.username}</span>
            <span className="text-[10px] text-[#666]">{user?.email}</span>
          </div>

          <button
            onClick={handleManualRefresh}
            disabled={isRefetching}
            className="border border-[#EAEAEA] px-2.5 py-1 text-xs font-bold uppercase flex items-center space-x-1 hover:bg-neutral-100 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                isRefetching ? "animate-spin text-[#FF5500]" : ""
              }`}
            />
          </button>

          {/* Only render Add Website button if handler is provided */}
          {onOpenAddModal && (
            <button
              onClick={onOpenAddModal}
              className="bg-[#FF5500] text-white px-3 py-1 text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Website</span>
            </button>
          )}

          <button
            onClick={logout}
            className="border border-[#EAEAEA] px-2.5 py-1 text-xs font-bold uppercase text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-1 cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
