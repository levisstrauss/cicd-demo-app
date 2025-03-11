const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(/* on, config */) {
      // implement node event listeners here
      // Parameters commented out since they're not being used
    },
    baseUrl: 'http://localhost:3000',
    supportFile: false,
  },
});
