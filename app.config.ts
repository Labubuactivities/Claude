import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
    name: "Word",
    slug: "wordapp",
    version: "0.1.0",
    orientation: "portrait",
    scheme: "wordapp",
    userInterfaceStyle: "automatic",
    splash: {
        backgroundColor: "#0b0d12",
        resizeMode: "contain",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
        supportsTablet: true,
        bundleIdentifier: "app.wordapp.mobile",
        infoPlist: {
            ITSAppUsesNonExemptEncryption: false,
        },
    },
    android: {
        package: "app.wordapp.mobile",
    },
    plugins: [
        "expo-router",
        [
            "expo-notifications",
            {
                color: "#0b0d12",
            },
        ],
    ],
    experiments: {
        typedRoutes: true,
    },
    extra: {
        supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
        supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
        posthogApiKey: process.env.EXPO_PUBLIC_POSTHOG_API_KEY,
        posthogHost: process.env.EXPO_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
    },
};

export default config;
