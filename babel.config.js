module.exports = function (api) {
    api.cache(true);
    return {
        presets: ["babel-preset-expo"],
        plugins: [
            // expo-router uses this; must be last.
            "react-native-reanimated/plugin",
        ],
    };
};
