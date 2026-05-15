import { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/lib/auth";
import { useTheme } from "@/theme/provider";

export default function SignIn() {
    const theme = useTheme();
    const signInWithEmail = useAuth((s) => s.signInWithEmail);

    const [email, setEmail] = useState("");
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sent, setSent] = useState(false);

    const handleSubmit = async () => {
        if (!email.trim()) return;
        setSending(true);
        setError(null);
        const { error: err } = await signInWithEmail(email.trim());
        setSending(false);
        if (err) {
            setError(err);
        } else {
            setSent(true);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <View style={[styles.container, { padding: theme.spacing(6) }]}>
                    <Text
                        style={[
                            styles.title,
                            { color: theme.colors.textPrimary, fontSize: 28 * theme.fontScale },
                        ]}
                    >
                        Word
                    </Text>
                    <Text
                        style={[
                            styles.subtitle,
                            { color: theme.colors.textSecondary, fontSize: 16 * theme.fontScale },
                        ]}
                    >
                        Sign in to start wandering.
                    </Text>

                    {sent ? (
                        <Text
                            style={[
                                styles.note,
                                {
                                    color: theme.colors.success,
                                    fontSize: 15 * theme.fontScale,
                                    marginTop: theme.spacing(6),
                                },
                            ]}
                        >
                            Check your email for a sign-in link.
                        </Text>
                    ) : (
                        <>
                            <TextInput
                                value={email}
                                onChangeText={setEmail}
                                placeholder="you@example.com"
                                placeholderTextColor={theme.colors.textMuted}
                                autoCapitalize="none"
                                autoComplete="email"
                                inputMode="email"
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: theme.colors.surface,
                                        borderColor: theme.colors.border,
                                        color: theme.colors.textPrimary,
                                        borderRadius: theme.radii.md,
                                        fontSize: 16 * theme.fontScale,
                                        padding: theme.spacing(3.5),
                                        marginTop: theme.spacing(6),
                                    },
                                ]}
                            />

                            <Pressable
                                onPress={handleSubmit}
                                disabled={sending || !email.trim()}
                                style={({ pressed }) => [
                                    styles.button,
                                    {
                                        backgroundColor: theme.colors.accent,
                                        borderRadius: theme.radii.md,
                                        padding: theme.spacing(3.5),
                                        marginTop: theme.spacing(3),
                                        opacity: sending || !email.trim() ? 0.5 : pressed ? 0.85 : 1,
                                    },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.buttonText,
                                        { color: theme.colors.accentOn, fontSize: 16 * theme.fontScale },
                                    ]}
                                >
                                    {sending ? "Sending…" : "Send magic link"}
                                </Text>
                            </Pressable>

                            {error && (
                                <Text
                                    style={[
                                        styles.error,
                                        {
                                            color: theme.colors.danger,
                                            fontSize: 14 * theme.fontScale,
                                            marginTop: theme.spacing(3),
                                        },
                                    ]}
                                >
                                    {error}
                                </Text>
                            )}
                        </>
                    )}
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center" },
    title: { fontWeight: "700" },
    subtitle: { marginTop: 8 },
    input: { borderWidth: 1 },
    button: { alignItems: "center" },
    buttonText: { fontWeight: "600" },
    note: { textAlign: "center" },
    error: { textAlign: "center" },
});
