import DetailView from "@/views/DetailView.vue";
import HomeView from "@/views/HomeView.vue";
import LoginView from "@/views/LoginView.vue";
import { computed } from "vue";
import { createRouter, createWebHashHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "Home",
    component: HomeView,
    meta: { requiresAuth: true },
  },
  {
    path: "/login",
    name: "Login",
    component: LoginView,
    meta: { guest: true },
  },
  {
    path: "/detail",
    name: "Detail",
    component: DetailView,
    meta: { requiresAuth: true },
  },
  // TODO: Other roots
];

const router = createRouter({ history: createWebHashHistory(import.meta.env.BASE_URL), routes, });

router.beforeEach((to, from, next) => {
  const jwtToken = document.cookie.split("; ").find((row) => row.startsWith("Velo.JWT="))?.split("=")[1];

  const hasJwtToken = computed(() => jwtToken !== undefined && jwtToken !== null);

  if (to.meta.requiresAuth && !hasJwtToken.value) {
    next({ name: "Login" });
  } else if (to.meta.guest && hasJwtToken.value) {
    next({ name: "Home" });
  } else {
    next();
  }
});

export default router;
