# 🚀 AI Features Integration Guide

## Quick Start

This guide will help you integrate the AI features into your existing AutoPaise application.

---

## Step 1: Update App.jsx Routes

Add the AI Dashboard route to your main App component:

```jsx
// In frontend/src/App.jsx

import AIDashboard from './pages/AIDashboard';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* ... existing routes ... */}
        
        {/* Add this new route */}
        <Route path="/ai-dashboard" element={<AIDashboard />} />
        
        {/* ... more routes ... */}
      </Routes>
    </Router>
  );
}
```

---

## Step 2: Update Navbar Component

Add a link to the AI Dashboard in your Navbar:

```jsx
// In frontend/src/components/Navbar.jsx

import { BarChart3 } from 'lucide-react'; // Add to imports

function Navbar() {
  return (
    <nav>
      {/* ... existing navbar code ... */}
      
      <div className="nav-links">
        {/* ... existing links ... */}
        
        {/* Add this new navigation link */}
        <Link 
          to="/ai-dashboard" 
          className="nav-link flex items-center gap-2 hover:text-blue-600"
          title="AI-Powered Insights Dashboard"
        >
          <BarChart3 size={20} />
          <span className="hidden md:inline">AI Insights</span>
        </Link>
      </div>
    </nav>
  );
}
```

---

## Step 3: Add Risk Badges to Mandate Cards

Update your mandate card component to display risk indicators:

```jsx
// In frontend/src/components/MandateCard.jsx or similar

import { RiskBadge, SmartReminderCard } from './RiskAndReminder';

function MandateCard({ mandate, userToken }) {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold">{mandate.payeeName}</h3>
          <p className="text-gray-600">₹{mandate.amount}</p>
        </div>
        <RiskBadge 
          mandateId={mandate._id} 
          userToken={userToken} 
          size="md" 
        />
      </div>
      
      {/* Optional: Add reminder card */}
      <SmartReminderCard 
        mandateId={mandate._id} 
        userToken={userToken} 
      />
    </div>
  );
}
```

---

## Step 4: Sync Payment Data from Razorpay Webhook

When a payment is processed, sync it to the AI service:

```javascript
// In backend/controllers/razorpayController.js

const AIService = require('../services/aiService');
const aiAPI = require('../utils/aiApi'); // if available

exports.handleWebhook = async (req, res) => {
  try {
    const event = req.body.event;
    const { payload } = req.body;
    
    if (event === 'payment.authorized' || event === 'payment.failed') {
      const mandate = await Mandate.findById(payloadData.mandateId);
      
      // Sync payment data to AI
      await AIService.calculateRiskScore(mandate._id);
      
      // Update analytics
      const paymentData = {
        amount: payload.amount,
        status: event === 'payment.authorized' ? 'success' : 'failed',
        failureReason: payload.failureReason || null
      };
      
      // This can also be called from frontend after payment
      // POST /api/ai/sync/payment with mandate and payment data
    }
    
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
};
```

---

## Step 5: Manual Recalculation Endpoint

For testing or admin purposes, add manual recalculation:

```javascript
// Example usage in admin panel or settings

async function recalculateAllAIMetrics() {
  try {
    const response = await fetch('http://localhost:4000/api/ai/recalculate', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('Metrics recalculated:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

---

## Step 6: Display Risk Info on Dashboard

Add risk overview to your main dashboard:

```jsx
// In frontend/src/pages/Dashboard.jsx

import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import aiAPI from '../utils/aiApi';
import RiskDashboard from '../components/RiskDashboard';

