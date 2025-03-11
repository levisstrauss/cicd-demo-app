const express = require('express');
const router = express.Router();
const { add, subtract, multiply } = require('../utils/calculator');
const { getFlag } = require('../utils/featureFlags');

router.get('/', (req, res) => {
  res.json({ message: 'Welcome to our CI/CD demo app!' });
});

router.post('/calculate', async (req, res) => {
  const { operation, a, b } = req.body;
  
  if (!a || !b || isNaN(Number(a)) || isNaN(Number(b))) {
    return res.status(400).json({ error: 'Invalid numbers provided' });
  }
  
  // Get user information for feature flag evaluation
  const userId = req.headers['x-user-id'] || 'anonymous';
  const userCountry = req.headers['x-user-country'] || 'unknown';
  
  // Create user context for feature flags
  const user = {
    id: userId,
    country: userCountry,
    ip: req.ip
  };
  
  let result;
  switch (operation) {
    case 'add':
      result = add(Number(a), Number(b));
      break;
    case 'subtract':
      result = subtract(Number(a), Number(b));
      break;
    case 'multiply':
      result = multiply(Number(a), Number(b));
      break;
    case 'divide':
      // Feature flag for division operation
      const divisionEnabled = await getFlag('enable-division', user, false);
      if (divisionEnabled) {
        if (Number(b) === 0) {
          return res.status(400).json({ error: 'Cannot divide by zero' });
        }
        result = Number(a) / Number(b);
      } else {
        return res.status(400).json({ error: 'Division operation not available' });
      }
      break;
    default:
      return res.status(400).json({ error: 'Invalid operation' });
  }
  
  // Feature flag for enhanced response format
  const enhancedResponseEnabled = await getFlag('enhanced-response', user, false);
  
  if (enhancedResponseEnabled) {
    res.json({
      operation,
      a: Number(a),
      b: Number(b),
      result,
      timestamp: new Date().toISOString()
    });
  } else {
    res.json({ result });
  }
});

module.exports = router;