import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { websiteService } from "../api/websiteService";
import { Settings, Trash2, Save, AlertTriangle, X } from "lucide-react";
import { toast } from "sonner";

export default function WebsiteSettings({ website, onClose }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [name, setName] = useState(website?.name || "");
  const [url, setUrl] = useState(website?.url || "");
  const [checkIntervalSeconds, setCheckIntervalSeconds] = useState(
    website?.checkIntervalSeconds || 60,
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (updatedData) =>
      websiteService.updateWebsite(website.id, updatedData),
    onSuccess: () => {
      toast.success("Monitor configuration updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["website", String(website.id)],
      });
      queryClient.invalidateQueries({ queryKey: ["websites"] });
      onClose?.(); // Close modal upon successful save
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to update monitor");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => websiteService.deleteWebsite(website.id),
    onSuccess: () => {
      toast.success("Monitor and logs deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["websites"] });
      navigate("/dashboard");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to delete monitor");
    },
  });

  const handleUpdate = (e) => {
    e.preventDefault();
    updateMutation.mutate({
      name,
      url,
      checkIntervalSeconds: Number(checkIntervalSeconds),
    });
  };

  return (
    <section className="bg-white p-6 space-y-6 font-mono">
      {/* Modal Header with Title & Close Action */}
      <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-4">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-[#FF5500]" />
          <h3 className="text-xs font-bold uppercase text-black">
            Monitor Settings
          </h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-[#666] hover:text-black transition-colors cursor-pointer p-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Edit Form */}
      <form onSubmit={handleUpdate} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase text-[#666] font-semibold block">
              Monitor Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border border-[#EAEAEA] bg-neutral-50 px-3 py-2 text-xs text-black focus:outline-none focus:border-black transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase text-[#666] font-semibold block">
              Target URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="w-full border border-[#EAEAEA] bg-neutral-50 px-3 py-2 text-xs text-black focus:outline-none focus:border-black transition-colors"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] uppercase text-[#666] font-semibold block">
            Check Interval (Seconds, min 60)
          </label>
          <input
            type="number"
            min={60}
            value={checkIntervalSeconds}
            onChange={(e) => setCheckIntervalSeconds(e.target.value)}
            required
            className="w-full md:w-1/2 border border-[#EAEAEA] bg-neutral-50 px-3 py-2 text-xs text-black focus:outline-none focus:border-black transition-colors"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="border border-[#EAEAEA] bg-white text-black px-4 py-2 text-xs font-bold uppercase hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 text-xs font-bold uppercase hover:bg-[#FF5500] transition-colors cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="border-t border-red-200 pt-6 space-y-4">
        <div>
          <h4 className="text-xs font-bold uppercase text-red-600 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" /> Danger Zone
          </h4>
          <p className="text-[10px] text-[#666] mt-0.5">
            Deleting this monitor will permanently remove the configuration and
            all historical telemetry logs.
          </p>
        </div>

        {!showDeleteConfirm ? (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="border border-red-300 bg-red-50 text-red-700 px-3 py-2 text-xs font-bold uppercase hover:bg-red-100 transition-colors cursor-pointer"
          >
            Delete Monitor
          </button>
        ) : (
          <div className="border border-red-300 bg-red-50/60 p-4 space-y-3">
            <p className="text-xs font-bold text-red-900 uppercase">
              Are you absolute sure? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="bg-red-600 text-white px-3 py-1.5 text-xs font-bold uppercase hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {deleteMutation.isPending ? "Deleting..." : "Confirm Deletion"}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="border border-[#EAEAEA] bg-white text-black px-3 py-1.5 text-xs font-bold uppercase hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
