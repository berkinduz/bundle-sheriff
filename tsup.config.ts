import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  outDir: "dist",
  splitting: false,
  sourcemap: true,
  clean: true,
  target: "node18",
  platform: "node",
  dts: false,
  banner: {
    js: "#!/usr/bin/env node",
  },
  minify: false,
});
