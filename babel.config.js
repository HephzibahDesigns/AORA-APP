module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "nativewind/babel", // Tailwind CSS plugin for React Native
      "react-native-reanimated/plugin", // Reanimated plugin
    ],
  };
};
