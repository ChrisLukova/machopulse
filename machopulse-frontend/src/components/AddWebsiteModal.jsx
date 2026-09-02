import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { websiteService } from "../api/websiteService";
import { X, Globe, Clock, Plus } from "lucide-react";
import { toast } from "sonner";

export default function AddWebsiteModal({ isOpen, onClose }) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [checkIntervalSeconds, setCheckIntervalSeconds] = useState(60);

  const queryClient = useQueryClient();

  const resetForm = () => {
    setName("");
    setUrl("");
    setCheckIntervalSeconds(60);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        setName("");
        setUrl("");
        setCheckIntervalSeconds(60);
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Mutation to add a new website to the monitoring list
  const createMutation = useMutation({
    mutationFn: (newSiteData) => websiteService.createWebsite(newSiteData),
    onSuccess: () => {
      // Tell React Query to refresh the cached list automatically
      queryClient.invalidateQueries({ queryKey: ["websites"] });

      toast.success("Website added to monitoring list.");

      // Reset form and close modal
      resetForm();
      onClose();
    },
    onError: (error) => {
      const apiError =
        error?.response?.data?.message ||
        error?.response?.data?.errors?.[0] ||
        "Could not add website. Please try again.";

      toast.error(apiError);
    },
  });

  if (!isOpen) return null;

  const normalizeUrl = (rawInput) => {
    let trimmed = rawInput.trim();
    if (!trimmed) return "";

    // Automatically prepend https:// if missing
    if (!/^https?:\/\//i.test(trimmed)) {
      trimmed = `https://${trimmed}`;
    }
    return trimmed;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formattedUrl = normalizeUrl(url);

    const isValidFormat = /^https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(
      formattedUrl,
    );
    if (!isValidFormat) {
      toast.error("Please enter a valid domain (eg., example.com)");
      return;
    }

    // Trigger the mutation
    createMutation.mutate({
      name,
      url: formattedUrl,
      checkIntervalSeconds: Number(checkIntervalSeconds),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-mono">
      <div className="w-full max-w-md border border-[#EAEAEA] bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-3 mb-6">
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4 text-[#FF5500]" />
            <span className="text-xs font-bold uppercase tracking-wider text-black">
              Add New Website
            </span>
          </div>
          <button
            onClick={handleClose}
            className="text-[#666] hover:text-black transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] uppercase text-[#666] mb-1 font-semibold">
              Website Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. My Portfolio or Online Store"
              className="w-full border border-[#EAEAEA] bg-neutral-50 px-3 py-2 text-xs text-black focus:border-[#FF5500] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase text-[#666] mb-1 font-semibold">
              Website Address (URL)
            </label>
            <input
              type="text"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="example.com or https://example.com"
              className="w-full border border-[#EAEAEA] bg-neutral-50 px-3 py-2 text-xs text-black focus:border-[#FF5500] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase text-[#666] mb-1 font-semibold">
              Check Frequency (Seconds)
            </label>
            <div className="relative">
              <input
                type="number"
                required
                min={60}
                value={checkIntervalSeconds}
                onChange={(e) => setCheckIntervalSeconds(e.target.value)}
                className="w-full border border-[#EAEAEA] bg-neutral-50 px-3 py-2 text-xs text-black focus:border-[#FF5500] focus:bg-white focus:outline-none"
              />
              <Clock className="w-3.5 h-3.5 absolute right-3 top-2.5 text-[#666]" />
            </div>
            <span className="text-[10px] text-[#666] mt-1 block">
              Minimum check time: 60 seconds
            </span>
          </div>

          <div className="flex space-x-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="w-1/2 border border-[#EAEAEA] py-2 text-xs font-bold uppercase text-[#666] hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-1/2 bg-[#FF5500] text-white py-2 text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors flex items-center justify-center space-x-1 cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>
                {createMutation.isPending ? "Adding..." : "Add Website"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
