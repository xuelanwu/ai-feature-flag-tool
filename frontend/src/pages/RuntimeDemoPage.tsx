import { useFeatureFlag, useAllFeatureFlags } from "../hooks/useFeatureFlag";
import { useState } from "react";
import { Flag, User, Loader2 } from "lucide-react";

export default function RuntimeDemoPage() {
  const [userId, setUserId] = useState("user_123");

  const isDarkModeEnabled = useFeatureFlag("enable-dark-mode", userId);
  const isNewCheckoutEnabled = useFeatureFlag("new-checkout-flow", userId);

  const { flags, loading } = useAllFeatureFlags(userId);

  return (
    <div className="px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Runtime Feature Flag Demo
        </h1>

        {/* User ID Input */}
        <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="inline w-4 h-4 mr-2" />
            Simulate User ID
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., user_123"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setUserId("user_123")}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
              >
                User 123
              </button>
              <button
                onClick={() => setUserId("user_456")}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
              >
                User 456
              </button>
              <button
                onClick={() => setUserId("user_789")}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
              >
                User 789
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Change user ID to see how rollout percentage affects different users
          </p>
        </div>

        {/* Individual Flag Checks */}
        <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Individual Flag Checks
          </h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div className="flex items-center">
                <Flag className="w-5 h-5 text-gray-500 mr-3" />
                <span className="font-medium">enable-dark-mode</span>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isDarkModeEnabled
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {isDarkModeEnabled ? "✅ Enabled" : "❌ Disabled"}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div className="flex items-center">
                <Flag className="w-5 h-5 text-gray-500 mr-3" />
                <span className="font-medium">new-checkout-flow</span>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isNewCheckoutEnabled
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {isNewCheckoutEnabled ? "✅ Enabled" : "❌ Disabled"}
              </div>
            </div>
          </div>
        </div>

        {/* All Active Flags (Batch) */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            All Active Flags (Batch Query)
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
              <span className="ml-2 text-gray-600">Loading flags...</span>
            </div>
          ) : (
            <div className="space-y-2">
              {Object.keys(flags).length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No active flags found. Activate some flags in Flag Management
                  page.
                </p>
              ) : (
                Object.entries(flags).map(([flagName, enabled]) => (
                  <div
                    key={flagName}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                  >
                    <span className="font-mono text-sm">{flagName}</span>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        enabled
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {enabled ? "✅ Enabled" : "❌ Disabled"}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Demo UI Changes Based on Flags */}
        <div className="bg-white shadow-sm rounded-lg p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Demo: UI Changes Based on Flags
          </h2>

          <div className="space-y-4">
            {/* Dark Mode Demo */}
            <div
              className={`p-4 rounded-lg ${
                isDarkModeEnabled
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              <h3 className="font-semibold mb-2">
                {isDarkModeEnabled ? "🌙 Dark Mode Enabled" : "☀️ Light Mode"}
              </h3>
              <p className="text-sm">
                This section changes appearance based on 'enable-dark-mode' flag
              </p>
            </div>

            {/* Checkout Button Demo */}
            <div>
              {isNewCheckoutEnabled ? (
                <button className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-shadow">
                  🚀 New Checkout (v2.0) - Fast & Secure
                </button>
              ) : (
                <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700">
                  Checkout (Classic)
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h3 className="font-semibold text-blue-900 mb-2">💡 How to Test</h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Go to "Flag Management" and activate some flags</li>
            <li>Set different rollout percentages (e.g., 10%, 50%, 100%)</li>
            <li>Come back here and switch between different user IDs</li>
            <li>
              Watch how different users see different features based on rollout
              %
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
