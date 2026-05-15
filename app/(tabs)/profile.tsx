import { Pressable, StyleSheet, View } from "react-native";

import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { track } from "@/lib/analytics";
import { useAuth } from "@/lib/auth";
import { PREFS_MANIFEST, type PrefDef } from "@/prefs/manifest";
import { usePref, usePrefsStore } from "@/prefs/use-pref";
import { useTheme } from "@/theme/provider";

export default function Profile() {
    const theme = useTheme();
    const session = useAuth((s) => s.session);
    const previewMode = useAuth((s) => s.previewMode);
    const signOut = useAuth((s) => s.signOut);

    const appearancePrefs = PREFS_MANIFEST.filter((p) => p.group === "appearance");

    return (
        <Screen>
            <Text variant="title">Profile</Text>
            <Text variant="caption">{previewMode ? "Preview mode (not signed in)" : (session?.user.email ?? "—")}</Text>

            <Text variant="heading" style={{ marginTop: 16 }}>
                Appearance
            </Text>
            {appearancePrefs.map((pref) => (
                <PrefRow key={pref.key} pref={pref} />
            ))}

            <Pressable
                onPress={() => {
                    track("ping_test");
                }}
                style={({ pressed }) => [
                    styles.secondaryBtn,
                    {
                        borderColor: theme.colors.border,
                        backgroundColor: theme.colors.surface,
                        borderRadius: theme.radii.md,
                        padding: theme.spacing(3.5),
                        marginTop: theme.spacing(6),
                        opacity: pressed ? 0.7 : 1,
                    },
                ]}
            >
                <Text variant="body">Send analytics ping</Text>
            </Pressable>

            <Pressable
                onPress={signOut}
                style={({ pressed }) => [
                    styles.dangerBtn,
                    {
                        borderColor: theme.colors.danger,
                        borderRadius: theme.radii.md,
                        padding: theme.spacing(3.5),
                        marginTop: theme.spacing(3),
                        opacity: pressed ? 0.7 : 1,
                    },
                ]}
            >
                <Text variant="body" style={{ color: theme.colors.danger }}>
                    {previewMode ? "Exit preview" : "Sign out"}
                </Text>
            </Pressable>
        </Screen>
    );
}

function PrefRow({ pref }: { pref: PrefDef }) {
    const theme = useTheme();
    const current = usePref(pref.key);
    const setGlobal = usePrefsStore((s) => s.setGlobal);

    if (pref.kind === "enum") {
        return (
            <View style={styles.prefRow}>
                <Text variant="body">{pref.label}</Text>
                <View style={[styles.optionRow, { gap: theme.spacing(2) }]}>
                    {pref.options.map((opt) => {
                        const selected = current === opt.value;
                        return (
                            <Pressable
                                key={opt.value}
                                onPress={() => setGlobal(pref.key, opt.value)}
                                style={({ pressed }) => [
                                    styles.chip,
                                    {
                                        borderColor: selected ? theme.colors.accent : theme.colors.border,
                                        backgroundColor: selected ? theme.colors.accent : "transparent",
                                        borderRadius: theme.radii.sm,
                                        paddingHorizontal: theme.spacing(2.5),
                                        paddingVertical: theme.spacing(1.5),
                                        opacity: pressed ? 0.7 : 1,
                                    },
                                ]}
                            >
                                <Text
                                    variant="caption"
                                    style={{
                                        color: selected ? theme.colors.accentOn : theme.colors.textSecondary,
                                    }}
                                >
                                    {opt.label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
            </View>
        );
    }

    if (pref.kind === "boolean") {
        const isOn = Boolean(current);
        return (
            <Pressable
                onPress={() => setGlobal(pref.key, !isOn)}
                style={[styles.prefRow, { flexDirection: "row", justifyContent: "space-between" }]}
            >
                <Text variant="body">{pref.label}</Text>
                <View
                    style={{
                        width: 44,
                        height: 26,
                        borderRadius: 13,
                        backgroundColor: isOn ? theme.colors.accent : theme.colors.border,
                        justifyContent: "center",
                        alignItems: isOn ? "flex-end" : "flex-start",
                        paddingHorizontal: 3,
                    }}
                >
                    <View
                        style={{
                            width: 20,
                            height: 20,
                            borderRadius: 10,
                            backgroundColor: theme.colors.bg,
                        }}
                    />
                </View>
            </Pressable>
        );
    }

    return null;
}

const styles = StyleSheet.create({
    prefRow: { gap: 6 },
    optionRow: { flexDirection: "row", flexWrap: "wrap" },
    chip: { borderWidth: 1 },
    secondaryBtn: { borderWidth: 1, alignItems: "center" },
    dangerBtn: { borderWidth: 1, alignItems: "center" },
});
