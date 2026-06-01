import { API_BASE_URL } from './apiConfig';

const aiAPI = {
  // =================== RISK SCORE APIs ===================
  
  /**
   * Get risk score for a single mandate
   * @param {string} mandateId - Mandate ID
   * @param {string} token - Auth token
   * @returns {Promise<Object>} Risk assessment data
   */
  getMandateRiskScore: async (mandateId, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/risk/mandate/${mandateId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching mandate risk score:', error);
      throw error;
    }
  },

  /**
   * Get all mandates risk scores for current user
   * @param {string} token - Auth token
   * @returns {Promise<Object>} All risk scores with summary
   */
  getAllRiskScores: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/risk/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching all risk scores:', error);
      throw error;
    }
  },

  /**
   * Get detailed analytics for a mandate
   * @param {string} mandateId - Mandate ID
   * @param {string} token - Auth token
   * @returns {Promise<Object>} Detailed payment analytics
   */
  getMandateAnalytics: async (mandateId, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/analytics/mandate/${mandateId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching mandate analytics:', error);
      throw error;
    }
  },

  // =================== REVENUE FORECAST APIs ===================

  /**
   * Get full revenue forecast
   * @param {string} token - Auth token
   * @returns {Promise<Object>} Revenue forecast with all data
   */
  getRevenueForcast: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/forecast/revenue`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching revenue forecast:', error);
      throw error;
    }
  },

  /**
   * Get revenue metrics summary
   * @param {string} token - Auth token
   * @returns {Promise<Object>} Key revenue metrics
   */
  getRevenueMetrics: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/forecast/metrics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching revenue metrics:', error);
      throw error;
    }
  },

  /**
   * Get AI insights for revenue
   * @param {string} token - Auth token
   * @returns {Promise<Object>} AI-generated insights and recommendations
   */
  getRevenueInsights: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/forecast/insights`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching revenue insights:', error);
      throw error;
    }
  },

  /**
   * Get monthly revenue forecast
   * @param {string} token - Auth token
   * @returns {Promise<Object>} Monthly forecast and historical data
   */
  getMonthlyForcast: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/forecast/monthly`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching monthly forecast:', error);
      throw error;
    }
  },

  // =================== SMART REMINDER APIs ===================

  /**
   * Get optimal reminder timing for a mandate
   * @param {string} mandateId - Mandate ID
   * @param {string} token - Auth token
   * @returns {Promise<Object>} Optimal reminder timing and settings
   */
  getOptimalReminderTiming: async (mandateId, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/reminder/optimal/${mandateId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching optimal reminder timing:', error);
      throw error;
    }
  },

  /**
   * Get all reminders for current user
   * @param {string} token - Auth token
   * @returns {Promise<Object>} All smart reminders
   */
  getAllReminders: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/reminders/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching reminders:', error);
      throw error;
    }
  },

  /**
   * Update message preferences for a mandate reminder
   * @param {string} mandateId - Mandate ID
   * @param {Object} preferences - Preference object { language, tone }
   * @param {string} token - Auth token
   * @returns {Promise<Object>} Updated reminder
   */
  updateMessagePreference: async (mandateId, preferences, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/reminder/preference/${mandateId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(preferences)
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating message preference:', error);
      throw error;
    }
  },

  // =================== DASHBOARD APIs ===================

  /**
   * Get complete AI dashboard overview
   * @param {string} token - Auth token
   * @returns {Promise<Object>} All dashboard data combined
   */
  getAIDashboardOverview: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/dashboard/overview`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching AI dashboard overview:', error);
      throw error;
    }
  },

  // =================== DATA SYNC APIs ===================

  /**
   * Sync payment data to update analytics
   * @param {string} mandateId - Mandate ID
   * @param {Object} paymentData - Payment information
   * @param {string} token - Auth token
   * @returns {Promise<Object>} Updated risk assessment
   */
  syncPaymentData: async (mandateId, paymentData, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/sync/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          mandateId,
          paymentData
        })
      });
      return await response.json();
    } catch (error) {
      console.error('Error syncing payment data:', error);
      throw error;
    }
  },

  /**
   * Manually trigger recalculation of all AI metrics
   * @param {string} token - Auth token
   * @returns {Promise<Object>} Recalculation status
   */
  recalculateAllMetrics: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/recalculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error recalculating metrics:', error);
      throw error;
    }
  }
};

export default aiAPI;
