import { Text as RNText, type TextProps, type TextStyle } from "react-native";

import { useTheme } from "@/theme/provider";

type Variant = "title" | "heading" | "body" | "caption" | "muted";

const VARIANT_SIZES: Record<Variant, number> = {
    title: 28,
    heading: 20,
    body: 16,
    caption: 14,
    muted: 13,
};

const VARIANT_WEIGHTS: Record<Variant, TextStyle["fontWeight"]> = {
    title: "700",
    heading: "600",
    body: "400",
    caption: "400",
    muted: "400",
};

export function Text({
    variant = "body",
    style,
    ...rest
}: TextProps & { variant?: Variant }) {
    const theme = useTheme();
    const color =
        variant === "muted"
            ? theme.colors.textMuted
            : variant === "caption"
              ? theme.colors.textSecondary
              : theme.colors.textPrimary;
    return (
        <RNText
            {...rest}
            style={[
                {
                    color,
                    fontSize: VARIANT_SIZES[variant] * theme.fontScale,
                    fontWeight: VARIANT_WEIGHTS[variant],
                },
                style,
            ]}
        />
    );
}
