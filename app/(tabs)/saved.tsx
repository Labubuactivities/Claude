import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";

export default function Saved() {
    return (
        <Screen>
            <Text variant="title">Saved</Text>
            <Text variant="caption">
                Words you tap-and-save from cards or notifications will show up here.
            </Text>
        </Screen>
    );
}
