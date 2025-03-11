import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.1.0/index.js';

// Define custom metrics
const errorRate = new Rate('error_rate');
const addResponseTime = new Trend('add_response_time');
const subtractResponseTime = new Trend('subtract_response_time');
const multiplyResponseTime = new Trend('multiply_response_time');

// Default test options
export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp-up to 10 users
    { duration: '1m', target: 10 },   // Stay at 10 users for 1 minute
    { duration: '30s', target: 50 },  // Ramp-up to 50 users
    { duration: '2m', target: 50 },   // Stay at 50 users for 2 minutes
    { duration: '30s', target: 0 },   // Ramp-down to 0 users
  ],
  thresholds: {
    // Define performance thresholds
    'http_req_duration': ['p(95)<500'],  // 95% of requests should be below 500ms
    'error_rate': ['rate<0.1'],          // Error rate should be less than 10%
    'add_response_time': ['p(95)<300'],  // 95% of add operations should be below 300ms
  },
};

export default function() {
  // Generate random test data
  const a = randomIntBetween(1, 100);
  const b = randomIntBetween(1, 100);
  
  // Define headers
  const headers = {
    'Content-Type': 'application/json',
    'X-User-ID': 'k6-load-test',
    'X-User-Country': 'load-test',
  };
  
  // Test home page
  const homeResponse = http.get('http://localhost:3000/');
  check(homeResponse, {
    'home status is 200': (r) => r.status === 200,
    'home contains welcome message': (r) => r.body.includes('Welcome'),
  });
  
  // Test health check
  const healthResponse = http.get('http://localhost:3000/health');
  check(healthResponse, {
    'health status is 200': (r) => r.status === 200,
    'health contains UP status': (r) => r.json('status') === 'UP',
  });
  
  // Test add operation
  const addPayload = JSON.stringify({
    operation: 'add',
    a: a,
    b: b,
  });
  
  const addResponse = http.post('http://localhost:3000/calculate', addPayload, { headers });
  
  const addSuccess = check(addResponse, {
    'add status is 200': (r) => r.status === 200,
    'add result is correct': (r) => r.json('result') === a + b,
  });
  
  // Record error rate and response time
  errorRate.add(!addSuccess);
  addResponseTime.add(addResponse.timings.duration);
  
  // Test subtract operation
  const subtractPayload = JSON.stringify({
    operation: 'subtract',
    a: a,
    b: b,
  });
  
  const subtractResponse = http.post('http://localhost:3000/calculate', subtractPayload, { headers });
  
  const subtractSuccess = check(subtractResponse, {
    'subtract status is 200': (r) => r.status === 200,
    'subtract result is correct': (r) => r.json('result') === a - b,
  });
  
  // Record error rate and response time
  errorRate.add(!subtractSuccess);
  subtractResponseTime.add(subtractResponse.timings.duration);
  
  // Test multiply operation
  const multiplyPayload = JSON.stringify({
    operation: 'multiply',
    a: a,
    b: b,
  });
  
  const multiplyResponse = http.post('http://localhost:3000/calculate', multiplyPayload, { headers });
  
  const multiplySuccess = check(multiplyResponse, {
    'multiply status is 200': (r) => r.status === 200,
    'multiply result is correct': (r) => r.json('result') === a * b,
  });
  
  // Record error rate and response time
  errorRate.add(!multiplySuccess);
  multiplyResponseTime.add(multiplyResponse.timings.duration);
  
  // Wait between iterations
  sleep(randomIntBetween(1, 3));
}