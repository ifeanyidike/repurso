import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import { readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import type { PluginOption } from "vite";
// ...

function reactVirtualized(): PluginOption {
  const WRONG_CODE = `import { bpfrpt_proptype_WindowScroller } from "../WindowScroller.js";`;

  return {
    name: "my:react-virtualized",
    async configResolved() {
      const reactVirtualizedPath = path.dirname(
        fileURLToPath(import.meta.resolve("react-virtualized"))
      );

      const brokenFilePath = path.join(
        reactVirtualizedPath,
        "..", // back to dist
        "es",
        "WindowScroller",
        "utils",
        "onScroll.js"
      );
      const brokenCode = await readFile(brokenFilePath, "utf-8");

      const fixedCode = brokenCode.replace(WRONG_CODE, "");
      await writeFile(brokenFilePath, fixedCode);
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), reactVirtualized()],
  optimizeDeps: {
    exclude: ["@ffmpeg/ffmpeg", "@ffmpeg/util"],
  },
  server: {
    host: true,
    port: 3000, // This is the port which we will use in docker
    // Thanks @sergiomoura for the window fix
    // add the next lines if you're using windows and hot reload doesn't work
    watch: {
      usePolling: true,
    },
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
});
