import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";

export default function Browse() {
    return (
        <Screen>
            <Text variant="title">Browse</Text>
            <Text variant="caption">
                Search and wander the dictionary. Coming in M2 — the language-agnostic ingest
                pipeline first has to populate words.
            </Text>
        </Screen>
    );
}
