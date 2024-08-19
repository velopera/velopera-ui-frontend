import App from "@/App.vue";
import "@/plugins/types";
import router from "@/router";
import "@mdi/font/css/materialdesignicons.css";
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

try {
  app.use(router);
  app.use(vuetify);
  app.mount("#app");
} catch (error) {
  console.error("Vue app initialization error:", error);
}
