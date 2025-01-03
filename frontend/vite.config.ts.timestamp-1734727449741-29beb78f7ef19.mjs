// vite.config.ts
import { defineConfig } from "file:///usr/src/app/node_modules/vite/dist/node/index.js";
import react from "file:///usr/src/app/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
function reactVirtualized() {
  const WRONG_CODE = `import { bpfrpt_proptype_WindowScroller } from "../WindowScroller.js";`;
  return {
    name: "my:react-virtualized",
    async configResolved() {
      const reactVirtualizedPath = path.dirname(
        fileURLToPath(import.meta.resolve("react-virtualized"))
      );
      const brokenFilePath = path.join(
        reactVirtualizedPath,
        "..",
        // back to dist
        "es",
        "WindowScroller",
        "utils",
        "onScroll.js"
      );
      const brokenCode = await readFile(brokenFilePath, "utf-8");
      const fixedCode = brokenCode.replace(WRONG_CODE, "");
      await writeFile(brokenFilePath, fixedCode);
    }
  };
}
var vite_config_default = defineConfig({
  plugins: [react(), reactVirtualized()],
  optimizeDeps: {
    exclude: ["@ffmpeg/ffmpeg", "@ffmpeg/util"]
  },
  server: {
    host: true,
    port: 3e3,
    // This is the port which we will use in docker
    // Thanks @sergiomoura for the window fix
    // add the next lines if you're using windows and hot reload doesn't work
    watch: {
      usePolling: true
    },
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp"
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvdXNyL3NyYy9hcHBcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi91c3Ivc3JjL2FwcC92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vdXNyL3NyYy9hcHAvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xuXG5pbXBvcnQgeyByZWFkRmlsZSwgd3JpdGVGaWxlIH0gZnJvbSBcImZzL3Byb21pc2VzXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCB9IGZyb20gXCJ1cmxcIjtcbmltcG9ydCB0eXBlIHsgUGx1Z2luT3B0aW9uIH0gZnJvbSBcInZpdGVcIjtcbi8vIC4uLlxuXG5mdW5jdGlvbiByZWFjdFZpcnR1YWxpemVkKCk6IFBsdWdpbk9wdGlvbiB7XG4gIGNvbnN0IFdST05HX0NPREUgPSBgaW1wb3J0IHsgYnBmcnB0X3Byb3B0eXBlX1dpbmRvd1Njcm9sbGVyIH0gZnJvbSBcIi4uL1dpbmRvd1Njcm9sbGVyLmpzXCI7YDtcblxuICByZXR1cm4ge1xuICAgIG5hbWU6IFwibXk6cmVhY3QtdmlydHVhbGl6ZWRcIixcbiAgICBhc3luYyBjb25maWdSZXNvbHZlZCgpIHtcbiAgICAgIGNvbnN0IHJlYWN0VmlydHVhbGl6ZWRQYXRoID0gcGF0aC5kaXJuYW1lKFxuICAgICAgICBmaWxlVVJMVG9QYXRoKGltcG9ydC5tZXRhLnJlc29sdmUoXCJyZWFjdC12aXJ0dWFsaXplZFwiKSlcbiAgICAgICk7XG5cbiAgICAgIGNvbnN0IGJyb2tlbkZpbGVQYXRoID0gcGF0aC5qb2luKFxuICAgICAgICByZWFjdFZpcnR1YWxpemVkUGF0aCxcbiAgICAgICAgXCIuLlwiLCAvLyBiYWNrIHRvIGRpc3RcbiAgICAgICAgXCJlc1wiLFxuICAgICAgICBcIldpbmRvd1Njcm9sbGVyXCIsXG4gICAgICAgIFwidXRpbHNcIixcbiAgICAgICAgXCJvblNjcm9sbC5qc1wiXG4gICAgICApO1xuICAgICAgY29uc3QgYnJva2VuQ29kZSA9IGF3YWl0IHJlYWRGaWxlKGJyb2tlbkZpbGVQYXRoLCBcInV0Zi04XCIpO1xuXG4gICAgICBjb25zdCBmaXhlZENvZGUgPSBicm9rZW5Db2RlLnJlcGxhY2UoV1JPTkdfQ09ERSwgXCJcIik7XG4gICAgICBhd2FpdCB3cml0ZUZpbGUoYnJva2VuRmlsZVBhdGgsIGZpeGVkQ29kZSk7XG4gICAgfSxcbiAgfTtcbn1cblxuLy8gaHR0cHM6Ly92aXRlLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbcmVhY3QoKSwgcmVhY3RWaXJ0dWFsaXplZCgpXSxcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgZXhjbHVkZTogW1wiQGZmbXBlZy9mZm1wZWdcIiwgXCJAZmZtcGVnL3V0aWxcIl0sXG4gIH0sXG4gIHNlcnZlcjoge1xuICAgIGhvc3Q6IHRydWUsXG4gICAgcG9ydDogMzAwMCwgLy8gVGhpcyBpcyB0aGUgcG9ydCB3aGljaCB3ZSB3aWxsIHVzZSBpbiBkb2NrZXJcbiAgICAvLyBUaGFua3MgQHNlcmdpb21vdXJhIGZvciB0aGUgd2luZG93IGZpeFxuICAgIC8vIGFkZCB0aGUgbmV4dCBsaW5lcyBpZiB5b3UncmUgdXNpbmcgd2luZG93cyBhbmQgaG90IHJlbG9hZCBkb2Vzbid0IHdvcmtcbiAgICB3YXRjaDoge1xuICAgICAgdXNlUG9sbGluZzogdHJ1ZSxcbiAgICB9LFxuICAgIGhlYWRlcnM6IHtcbiAgICAgIFwiQ3Jvc3MtT3JpZ2luLU9wZW5lci1Qb2xpY3lcIjogXCJzYW1lLW9yaWdpblwiLFxuICAgICAgXCJDcm9zcy1PcmlnaW4tRW1iZWRkZXItUG9saWN5XCI6IFwicmVxdWlyZS1jb3JwXCIsXG4gICAgfSxcbiAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFzTixTQUFTLG9CQUFvQjtBQUNuUCxPQUFPLFdBQVc7QUFFbEIsU0FBUyxVQUFVLGlCQUFpQjtBQUNwQyxPQUFPLFVBQVU7QUFDakIsU0FBUyxxQkFBcUI7QUFJOUIsU0FBUyxtQkFBaUM7QUFDeEMsUUFBTSxhQUFhO0FBRW5CLFNBQU87QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLE1BQU0saUJBQWlCO0FBQ3JCLFlBQU0sdUJBQXVCLEtBQUs7QUFBQSxRQUNoQyxjQUFjLFlBQVksUUFBUSxtQkFBbUIsQ0FBQztBQUFBLE1BQ3hEO0FBRUEsWUFBTSxpQkFBaUIsS0FBSztBQUFBLFFBQzFCO0FBQUEsUUFDQTtBQUFBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQ0Y7QUFDQSxZQUFNLGFBQWEsTUFBTSxTQUFTLGdCQUFnQixPQUFPO0FBRXpELFlBQU0sWUFBWSxXQUFXLFFBQVEsWUFBWSxFQUFFO0FBQ25ELFlBQU0sVUFBVSxnQkFBZ0IsU0FBUztBQUFBLElBQzNDO0FBQUEsRUFDRjtBQUNGO0FBR0EsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLE1BQU0sR0FBRyxpQkFBaUIsQ0FBQztBQUFBLEVBQ3JDLGNBQWM7QUFBQSxJQUNaLFNBQVMsQ0FBQyxrQkFBa0IsY0FBYztBQUFBLEVBQzVDO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFHTixPQUFPO0FBQUEsTUFDTCxZQUFZO0FBQUEsSUFDZDtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1AsOEJBQThCO0FBQUEsTUFDOUIsZ0NBQWdDO0FBQUEsSUFDbEM7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
