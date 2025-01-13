import react from "@vitejs/plugin-react";
import glsl from "vite-plugin-glsl";
import { transformWithEsbuild } from "vite";
import restart from "vite-plugin-restart";

export default {
  root: "src/",
  publicDir: "../public/",
  plugins: [
    restart({ restart: ["../public/**"] }),
    react(),
    glsl({
      include: "**/*.glsl",
    }),
    {
      name: "load+transform-js-files-as-jsx",
      async transform(code, id) {
        if (!id.match(/src\/.*\.js$/)) return null;

        return transformWithEsbuild(code, id, {
          loader: "jsx",
          jsx: "automatic",
        });
      },
    },
  ],
  assetsInclude: ["**/*.glb"],
  server: {
    host: true,
    open: !("SANDBOX_URL" in process.env || "CODESANDBOX_HOST" in process.env),
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    sourcemap: true,
  },
};
