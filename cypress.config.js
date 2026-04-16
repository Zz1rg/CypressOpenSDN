const { defineConfig } = require("cypress");
require('dotenv').config();

module.exports = defineConfig({
  e2e: {
    watchForFileChanges: false,
    chromeWebSecurity: false,
    setupNodeEvents(on, config) {
      // Load environment variables from .env file
    },
  },
  env: {...process.env}
});
