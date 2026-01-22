import { FeatureFlag, RiskLevel } from '../types';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

interface Props {
  flag: FeatureFlag;
}

const riskConfig: Record<RiskLevel, { color: string; icon: any; label: string }> = {
  low: {
    color: 'green',
    icon: CheckCircle,
    label: 'Low Risk',
  },
  medium: {
    color: 'yellow',
    icon: Info,
    label: 'Medium Risk',
  },
  high: {
    color: 'orange',
    icon: AlertTriangle,
    label: 'High Risk',
  },
  critical: {
    color: 'red',
    icon: XCircle,
    label: 'Critical Risk',
  },
};

export default function RiskAnalysisCard({ flag }: Props) {
  const riskLevel = flag.risk_level || 'low';
  const config = riskConfig[riskLevel];
  const Icon = config.icon;
  const riskAnalysis = flag.risk_analysis;

  return (
    <div className="bg-white shadow-sm rounded-lg p-6 border-l-4" style={{ borderLeftColor: getBorderColor(config.color) }}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <Icon className="w-6 h-6 mr-2" style={{ color: getIconColor(config.color) }} />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{flag.name}</h3>
            <p className="text-sm text-gray-500">Status: {flag.status}</p>
          </div>
        </div>
        <span
          className="px-3 py-1 rounded-full text-sm font-medium"
          style={{
            backgroundColor: getBgColor(config.color),
            color: getTextColor(config.color),
          }}
        >
          {config.label}
        </span>
      </div>

      {riskAnalysis && (
        <>
          {/* Risk Score */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-gray-700">Risk Score</span>
              <span className="font-bold text-gray-900">{riskAnalysis.risk_score}/100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full"
                style={{
                  width: `${riskAnalysis.risk_score}%`,
                  backgroundColor: getProgressColor(config.color),
                }}
              />
            </div>
          </div>

          {/* AI Reasoning */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">AI Analysis</h4>
            <p className="text-sm text-gray-600">{riskAnalysis.ai_reasoning}</p>
          </div>

          {/* Detected Issues */}
          {riskAnalysis.detected_issues && riskAnalysis.detected_issues.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Detected Issues</h4>
              <div className="flex flex-wrap gap-2">
                {riskAnalysis.detected_issues.map((issue, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                  >
                    {issue.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recommendation */}
          <div className="bg-gray-50 p-3 rounded-md">
            <h4 className="text-sm font-semibold text-gray-700 mb-1">Recommendation</h4>
            <p className="text-sm text-gray-600">{riskAnalysis.recommendation}</p>
          </div>
        </>
      )}
    </div>
  );
}

function getBorderColor(color: string): string {
  const colors: Record<string, string> = {
    green: '#10b981',
    yellow: '#f59e0b',
    orange: '#f97316',
    red: '#ef4444',
  };
  return colors[color] || colors.green;
}

function getIconColor(color: string): string {
  return getBorderColor(color);
}

function getBgColor(color: string): string {
  const colors: Record<string, string> = {
    green: '#d1fae5',
    yellow: '#fef3c7',
    orange: '#fed7aa',
    red: '#fee2e2',
  };
  return colors[color] || colors.green;
}

function getTextColor(color: string): string {
  const colors: Record<string, string> = {
    green: '#065f46',
    yellow: '#92400e',
    orange: '#9a3412',
    red: '#991b1b',
  };
  return colors[color] || colors.green;
}

function getProgressColor(color: string): string {
  return getBorderColor(color);
}
