const { defineConfig } = require("cypress");
require('dotenv').config();

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // Load environment variables from .env file
    },
  },
  env: {...process.env}
});
