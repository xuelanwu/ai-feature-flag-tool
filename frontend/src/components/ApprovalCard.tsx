import { useState } from "react";
import { Approval } from "../types";
import { approvalsApi } from "../services/api";
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from "lucide-react";

interface Props {
  approval: Approval;
  onUpdate: () => void;
}

export default function ApprovalCard({ approval, onUpdate }: Props) {
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const flag = approval.flag_details;

  const isProcessed = approval.status !== "pending";

  const handleApprove = async () => {
    setLoading(true);
    try {
      await approvalsApi.update(approval.id, "approved", comment);
      onUpdate();
    } catch (error) {
      console.error("Failed to approve:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      await approvalsApi.update(approval.id, "rejected", comment);
      onUpdate();
    } catch (error) {
      console.error("Failed to reject:", error);
    } finally {
      setLoading(false);
    }
  };

  const riskColor = getRiskColor(flag?.risk_level || "low");

  return (
    <div
      className="bg-white shadow-sm rounded-lg p-6 border-l-4"
      style={{ borderLeftColor: riskColor }}
    >
      {/* Flag Info */}
      <div className="mb-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{flag?.name}</h3>
          <div className="flex gap-2">
            <span
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: getRiskBg(flag?.risk_level || "low"),
                color: riskColor,
              }}
            >
              {flag?.risk_level?.toUpperCase()}
            </span>
            {isProcessed && (
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  approval.status === "approved"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {approval.status.toUpperCase()}
              </span>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-2">{flag?.description}</p>
        <div className="text-xs text-gray-500 space-y-1">
          <p>Created by: {flag?.created_by}</p>
          <p>Scope: {flag?.scope}</p>
        </div>
      </div>

      {/* Risk Analysis */}
      {flag?.risk_analysis && (
        <div className="bg-gray-50 p-4 rounded-md mb-4">
          <div className="flex items-center mb-2">
            <AlertTriangle
              className="w-4 h-4 mr-2"
              style={{ color: riskColor }}
            />
            <span className="text-sm font-semibold text-gray-700">
              Risk Score: {flag.risk_analysis.risk_score}/100
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            {flag.risk_analysis.ai_reasoning}
          </p>
          <p className="text-sm font-medium text-gray-700">
            Recommendation: {flag.risk_analysis.recommendation}
          </p>
        </div>
      )}

      {/* Code Changes */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-1">
          Code Changes
        </h4>
        <p className="text-sm text-gray-600">{flag?.code_changes}</p>
      </div>

      {/* Display approval details if approved */}
      {isProcessed ? (
        <div
          className={`p-4 rounded-md ${
            approval.status === "approved" ? "bg-green-50" : "bg-red-50"
          }`}
        >
          <p className="text-sm font-medium mb-1">
            {approval.status === "approved" ? "✅ Approved" : "❌ Rejected"}
          </p>
          {approval.comment && (
            <p className="text-sm text-gray-600">Comment: {approval.comment}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {approval.approved_at &&
              `Processed at: ${new Date(approval.approved_at).toLocaleString()}`}
          </p>
        </div>
      ) : (
        <>
          {/* Comment Input - Only display when pending */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comment (optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              placeholder="Add your review comments..."
            />
          </div>

          {/* Action Buttons - Only display when pending */}
          <div className="flex gap-3">
            <button
              onClick={handleApprove}
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center text-sm font-medium"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </>
              )}
            </button>
            <button
              onClick={handleReject}
              disabled={loading}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center text-sm font-medium"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function getRiskColor(riskLevel: string): string {
  const colors: Record<string, string> = {
    low: "#10b981",
    medium: "#f59e0b",
    high: "#f97316",
    critical: "#ef4444",
  };
  return colors[riskLevel] || colors.low;
}

function getRiskBg(riskLevel: string): string {
  const colors: Record<string, string> = {
    low: "#d1fae5",
    medium: "#fef3c7",
    high: "#fed7aa",
    critical: "#fee2e2",
  };
  return colors[riskLevel] || colors.low;
}
