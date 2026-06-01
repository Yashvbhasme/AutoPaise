import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Clock, TrendingDown } from 'lucide-react';

const RiskBadge = ({ mandateId, userToken, size = 'md' }) => {
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRiskScore = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/ai/risk/mandate/${mandateId}`, {
          headers: { Authorization: `Bearer ${userToken}` }
        });
        
        const data = await response.json();
        if (data.success) {
          setRiskData(data.data);
        }
      } catch (err) {
        console.error('Error fetching risk score:', err);
      } finally {
        setLoading(false);
      }
    };

    if (userToken && mandateId) {
      fetchRiskScore();
    }
  }, [mandateId, userToken]);

  if (loading || !riskData) return null;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const riskColors = {
    High: 'bg-red-100 text-red-700 border-red-300',
    Medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    Low: 'bg-green-100 text-green-700 border-green-300'
  };

  const icons = {
    High: <AlertTriangle size={16} className="inline mr-1" />,
    Medium: <Clock size={16} className="inline mr-1" />,
    Low: <CheckCircle size={16} className="inline mr-1" />
  };

  return (
    <div
      className={`inline-flex items-center border rounded-full font-semibold ${sizeClasses[size]} ${
        riskColors[riskData.riskLevel]
      }`}
      title={`Risk Score: ${riskData.riskScore}/100 | Success Rate: ${riskData.probabilityOfSuccess}%`}
    >
      {icons[riskData.riskLevel]}
      {riskData.riskLevel} Risk
    </div>
  );
};

const SmartReminderCard = ({ mandateId, userToken }) => {
  const [reminder, setReminder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState(null);

  useEffect(() => {
    const fetchReminder = async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/api/ai/reminder/optimal/${mandateId}`,
          { headers: { Authorization: `Bearer ${userToken}` } }
        );
        
        const data = await response.json();
        if (data.success) {
          setReminder(data.data);
          setPreferences(data.data.customerBehavior);
        }
      } catch (err) {
        console.error('Error fetching reminder data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (userToken && mandateId) {
      fetchReminder();
    }
  }, [mandateId, userToken]);

  if (loading) {
    return <div className="animate-pulse h-40 bg-gray-200 rounded-lg"></div>;
  }

  if (!reminder) return null;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 space-y-4">
      <h3 className="font-semibold text-slate-900 flex items-center gap-2">
        🔔 Smart Reminder Settings
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded p-3 border border-purple-100">
          <p className="text-xs text-gray-600 mb-1">Optimal Reminder Time</p>
          <p className="font-bold text-lg text-purple-600">
            {reminder.recommendedTiming.daysBefore} day{reminder.recommendedTiming.daysBefore > 1 ? 's' : ''} before
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Around {reminder.recommendedTiming.optimalHour}:00 AM
          </p>
        </div>

        <div className="bg-white rounded p-3 border border-purple-100">
          <p className="text-xs text-gray-600 mb-1">Customer Payment Behavior</p>
          <p className="font-bold text-sm text-purple-600">
            {preferences?.paymentOnTimePercentage.toFixed(0)}% On-time
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Avg. {preferences?.latePaymentTendency?.averageLateByDays?.toFixed(1) || 0} days late
          </p>
        </div>
      </div>

      <div className="bg-white rounded p-3 border border-purple-100">
        <p className="text-xs text-gray-600 mb-2">Reminder Effectiveness</p>
        <div className="flex items-center justify-between">
          <div className="flex-1 h-2 bg-gray-200 rounded-full mr-3 overflow-hidden">
            <div
              className="h-full bg-purple-600 rounded-full"
              style={{ width: `${reminder.effectiveness}%` }}
            ></div>
          </div>
          <span className="text-sm font-bold text-purple-600">{reminder.effectiveness}%</span>
        </div>
      </div>

      {reminder.bestTimings && reminder.bestTimings.length > 0 && (
        <div className="bg-white rounded p-3 border border-purple-100">
          <p className="text-xs text-gray-600 mb-2">Best Reminder Timings</p>
          <div className="space-y-2">
            {reminder.bestTimings.map((timing, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-gray-700">
                  {timing.daysBeforeDue} days before: {timing.successRate}% success rate
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export { RiskBadge, SmartReminderCard };
