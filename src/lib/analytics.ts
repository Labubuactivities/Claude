import Constants from "expo-constants";
import { PostHog } from "posthog-react-native";

const extra = (Constants.expoConfig?.extra ?? {}) as {
    posthogApiKey?: string;
    posthogHost?: string;
};

type Json = string | number | boolean | null | Json[] | { [k: string]: Json };

let client: PostHog | null = null;

export async function initAnalytics(): Promise<void> {
    if (!extra.posthogApiKey) {
        console.info("PostHog disabled: no API key configured.");
        return;
    }
    if (client) return;
    client = new PostHog(extra.posthogApiKey, {
        host: extra.posthogHost,
        captureNativeAppLifecycleEvents: true,
        flushAt: 20,
    });
    await client.ready();
}

export function track(event: string, properties?: Record<string, Json>): void {
    client?.capture(event, properties);
}

export function identify(userId: string, properties?: Record<string, Json>): void {
    client?.identify(userId, properties);
}

export function reset(): void {
    client?.reset();
}
