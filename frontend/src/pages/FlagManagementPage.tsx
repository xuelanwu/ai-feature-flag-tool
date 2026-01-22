import { useState, useEffect } from "react";
import { flagsApi } from "../services/api";
import { FeatureFlag } from "../types";
import FlagCard from "../components/FlagCard";
import { Loader2 } from "lucide-react";

export default function FlagManagementPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("");

  const fetchFlags = async () => {
    setLoading(true);
    try {
      const data = await flagsApi.getAll(filterStatus || undefined);
      setFlags(data);
    } catch (error) {
      console.error("Failed to fetch flags:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlags();
  }, [filterStatus]);

  const handleToggle = async (flagId: string) => {
    try {
      await flagsApi.toggle(flagId);
      fetchFlags();
    } catch (error) {
      console.error("Failed to toggle flag:", error);
    }
  };

  const handleUpdateRollout = async (flagId: string, rollout: number) => {
    try {
      await flagsApi.updateRollout(flagId, rollout);
      fetchFlags();
    } catch (error) {
      console.error("Failed to update rollout:", error);
      throw error;
    }
  };

  return (
    <div className="px-4 py-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Feature Flag Management
        </h1>

        {/* Filter */}
        <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Status
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Flags</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        )}

        {/* Empty State */}
        {!loading && flags.length === 0 && (
          <div className="bg-white shadow-sm rounded-lg p-12 text-center">
            <p className="text-gray-500">No feature flags found</p>
          </div>
        )}

        {/* Flags Grid */}
        {!loading && flags.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {flags.map((flag) => (
              <FlagCard
                key={flag.id}
                flag={flag}
                onToggle={handleToggle}
                onUpdateRollout={handleUpdateRollout}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
