import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { useLanguages } from "@/lib/language-registry";

export default function Today() {
    const { data: languages, isLoading } = useLanguages();

    return (
        <Screen>
            <Text variant="title">Today</Text>
            <Text variant="caption">
                Your daily words will land here as notifications come in.
            </Text>

            <Text variant="heading" style={{ marginTop: 12 }}>
                Languages
            </Text>
            {isLoading ? (
                <Text variant="muted">Loading…</Text>
            ) : (
                (languages ?? []).map((lang) => (
                    <Text key={lang.code} variant="body">
                        {lang.name_native} · {lang.name_english}
                    </Text>
                ))
            )}
        </Screen>
    );
}
