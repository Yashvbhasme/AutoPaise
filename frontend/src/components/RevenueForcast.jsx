import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

const RevenueForcast = ({ userToken }) => {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('chart'); // 'chart' or 'insights'

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/ai/forecast/monthly', {
          headers: { Authorization: `Bearer ${userToken}` }
        });
        
        const data = await response.json();
        if (data.success) {
          setForecast(data.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userToken) fetchForecast();
  }, [userToken]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-64 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error loading forecast: {error}</div>;
  }

  if (!forecast || !forecast.forecast) return null;

  const maxAmount = Math.max(...forecast.forecast.map(f => f.highEstimate), 50000);
  const chartHeight = 300;

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-900">💰 Revenue Forecast</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setView('chart')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              view === 'chart'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Chart
          </button>
          <button
            onClick={() => setView('insights')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              view === 'insights'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Insights
          </button>
        </div>
      </div>

      {view === 'chart' ? (
        <div>
          {/* Revenue Chart */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 text-slate-700">6-Month Forecast</h3>
            <div className="relative" style={{ height: `${chartHeight}px` }}>
              <div className="absolute inset-0 flex flex-col justify-between">
                {[100, 75, 50, 25, 0].map((pct) => (
                  <div
                    key={pct}
                    className="flex items-center border-t border-gray-200"
                  >
                    <span className="text-xs text-gray-500 -mt-2 mr-2 w-12">
                      ₹{Math.round((maxAmount * pct) / 100 / 1000)}K
                    </span>
                  </div>
                ))}
              </div>

              {/* Chart bars */}
              <svg
                className="w-full h-full"
                viewBox={`0 0 ${forecast.forecast.length * 80} ${chartHeight}`}
                preserveAspectRatio="none"
              >
                {/* Grid lines */}
                {forecast.forecast.map((_, idx) => (
                  <line
                    key={`grid-${idx}`}
                    x1={idx * 80 + 40}
                    y1="0"
                    x2={idx * 80 + 40}
                    y2={chartHeight}
                    stroke="#f0f0f0"
                    strokeWidth="1"
                  />
                ))}

                {/* Bars */}
                {forecast.forecast.map((item, idx) => {
                  const barHeight = (item.predictedAmount / maxAmount) * chartHeight * 0.9;
                  const x = idx * 80 + 20;
                  const y = chartHeight - barHeight;

                  return (
                    <g key={`bar-${idx}`}>
                      <rect
                        x={x}
                        y={y}
                        width="40"
                        height={barHeight}
                        fill="#3b82f6"
                        opacity={item.confidence / 100}
                        className="hover:fill-blue-700 cursor-pointer transition"
                      />
                      {/* Error bars for uncertainty */}
                      <line
                        x1={x + 20}
                        y1={chartHeight - (item.lowEstimate / maxAmount) * chartHeight * 0.9}
                        x2={x + 20}
                        y2={chartHeight - (item.highEstimate / maxAmount) * chartHeight * 0.9}
                        stroke="#cbd5e1"
                        strokeWidth="2"
                        opacity="0.5"
                      />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Month labels */}
            <div className="flex justify-between text-xs text-gray-600 mt-2 px-6">
              {forecast.forecast.map((item) => (
                <span key={item.month}>{item.month.split('-')[1]}</span>
              ))}
            </div>
          </div>

          {/* Detailed forecast table */}
          <div className="bg-gray-50 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-200 border-b">
                  <th className="px-4 py-3 text-left font-semibold">Month</th>
                  <th className="px-4 py-3 text-right font-semibold">Predicted</th>
                  <th className="px-4 py-3 text-right font-semibold">Range</th>
                  <th className="px-4 py-3 text-right font-semibold">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {forecast.forecast.map((item) => (
                  <tr key={item.month} className="border-b hover:bg-gray-100 transition">
                    <td className="px-4 py-3 font-medium">{item.month}</td>
                    <td className="px-4 py-3 text-right font-bold text-blue-600">
                      ₹{item.predictedAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600 text-xs">
                      ₹{item.lowEstimate.toLocaleString('en-IN')} - ₹{item.highEstimate.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-2 bg-gray-300 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${item.confidence}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium w-8 text-right">{item.confidence}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div>
          {/* Insights */}
          <InsightsPanel userToken={userToken} />
        </div>
      )}
    </div>
  );
};

const InsightsPanel = ({ userToken }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/ai/forecast/insights', {
          headers: { Authorization: `Bearer ${userToken}` }
        });
        
        const data = await response.json();
        if (data.success) {
          setInsights(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [userToken]);

  if (loading) return <div className="animate-pulse h-32 bg-gray-200 rounded"></div>;
  if (!insights) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="This Month"
          value={`₹${insights.metrics.expectedThisMonth.toLocaleString('en-IN')}`}
          icon="📅"
        />
        <MetricCard
          label="This Quarter"
          value={`₹${insights.metrics.expectedThisQuarter.toLocaleString('en-IN')}`}
          icon="📊"
        />
        <MetricCard
          label="At Risk"
          value={insights.metrics.mandatesAtRisk.high}
          icon="⚠️"
          warning
        />
        <MetricCard
          label="Risk Level"
          value={insights.metrics.riskLevel}
          icon="🎯"
        />
      </div>

      <h3 className="font-semibold text-lg text-slate-700 mb-4">AI Recommendations</h3>
      <div className="space-y-3">
        {insights.insights && insights.insights.map((insight, idx) => (
          <InsightCard key={idx} insight={insight} />
        ))}
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, icon, warning }) => (
  <div className={`p-4 rounded-lg border ${warning ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-600">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
      <span className="text-2xl">{icon}</span>
    </div>
  </div>
);

const InsightCard = ({ insight }) => {
  const priorityColor = {
    High: 'bg-red-100 border-red-300 text-red-700',
    Medium: 'bg-yellow-100 border-yellow-300 text-yellow-700',
    Low: 'bg-blue-100 border-blue-300 text-blue-700'
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
          <h4 className="font-semibold">{insight.title}</h4>
          <p className="text-sm opacity-90 mt-1">{insight.description}</p>
          <span className={`inline-block mt-2 px-2 py-1 text-xs font-semibold rounded ${priorityColor[insight.priority]}`}>
            {insight.priority} Priority
          </span>
        </div>
      </div>
    </div>
  );
};

export default RevenueForcast;
