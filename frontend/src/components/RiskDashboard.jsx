import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, Zap } from 'lucide-react';

const RiskDashboard = ({ userToken }) => {
  const [riskMetrics, setRiskMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRiskMetrics = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/ai/risk/all', {
          headers: { Authorization: `Bearer ${userToken}` }
        });
        
        const data = await response.json();
        if (data.success) {
          setRiskMetrics(data.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userToken) fetchRiskMetrics();
  }, [userToken]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-gray-200 rounded-lg"></div>
        <div className="h-32 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error loading risk metrics: {error}</div>;
  }

  if (!riskMetrics) return null;

  const { summary, byRiskLevel } = riskMetrics;

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-slate-900">⚠️ Payment Risk Analysis</h2>
        <div className="text-right">
          <p className="text-sm text-slate-600">Last Updated</p>
          <p className="text-xs text-slate-500">{new Date().toLocaleString()}</p>
        </div>
      </div>

      {/* Risk Level Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <RiskCard
          label="Total Mandates"
          value={summary.total}
          bgColor="bg-blue-50"
          textColor="text-blue-600"
          icon="📊"
        />
        <RiskCard
          label="High Risk"
          value={summary.high}
          bgColor="bg-red-50"
          textColor="text-red-600"
          icon="🔴"
          warning={summary.high > 0}
        />
        <RiskCard
          label="Medium Risk"
          value={summary.medium}
          bgColor="bg-yellow-50"
          textColor="text-yellow-600"
          icon="🟡"
        />
        <RiskCard
          label="Low Risk"
          value={summary.low}
          bgColor="bg-green-50"
          textColor="text-green-600"
          icon="🟢"
        />
      </div>

      {/* High Risk Mandates */}
      {byRiskLevel.high && byRiskLevel.high.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="text-red-600" size={20} />
            <h3 className="font-semibold text-red-900">High Risk Alert</h3>
          </div>
          <div className="space-y-2">
            {byRiskLevel.high.map((item, idx) => (
              <RiskItem key={idx} riskData={item} />
            ))}
          </div>
        </div>
      )}

      {/* Medium Risk Mandates */}
      {byRiskLevel.medium && byRiskLevel.medium.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="text-yellow-600" size={20} />
            <h3 className="font-semibold text-yellow-900">Medium Risk</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {byRiskLevel.medium.map((item, idx) => (
              <RiskItem key={idx} riskData={item} size="sm" />
            ))}
          </div>
        </div>
      )}

      {/* Low Risk Summary */}
      {summary.low > 0 && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-green-600" size={20} />
            <div>
              <h3 className="font-semibold text-green-900">Healthy Payments</h3>
              <p className="text-sm text-green-700">
                {summary.low} mandate{summary.low !== 1 ? 's' : ''} are performing well
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const RiskCard = ({ label, value, bgColor, textColor, icon, warning }) => (
  <div className={`${bgColor} p-4 rounded-lg border ${warning ? 'border-red-300' : 'border-gray-200'}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-600">{label}</p>
        <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
      </div>
      <span className="text-3xl">{icon}</span>
    </div>
  </div>
);

const RiskItem = ({ riskData, size = 'default' }) => {
  const getBackgroundColor = (score) => {
    if (score >= 70) return 'bg-red-100 border-red-300';
    if (score >= 40) return 'bg-yellow-100 border-yellow-300';
    return 'bg-green-100 border-green-300';
  };

  return (
    <div className={`${getBackgroundColor(riskData.riskScore)} border p-3 rounded ${size === 'sm' ? 'text-sm' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold">{riskData.riskLevel} Risk</p>
          <p className="text-xs text-gray-700">Score: {riskData.riskScore}/100</p>
          {riskData.riskFactors && riskData.riskFactors.length > 0 && (
            <p className="text-xs text-gray-600 mt-1">
              {riskData.riskFactors[0].description}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-lg font-bold">{riskData.probabilityOfSuccess}%</p>
          <p className="text-xs text-gray-600">Success Rate</p>
        </div>
      </div>
    </div>
  );
};

export default RiskDashboard;
