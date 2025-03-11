const LaunchDarkly = require('launchdarkly-node-server-sdk');

// Initialize the LaunchDarkly client
let ldClient;

/**
 * Initialize the LaunchDarkly client
 */
async function initLaunchDarkly() {
  if (!process.env.LAUNCHDARKLY_SDK_KEY) {
    console.warn('LaunchDarkly SDK key not found. Feature flags will default to false.');
    return null;
  }

  const client = LaunchDarkly.init(process.env.LAUNCHDARKLY_SDK_KEY);
  await client.waitForInitialization();
  console.log('LaunchDarkly client initialized');
  return client;
}

/**
 * Get a feature flag value
 * @param {string} flagKey - The feature flag key
 * @param {Object} user - The user context for the flag evaluation
 * @param {boolean} defaultValue - Default value if the flag cannot be evaluated
 * @returns {Promise<boolean>} - The feature flag value
 */
async function getFlag(flagKey, user, defaultValue = false) {
  // Initialize client if needed
  if (!ldClient) {
    ldClient = await initLaunchDarkly();
    if (!ldClient) return defaultValue;
  }

  try {
    // Format the user for LaunchDarkly
    const ldUser = {
      key: user.id || 'anonymous',
      ...user
    };

    // Evaluate the flag
    return await ldClient.variation(flagKey, ldUser, defaultValue);
  } catch (error) {
    console.error(`Error evaluating flag ${flagKey}:`, error);
    return defaultValue;
  }
}

/**
 * Close the LaunchDarkly client
 */
function closeLaunchDarkly() {
  if (ldClient) {
    ldClient.close();
    ldClient = null;
  }
}

module.exports = {
  initLaunchDarkly,
  getFlag,
  closeLaunchDarkly
};