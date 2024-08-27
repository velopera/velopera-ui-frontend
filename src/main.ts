import App from "@/App.vue";
import "@/plugins/types";
import router from "@/router";
import "@mdi/font/css/materialdesignicons.css";
import { io } from "socket.io-client";
import { createApp } from "vue";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import "vuetify/styles";

const app = createApp(App);

const vuetify = createVuetify({
  components,
  directives,
  defaults: {
    VBtn: { variant: "outlined" },
    VTextField: { variant: "solo" },
  },
  theme: {
    defaultTheme: "light",
  },
});

const socket = io("https://velopera.voxel.at", {
  path: "/iot_link/",
  transports: ["websocket"],
});

app.config.globalProperties.$socket = socket;

try {
  app.use(router);
  app.use(vuetify);
  app.mount("#app");
} catch (error) {
  console.error("Vue app initialization error:", error);
}
