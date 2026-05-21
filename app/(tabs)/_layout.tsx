import { Tabs } from "expo-router";

import { useTheme } from "@/theme/provider";

export default function TabsLayout() {
    const theme = useTheme();
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: theme.colors.accent,
                tabBarInactiveTintColor: theme.colors.textMuted,
                tabBarStyle: {
                    backgroundColor: theme.colors.bg,
                    borderTopColor: theme.colors.border,
                },
                headerStyle: { backgroundColor: theme.colors.bg },
                headerTitleStyle: { color: theme.colors.textPrimary },
                headerTintColor: theme.colors.accent,
            }}
        >
            <Tabs.Screen name="index" options={{ title: "Today" }} />
            <Tabs.Screen name="browse" options={{ title: "Browse" }} />
            <Tabs.Screen name="saved" options={{ title: "Saved" }} />
            <Tabs.Screen name="profile" options={{ title: "Profile" }} />
        </Tabs>
    );
}
