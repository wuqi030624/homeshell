import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import Components from "unplugin-vue-components/vite";
import { AntDesignVueResolver } from "unplugin-vue-components/resolvers";
import { resolve } from "path";

export default defineConfig({
  server: {
    port: 3000,
    host: "0.0.0.0", // 允许 WSL 外部访问
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  plugins: [
    vue(),
    // 按需加载 ant-design-vue
    Components({
      resolvers: [AntDesignVueResolver()],
    }),
    process.env.BUILD_CRX && chromeExtension(),
  ].filter(Boolean),
});
