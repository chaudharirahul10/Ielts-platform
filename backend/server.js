require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const morgan = require('morgan');
const passport = require('./src/config/passport');
const errorHandler = require('./src/middleware/error.middleware');

const app = express();

app.use(helmet());
app.use(compression());
app.use(mongoSanitize());
app.use(cors({ origin: [process.env.FRONTEND_URL || 'http://localhost:3000'], credentials: true }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false });
app.use('/api/', limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/users', require('./src/routes/user.routes'));
app.use('/api/writing', require('./src/routes/writing.routes'));
app.use('/api/speaking', require('./src/routes/speaking.routes'));
app.use('/api/ai', require('./src/routes/ai.routes'));
app.use('/api/analytics', require('./src/routes/analytics.routes'));
app.use('/api/admin', require('./src/routes/admin.routes'));
app.use('/api/questions', require('./src/routes/questions.routes'));
app.use('/api/studyplan', require('./src/routes/studyplan.routes'));

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use(errorHandler);

const startServer = (port) => new Promise((resolve, reject) => {
  const server = app.listen(port, () => {
    console.log(`🚀 IELTSPro API on port ${port}`);
    resolve(server);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      const fallbackPort = port + 1;
      console.warn(`⚠️ Port ${port} is busy. Trying ${fallbackPort}...`);
      server.close(() => startServer(fallbackPort).then(resolve).catch(reject));
      return;
    }
    reject(err);
  });
});

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ieltspro')
  .then(() => {
    console.log('✅ MongoDB connected');
    const PORT = Number(process.env.PORT || 5000);
    return startServer(PORT);
  })
  .catch(err => { console.error('❌ MongoDB failed:', err.message); process.exit(1); });

module.exports = app;
