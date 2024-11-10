import { extendTheme, type ThemeConfig } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

const config: ThemeConfig = {
    initialColorMode: "dark",
    useSystemColorMode: true,
};

// 3. extend the theme
const theme = extendTheme({
    config,
    styles: {
        global: (props: any) => ({
            body: {
                background: mode("linear-gradient(to right, #355C7D, #6C5B7B, #C06C84)", "linear-gradient(to right, #ad5389, #3c1053)")(props),
            },
        }),
    },
});

export default theme;