function Dashboard() {
  const { user, token } = useContext(AuthContext);
  const [riskSummary, setRiskSummary] = useState(null);

  useEffect(() => {
    const fetchRiskData = async () => {
      try {
        const data = await aiAPI.getAllRiskScores(token);
        if (data.success) {
          setRiskSummary(data.data.summary);
        }
      } catch (error) {
        console.error('Error fetching risk data:', error);
      }
    };

    if (token) fetchRiskData();
  }, [token]);

  return (
    <div>
      {/* ... existing dashboard content ... */}
      
      {/* Quick risk summary */}
      {riskSummary && (
        <div className="grid grid-cols-4 gap-4 my-6">
          <QuickCard title="Total Mandates" value={riskSummary.total} />
          <QuickCard 
            title="High Risk" 
            value={riskSummary.high} 
            color="red"
          />
          <QuickCard 
            title="Medium Risk" 
            value={riskSummary.medium} 
            color="yellow"
          />
          <QuickCard 
            title="Low Risk" 
            value={riskSummary.low} 
            color="green"
          />
        </div>
      )}
    </div>
  );
}
```

---

## Step 7: Create Admin Controls (Optional)

Create admin-only endpoints to manage AI features:

```jsx
// Example admin panel component

function AIAdminPanel() {
  const [loading, setLoading] = useState(false);
  const { token } = useContext(AuthContext);

  const recalculate = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/ai/recalculate', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      alert('All metrics recalculated successfully!');
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">AI Features Admin</h2>
      <button
        onClick={recalculate}
        disabled={loading}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? 'Recalculating...' : 'Recalculate All Metrics'}
      </button>
    </div>
  );
}
```

---

## Testing Checklist

- [ ] AI Dashboard page loads correctly
- [ ] Risk scores display for all mandates
- [ ] Revenue forecast chart renders properly
- [ ] Risk badges appear on mandate cards
- [ ] Smart reminder cards show timing recommendations
- [ ] Navigation link appears in Navbar
- [ ] Payment sync updates risk scores
- [ ] Dashboard metrics refresh button works
- [ ] Insights are generated and displayed
- [ ] All endpoints return proper responses

---

## Troubleshooting

### AI Dashboard Not Loading
```
Error: Cannot find module 'aiService'
Fix: Ensure backend/services/aiService.js exists and is properly exported
```

### Risk Scores Not Showing
```
Error: 404 from /api/ai/risk/mandate
Fix: Check that PaymentAnalytics model exists and route is registered in server.js
```

### Frontend Components Missing
```
Error: Cannot find module 'RiskDashboard'
Fix: Verify all component files are in frontend/src/components/
```

### API Connection Failed
```
Error: Failed to fetch from http://localhost:4000/api/ai/...
Fix: 
1. Ensure backend server is running
2. Check CORS settings in backend/server.js
3. Verify API_BASE_URL in frontend/src/utils/apiConfig.js
```

---

## Environment Variables

Make sure these are set in your `.env` files:

**Backend (.env)**
```
PORT=4000
MONGODB_URI=your_mongodb_url
JWT_SECRET=your_secret
CLIENT_URL=http://localhost:5173
```

**Frontend (.env)**
```
VITE_API_URL=http://localhost:4000
```

---

## Database Migrations

No database migrations needed - models are created automatically on first use.

However, if you need to initialize analytics for existing mandates:

```javascript
// Run this script once to backfill analytics

const PaymentAnalytics = require('./models/PaymentAnalytics');
const Mandate = require('./models/Mandate');
const AIService = require('./services/aiService');

async function backfillAnalytics() {
  const mandates = await Mandate.find();
  
  for (const mandate of mandates) {
    await AIService.calculateRiskScore(mandate._id);
    console.log(`Processed: ${mandate._id}`);
  }
  
  console.log('Backfill complete!');
}

// backfillAnalytics();
```

---

## Performance Optimization

The AI calculations are designed to be efficient:
- Risk scores cached in database
- Forecasts recalculated on-demand or via webhook
- Async calculation for bulk operations
- Indexes on frequently queried fields

For high-traffic deployments:
- Implement calculation job queue
- Cache forecast results with expiry
- Use database connection pooling
- Consider Redis for caching

---

## Next Steps

1. **Test all features** in development environment
2. **Monitor performance** and optimize as needed
3. **Deploy to production** with proper error handling
4. **Gather user feedback** on AI predictions
5. **Iterate** on algorithms based on accuracy

---

## Support

For issues or questions about the AI features:
1. Check the full documentation: `AI_FEATURES_DOCUMENTATION.md`
2. Review component source code
3. Check browser console for errors
4. Review backend logs for API errors

---

*Happy analyzing! 🚀*
