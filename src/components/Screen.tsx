import { type ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "@/theme/provider";

export function Screen({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
    const theme = useTheme();
    const Wrapper = scroll ? ScrollView : View;
    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.bg }]} edges={["bottom"]}>
            <Wrapper
                style={styles.body}
                contentContainerStyle={
                    scroll ? { padding: theme.spacing(5), gap: theme.spacing(4) } : undefined
                }
            >
                {scroll ? children : <View style={{ flex: 1, padding: theme.spacing(5) }}>{children}</View>}
            </Wrapper>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1 },
    body: { flex: 1 },
});
