import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.ts";

export default mergeConfig(
    viteConfig,
    defineConfig({
        test: {
            environment: "happy-dom",
            isolate: true,

            reporters: [
                'default', 'junit',
            ],
            outputFile: './report.xml',
            coverage: {
                provider: "v8",
            },
        },
    }),
);
