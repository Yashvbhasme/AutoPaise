import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import aiAPI from '../utils/aiApi';
import RiskDashboard from '../components/RiskDashboard';
import RevenueForcast from '../components/RevenueForcast';
import { AlertCircle, RefreshCw, TrendingUp, BarChart3 } from 'lucide-react';

const AIDashboard = () => {
  const { user, token } = useAuth();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
  }, [token]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await aiAPI.getAIDashboardOverview(token);
      if (data.success) {
        setOverview(data.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await aiAPI.recalculateAllMetrics(token);
      await loadDashboardData();
    } catch (err) {
      setError(err.message);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-20 bg-gray-300 rounded-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-gray-300 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">🤖 AI Insights Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Intelligent analysis of your payment collections and revenue forecasts
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh Metrics'}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-red-600 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Top Metrics */}
        {overview && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricBox
              title="Average Risk Score"
              value={overview.riskMetrics.averageRiskScore}
              unit="/100"
              icon="📊"
              trend={overview.riskMetrics.averageRiskScore > 50 ? 'up' : 'down'}
            />
            <MetricBox
              title="This Month Revenue"
              value={`₹${(overview.revenueMetrics.expectedThisMonth / 1000).toFixed(1)}K`}
              icon="💰"
              subtext="Expected"
            />
            <MetricBox
              title="High Risk Mandates"
              value={overview.mandatesAtRisk.high}
              icon="⚠️"
              warning={overview.mandatesAtRisk.high > 0}
              subtext={`of ${overview.riskMetrics.total} total`}
            />
            <MetricBox
              title="Growth Rate"
              value={`${overview.revenueMetrics.growthRate.toFixed(1)}%`}
              icon="📈"
              trend={overview.revenueMetrics.growthRate > 0 ? 'up' : 'down'}
            />
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-300">
          <div className="flex gap-4">
            {['overview', 'risk', 'forecast'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 px-4 font-semibold border-b-2 transition ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'overview' && '📋 Overview'}
                {tab === 'risk' && '⚠️ Risk Analysis'}
                {tab === 'forecast' && '💹 Revenue Forecast'}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'overview' && overview && (
            <div className="space-y-8">
              {/* Top Insights */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4 text-slate-900">💡 Top Insights</h2>
                {overview.topInsights && overview.topInsights.length > 0 ? (
                  <div className="space-y-3">
                    {overview.topInsights.map((insight, idx) => (
                      <InsightCard key={idx} insight={insight} />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No insights available yet. Keep collecting payment data!</p>
                )}
              </div>

              {/* Collections Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg p-6 border border-green-200">
                  <h3 className="text-lg font-bold text-green-900 mb-4">📊 Collections Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Expected This Month</span>
                      <span className="text-2xl font-bold text-green-600">
                        ₹{overview.revenueMetrics.expectedThisMonth.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">This Quarter</span>
                      <span className="text-xl font-bold text-green-600">
                        ₹{overview.revenueMetrics.expectedThisQuarter.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Average Monthly</span>
                      <span className="text-xl font-bold text-green-600">
                        ₹{overview.revenueMetrics.averageMonthly.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl shadow-lg p-6 border border-orange-200">
                  <h3 className="text-lg font-bold text-orange-900 mb-4">🎯 Risk Assessment</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Collection Risk Level</span>
                      <span className={`px-3 py-1 rounded-full font-bold ${
                        overview.revenueMetrics.riskLevel === 'High' ? 'bg-red-200 text-red-800' :
                        overview.revenueMetrics.riskLevel === 'Medium' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-green-200 text-green-800'
                      }`}>
                        {overview.revenueMetrics.riskLevel}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">High Risk Mandates</span>
                      <span className="text-xl font-bold text-orange-600">{overview.mandatesAtRisk.high}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Medium Risk Mandates</span>
                      <span className="text-xl font-bold text-orange-600">{overview.mandatesAtRisk.medium}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Low Risk Mandates</span>
                      <span className="text-xl font-bold text-green-600">{overview.mandatesAtRisk.low}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Month Forecast */}
              {overview.nextMonth && (
                <div className="bg-blue-50 rounded-xl shadow-lg p-6 border border-blue-200">
                  <h3 className="text-lg font-bold text-blue-900 mb-4">🔮 Next Month Preview</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <ForecastCard
                      label="Predicted Amount"
                      value={`₹${overview.nextMonth.predictedAmount.toLocaleString('en-IN')}`}
                    />
                    <ForecastCard
                      label="Low Estimate"
                      value={`₹${overview.nextMonth.lowEstimate.toLocaleString('en-IN')}`}
                    />
                    <ForecastCard
                      label="High Estimate"
                      value={`₹${overview.nextMonth.highEstimate.toLocaleString('en-IN')}`}
                    />
                    <ForecastCard
                      label="Confidence"
                      value={`${overview.nextMonth.confidence}%`}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'risk' && (
            <RiskDashboard userToken={token} />
          )}

          {activeTab === 'forecast' && (
            <RevenueForcast userToken={token} />
          )}
        </div>
      </div>
    </div>
  );
};

const MetricBox = ({ title, value, unit, icon, trend, warning, subtext }) => (
  <div className={`rounded-xl shadow-lg p-6 ${
    warning ? 'bg-red-50 border border-red-200' : 'bg-white'
  }`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-600 mb-2">{title}</p>
        <p className="text-3xl font-bold text-slate-900">
          {value}<span className="text-lg text-gray-500">{unit}</span>
        </p>
        {subtext && <p className="text-xs text-gray-500 mt-2">{subtext}</p>}
      </div>
      <div className="text-4xl">{icon}</div>
    </div>
    {trend && (
      <div className={`mt-3 text-sm font-semibold flex items-center gap-1 ${
        trend === 'up' ? 'text-green-600' : 'text-red-600'
      }`}>
        <TrendingUp size={16} />
        {trend === 'up' ? 'Increasing' : 'Decreasing'}
      </div>
    )}
  </div>
);

const InsightCard = ({ insight }) => {
  const priorityColor = {
    High: 'border-red-300 bg-red-50',
    Medium: 'border-yellow-300 bg-yellow-50',
    Low: 'border-blue-300 bg-blue-50'
  };

  const typeIcon = {
    warning: '⚠️',
    opportunity: '💡',
    observation: '📌'
  };

  return (
    <div className={`border-l-4 p-4 rounded ${priorityColor[insight.priority]}`}>
      <div className="flex items-start gap-3">
        <span className="text-xl">{typeIcon[insight.type] || '📌'}</span>
        <div className="flex-1">
          <h4 className="font-semibold text-slate-900">{insight.title}</h4>
          <p className="text-sm text-gray-700 mt-1">{insight.description}</p>
        </div>
      </div>
    </div>
  );
};

const ForecastCard = ({ label, value }) => (
  <div className="bg-white rounded-lg p-3 border border-blue-200">
    <p className="text-xs text-gray-600 mb-1">{label}</p>
    <p className="text-lg font-bold text-blue-600">{value}</p>
  </div>
);

export default AIDashboard;
