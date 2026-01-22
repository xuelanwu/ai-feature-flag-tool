import { useState } from "react";
import { FeatureFlag } from "../types";
import { Power, PowerOff, Settings } from "lucide-react";

interface Props {
  flag: FeatureFlag;
  onToggle: (flagId: string) => void;
  onUpdateRollout: (flagId: string, rollout: number) => Promise<void>;
}

export default function FlagCard({ flag, onToggle, onUpdateRollout }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [rollout, setRollout] = useState(flag.config.rollout_percentage || 0);
  const [saving, setSaving] = useState(false);

  const canToggle = ["approved", "active", "inactive"].includes(flag.status);
  const isActive = flag.status === "active";

  const handleSaveRollout = async () => {
    setSaving(true);
    try {
      await onUpdateRollout(flag.id, rollout);
      setIsEditing(false);
    } catch {
      alert("Failed to update rollout percentage");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="bg-white shadow-sm rounded-lg p-6 border-l-4"
      style={{ borderLeftColor: getStatusColor(flag.status) }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {flag.name}
          </h3>
          <p className="text-sm text-gray-600">{flag.description}</p>
        </div>
        <span
          className="px-3 py-1 rounded-full text-xs font-medium ml-4"
          style={{
            backgroundColor: getStatusBg(flag.status),
            color: getStatusColor(flag.status),
          }}
        >
          {flag.status.toUpperCase()}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Created by:</span>
          <span className="text-gray-900 font-medium">{flag.created_by}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Scope:</span>
          <span className="text-gray-900 font-medium">{flag.scope}</span>
        </div>
        {flag.risk_level && (
          <div className="flex justify-between">
            <span className="text-gray-500">Risk Level:</span>
            <span className="text-gray-900 font-medium">
              {flag.risk_level.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Rollout Percentage - Editable */}
      <div className="bg-gray-50 p-4 rounded-md mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">
            Rollout Percentage
          </span>
          {!isEditing && isActive && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs text-primary-600 hover:text-primary-700 flex items-center"
            >
              <Settings className="w-3 h-3 mr-1" />
              Edit
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-primary-600">
                {rollout}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={rollout}
              onChange={(e) => setRollout(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
              style={{
                background: `linear-gradient(to right, #0ea5e9 0%, #0ea5e9 ${rollout}%, #e5e7eb ${rollout}%, #e5e7eb 100%)`,
              }}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
            <div className="flex gap-2">
              {[1, 5, 10, 25, 50, 100].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRollout(value)}
                  className={`px-2 py-1 text-xs rounded border ${
                    rollout === value
                      ? "bg-primary-600 text-white border-primary-600"
                      : "bg-white text-gray-700 border-gray-300 hover:border-primary-500"
                  }`}
                >
                  {value}%
                </button>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleSaveRollout}
                disabled={saving}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 text-sm font-medium"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => {
                  setRollout(flag.config.rollout_percentage || 0);
                  setIsEditing(false);
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-gray-900">
                    {flag.config.rollout_percentage || 0}%
                  </span>
                  <span className="ml-2 text-sm text-gray-500">of users</span>
                </div>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all"
                style={{ width: `${flag.config.rollout_percentage || 0}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Risk Analysis Summary */}
      {flag.risk_analysis && (
        <div className="bg-gray-50 p-3 rounded-md mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-gray-700">
              Risk Score
            </span>
            <span className="text-xs font-bold text-gray-900">
              {flag.risk_analysis.risk_score}/100
            </span>
          </div>
          <p className="text-xs text-gray-600 line-clamp-2">
            {flag.risk_analysis.ai_reasoning}
          </p>
        </div>
      )}

      {/* Toggle Button */}
      {canToggle && (
        <button
          onClick={() => onToggle(flag.id)}
          className={`w-full py-2 px-4 rounded-md font-medium text-sm flex items-center justify-center ${
            isActive
              ? "bg-red-100 text-red-700 hover:bg-red-200"
              : "bg-green-100 text-green-700 hover:bg-green-200"
          }`}
        >
          {isActive ? (
            <>
              <PowerOff className="w-4 h-4 mr-2" />
              Deactivate Flag
            </>
          ) : (
            <>
              <Power className="w-4 h-4 mr-2" />
              Activate Flag
            </>
          )}
        </button>
      )}
    </div>
  );
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: "#f59e0b",
    approved: "#3b82f6",
    rejected: "#ef4444",
    active: "#10b981",
    inactive: "#6b7280",
  };
  return colors[status] || colors.pending;
}

function getStatusBg(status: string): string {
  const colors: Record<string, string> = {
    pending: "#fef3c7",
    approved: "#dbeafe",
    rejected: "#fee2e2",
    active: "#d1fae5",
    inactive: "#f3f4f6",
  };
  return colors[status] || colors.pending;
}
