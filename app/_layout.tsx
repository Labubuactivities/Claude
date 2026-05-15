import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { initAnalytics } from "@/lib/analytics";
import { useAuth } from "@/lib/auth";
import { useHydratePrefs } from "@/prefs/use-pref";
import { ThemeProvider, useTheme } from "@/theme/provider";

SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

export default function RootLayout() {
    return (
        <ErrorBoundary>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <SafeAreaProvider>
                    <QueryClientProvider client={queryClient}>
                        <ThemeProvider>
                            <Bootstrapper />
                        </ThemeProvider>
                    </QueryClientProvider>
                </SafeAreaProvider>
            </GestureHandlerRootView>
        </ErrorBoundary>
    );
}

function Bootstrapper() {
    const initialize = useAuth((s) => s.initialize);
    const session = useAuth((s) => s.session);
    const previewMode = useAuth((s) => s.previewMode);
    const loading = useAuth((s) => s.loading);
    const [ready, setReady] = useState(false);

    useHydratePrefs();

    useEffect(() => {
        let cancelled = false;
        const finish = () => {
            if (cancelled) return;
            setReady(true);
            SplashScreen.hideAsync().catch(() => {});
        };

        // Force-hide the splash after 4s no matter what so we never end up
        // staring at a blank screen because something hung silently.
        const fallback = setTimeout(finish, 4000);

        (async () => {
            try {
                await initAnalytics();
            } catch (e) {
                console.warn("initAnalytics failed", e);
            }
            try {
                await initialize();
            } catch (e) {
                console.warn("auth initialize failed", e);
            }
            clearTimeout(fallback);
            finish();
        })();

        return () => {
            cancelled = true;
            clearTimeout(fallback);
        };
    }, [initialize]);

    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (!ready || loading) return;
        const authed = Boolean(session) || previewMode;
        const inAuthGroup = segments[0] === "(auth)";
        if (!authed && !inAuthGroup) {
            router.replace("/(auth)/sign-in");
        } else if (authed && inAuthGroup) {
            router.replace("/(tabs)");
        }
    }, [ready, loading, session, previewMode, segments, router]);

    return <ThemedStack />;
}

function ThemedStack() {
    const theme = useTheme();
    return (
        <>
            <StatusBar style={theme.name === "light" || theme.name === "sepia" ? "dark" : "light"} />
            <Stack
                screenOptions={{
                    headerStyle: { backgroundColor: theme.colors.bg },
                    headerTitleStyle: { color: theme.colors.textPrimary },
                    headerTintColor: theme.colors.accent,
                    contentStyle: { backgroundColor: theme.colors.bg },
                }}
            >
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="word/[id]" options={{ title: "" }} />
            </Stack>
        </>
    );
}
