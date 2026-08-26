const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, {
  input: "./global.css",
  // Keep CSS virtual during static Web export; Netlify does not retain Metro cache files.
  forceWriteFileSystem: false,
});
