const promClient = require('prom-client');
const express = require('express');

// Create a Registry to register the metrics
const register = new promClient.Registry();

// Add a default label to all metrics
register.setDefaultLabels({
  app: 'cicd-demo-app'
});

// Enable the collection of default metrics
promClient.collectDefaultMetrics({ register });

// Create custom metrics
const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

const httpRequestCounter = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

// Register the custom metrics
register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(httpRequestCounter);

// Create a middleware function to measure request duration and count
function metricsMiddleware(req, res, next) {
  // Skip metrics route to avoid circular measurements
  if (req.path === '/metrics') {
    return next();
  }

  // Start the timer
  const start = process.hrtime();
  
  // Add response hook to capture metrics
  const originalEnd = res.end;
  res.end = function(...args) {
    // Calculate duration
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds + nanoseconds / 1e9;
    
    // Determine route (normalize to avoid cardinality explosion)
    let route = req.route ? req.route.path : req.path;
    
    // For dynamic routes, replace params with placeholders
    if (req.params) {
      Object.keys(req.params).forEach(param => {
        route = route.replace(req.params[param], `:${param}`);
      });
    }
    
    // Record metrics
    httpRequestDurationMicroseconds
      .labels(req.method, route, res.statusCode)
      .observe(duration);
    
    httpRequestCounter
      .labels(req.method, route, res.statusCode)
      .inc();
    
    // Call the original end method
    return originalEnd.apply(this, args);
  };
  
  next();
}

// Create metrics endpoint
function metricsEndpoint() {
  const router = express.Router();
  
  router.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  });
  
  return router;
}

module.exports = {
  metricsMiddleware,
  metricsEndpoint,
  register
};