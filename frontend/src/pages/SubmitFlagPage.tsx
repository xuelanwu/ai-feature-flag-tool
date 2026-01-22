import { useState } from "react";
import { flagsApi } from "../services/api";
import { FeatureFlag } from "../types";
import RiskAnalysisCard from "../components/RiskAnalysisCard";
import { Loader2, Send, Shield, CheckCircle } from "lucide-react";

export default function SubmitFlagPage() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    created_by: "",
    code_changes: "",
    scope: "frontend",
    config: {
      rollout_percentage: 10,
    },
  });

  const [lastSubmitted, setLastSubmitted] = useState<FeatureFlag | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await flagsApi.create(formData);
      setLastSubmitted(result);

      // Reset form (keep email)
      setFormData({
        name: "",
        description: "",
        created_by: formData.created_by,
        code_changes: "",
        scope: "frontend",
        config: { rollout_percentage: 10 },
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to submit feature flag");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Feature Flag Submission
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ==================== Section 1: New Change Request (Draft) ==================== */}
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                New Change Request
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Draft your next feature flag submission
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="bg-white shadow-sm rounded-lg p-6 space-y-5"
            >
              {/* Flag Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Flag Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  placeholder="e.g., new-checkout-flow"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  placeholder="What does this feature flag control?"
                />
              </div>

              {/* Your Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.created_by}
                  onChange={(e) =>
                    setFormData({ ...formData, created_by: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  placeholder="e.g., john@company.com"
                />
              </div>

              {/* Scope */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scope *
                </label>
                <select
                  value={formData.scope}
                  onChange={(e) =>
                    setFormData({ ...formData, scope: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                >
                  <option value="frontend">Frontend</option>
                  <option value="backend">Backend</option>
                  <option value="database">Database</option>
                  <option value="all">All Systems</option>
                </select>
              </div>

              {/* Code Changes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code Changes *
                </label>
                <textarea
                  required
                  value={formData.code_changes}
                  onChange={(e) =>
                    setFormData({ ...formData, code_changes: e.target.value })
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  placeholder="Describe the technical changes..."
                />
              </div>

              {/* Rollout Percentage - fix version */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Initial Rollout Percentage
                  </label>
                  <span className="text-lg font-bold text-primary-600">
                    {formData.config.rollout_percentage}%
                  </span>
                </div>

                {/* Slider */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={formData.config.rollout_percentage || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      config: {
                        ...formData.config,
                        rollout_percentage: parseInt(e.target.value),
                      },
                    })
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                  style={{
                    background: `linear-gradient(to right, #0ea5e9 0%, #0ea5e9 ${formData.config.rollout_percentage}%, #e5e7eb ${formData.config.rollout_percentage}%, #e5e7eb 100%)`,
                  }}
                />

                {/* Scale */}
                <div className="flex justify-between text-xs text-gray-500 mt-1 px-1">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>

                {/* Shortcut Button */}
                <div className="flex gap-2 mt-3">
                  {[1, 5, 10, 25, 50, 100].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          config: {
                            ...formData.config,
                            rollout_percentage: value,
                          },
                        })
                      }
                      className={`px-3 py-1 text-xs rounded border ${
                        formData.config.rollout_percentage === value
                          ? "bg-primary-600 text-white border-primary-600"
                          : "bg-white text-gray-700 border-gray-300 hover:border-primary-500"
                      }`}
                    >
                      {value}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Auto-assignment Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 flex items-start text-sm">
                <Shield className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-blue-800">
                  Approver will be automatically assigned based on AI risk
                  analysis
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded-md text-sm">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 text-white py-2.5 px-4 rounded-md hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center font-medium"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing & Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit for Review
                  </>
                )}
              </button>
            </form>
          </div>

          {/* ==================== Section 2: Last Submitted Request (Read-only) ==================== */}
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Last Submitted Request
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {lastSubmitted
                  ? "Read-only summary of your most recent submission"
                  : "Your submission will appear here after submitting"}
              </p>
            </div>

            {lastSubmitted ? (
              <div className="space-y-4">
                {/* Success Banner */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-green-900 mb-1">
                        Request Submitted Successfully
                      </h3>
                      <p className="text-sm text-green-800 mb-2">
                        The change request has been submitted and is pending
                        review.
                      </p>
                      <div className="bg-white rounded px-3 py-2 border border-green-200">
                        <p className="text-xs text-gray-600 mb-1">
                          Required Approver (computed):
                        </p>
                        <p className="font-mono text-sm text-gray-900 font-medium">
                          {lastSubmitted.required_approver ||
                            "senior-engineer@company.com"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Assigned based on{" "}
                          <span className="font-medium uppercase">
                            {lastSubmitted.risk_level}
                          </span>{" "}
                          risk
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Request Summary - Read Only */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 space-y-3">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">
                      Request Details
                    </h3>
                    <span className="px-2.5 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                      Pending Review
                    </span>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Flag Name</p>
                    <p className="text-sm font-medium text-gray-900">
                      {lastSubmitted.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      Environment / Scope
                    </p>
                    <p className="text-sm text-gray-900 capitalize">
                      {lastSubmitted.scope}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Description</p>
                    <p className="text-sm text-gray-900">
                      {lastSubmitted.description}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Code Changes</p>
                    <p className="text-sm text-gray-900 line-clamp-3">
                      {lastSubmitted.code_changes}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      Rollout Percentage
                    </p>
                    <p className="text-sm text-gray-900">
                      {lastSubmitted.config.rollout_percentage}%
                    </p>
                  </div>
                </div>

                {/* AI Risk Analysis - Read Only */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    AI Risk Analysis – Last Submitted Request
                  </h3>
                  <RiskAnalysisCard flag={lastSubmitted} />
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No submission yet
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Submit your first feature flag to see the results here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
