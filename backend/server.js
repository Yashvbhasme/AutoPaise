const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect database
connectDB();

const app = express();

const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:3000',
  'https://auto-paise.vercel.app',
];

const normalizeOrigin = (origin) => origin?.trim().replace(/\/+$/, '');

const envAllowedOrigins = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  ...(process.env.CORS_ORIGINS || '').split(','),
]
  .map(normalizeOrigin)
  .filter(Boolean);

const allowedOrigins = new Set([
  ...defaultAllowedOrigins,
  ...envAllowedOrigins,
].map(normalizeOrigin));

// Webhook needs raw body BEFORE json parser
app.use(
  '/api/razorpay/webhook',
  express.raw({ type: '*/*' })
);

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(normalizeOrigin(origin))) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes
app.use('/api/auth', 
  require('./routes/authRoutes'));
app.use('/api/mandates', 
  require('./routes/mandateRoutes'));
app.use('/api/razorpay', 
  require('./routes/razorpayRoutes'));
app.use('/api/admin',
  require('./routes/adminRoutes'));
app.use('/api/ai',
  require('./routes/aiRoutes'));

// Serve static files for uploads
app.use('/uploads', express.static('uploads'));

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 RecurPay API is running!',
    version: '1.0.0'
  });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(
    `🚀 RecurPay Server running on port ${PORT}`
  );
});
