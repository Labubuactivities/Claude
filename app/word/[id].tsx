import { useLocalSearchParams } from "expo-router";

import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";

export default function WordScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    return (
        <Screen>
            <Text variant="title">Word #{id}</Text>
            <Text variant="caption">
                Word card content will land in M2 once the ingest pipeline populates the database.
            </Text>
        </Screen>
    );
}
