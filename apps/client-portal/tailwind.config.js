const sharedConfig = require("../../packages/ui/tailwind.config.js");

module.exports = {
  ...sharedConfig,
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/**/*.{js,ts,jsx,tsx}",
  ],
};
