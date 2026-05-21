module.exports = function (api) {
    api.cache(true);
    return {
        presets: ["babel-preset-expo"],
        plugins: [
            // Reanimated 4 moved its babel plugin to react-native-worklets.
            // Must be last.
            "react-native-worklets/plugin",
        ],
    };
};
