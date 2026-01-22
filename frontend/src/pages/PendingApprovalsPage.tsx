import { useState } from "react";
import { approvalsApi } from "../services/api";
import { Approval } from "../types";
import ApprovalCard from "../components/ApprovalCard";
import { Loader2 } from "lucide-react";

export default function PendingApprovalsPage() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(false);
  const [approverId, setApproverId] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const fetchApprovals = async () => {
    if (!approverId) {
      return;
    }

    setLoading(true);
    setHasSearched(false);
    try {
      const data = await approvalsApi.getPendingForUser(approverId);
      setApprovals(data);
      setHasSearched(true);
    } catch (error) {
      console.error("Failed to fetch approvals:", error);
      setApprovals([]);
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalUpdate = () => {
    fetchApprovals();
  };

  return (
    <div className="px-4 py-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Pending Approvals
        </h1>

        {/* Approver ID Input */}
        <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter your approver ID to view pending requests
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={approverId}
              onChange={(e) => setApproverId(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  fetchApprovals();
                }
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., manager@company.com"
            />
            <button
              onClick={fetchApprovals}
              disabled={!approverId || loading}
              className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center min-w-[80px]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Load"}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        )}

        {/* Empty State - Only display when no data */}
        {!loading && hasSearched && approvals.length === 0 && (
          <div className="bg-white shadow-sm rounded-lg p-12 text-center">
            <p className="text-gray-500">
              No pending approvals found for {approverId}
            </p>
          </div>
        )}

        {/* Approvals List */}
        {!loading && approvals.length > 0 && (
          <div className="space-y-4">
            {approvals.map((approval) => (
              <ApprovalCard
                key={approval.id}
                approval={approval}
                onUpdate={handleApprovalUpdate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
