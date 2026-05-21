import { Component, type ErrorInfo, type ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { Text } from "./Text";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
    override state: State = { error: null };

    static getDerivedStateFromError(error: Error): State {
        return { error };
    }

    override componentDidCatch(error: Error, info: ErrorInfo): void {
        console.error("ErrorBoundary caught", error, info.componentStack);
    }

    override render() {
        if (this.state.error) {
            return (
                <View style={styles.root}>
                    <ScrollView contentContainerStyle={styles.scroll}>
                        <Text variant="title" style={{ color: "#fff" }}>
                            Something went wrong
                        </Text>
                        <Text variant="body" style={{ color: "#fbb", marginTop: 12 }}>
                            {this.state.error.message}
                        </Text>
                        {this.state.error.stack && (
                            <Text variant="muted" style={{ color: "#999", marginTop: 12 }}>
                                {this.state.error.stack}
                            </Text>
                        )}
                    </ScrollView>
                </View>
            );
        }
        return this.props.children;
    }
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#0b0d12" },
    scroll: { padding: 24, paddingTop: 80 },
});
