const express = require('express');
const routes = require('./routes');
const { initLaunchDarkly, closeLaunchDarkly } = require('./utils/featureFlags');
const { metricsMiddleware, metricsEndpoint } = require('./middleware/metrics');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize feature flags
if (process.env.NODE_ENV !== 'test') {
  initLaunchDarkly().catch(err => {
    console.error('Error initializing LaunchDarkly:', err);
  });
}

// Add metrics middleware before routes to measure all requests
app.use(metricsMiddleware);

app.use(express.json());
app.use('/', routes);

// Add metrics endpoint
app.use(metricsEndpoint());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', version: process.env.VERSION || '1.0.0' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'production' ? 'Server error' : err.message
  });
});

if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
  
  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    closeLaunchDarkly();
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });
}

module.exports = app; // For testing