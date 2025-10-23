import { createRouter, createWebHistory } from "vue-router";
import LoginView from "@/views/loginView.vue";
import RegisterView from "../views/RegisterView.vue";
import Dashboard from '@/views/Dashboard.vue';
import Orders from '@/views/OrdersView.vue';
import CreateOrderView  from "@/views/CreateOrderView.vue";
import Profile from "@/views/Profile.vue";








const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      redirect: "/dashboard",
      meta: { requiresAuth: true }, 
        

    },
    {
      path: "/login",
      name: "login",
      component: LoginView,
    },
    {
      path: "/register",
      name: "register",
      component: RegisterView,
    },
   {
       path: '/dashboard',
       name: 'dashboard',
       component: Dashboard,
       meta: { requiresAuth: true }
     },
    {
     path: '/orders',
     name: 'orders',
       component: Orders,
       meta: { requiresAuth: true }
     },
     {
       path: '/create-order',
       name: 'create-order',
       component: CreateOrderView,
       meta: { requiresAuth: true }
     },
     
    {
      path: '/profile',
       name: 'profile',
       component: Profile,
       meta: { requiresAuth: true }
     },
    // Catch-all route for 404 - CORREGIDO
    // {
    //   path: '/:pathMatch(.*)*',
    //   name: 'NotFound',
    //   component: NotFound
    // }
  ],
});

// Función helper para obtener el token
const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem("authToken");
  } catch (error) {
    console.error("Error accessing localStorage:", error);
    return null;
  }
};

// Navigation guard for authentication - MEJORADO
router.beforeEach((to, from, next) => {
  const requiresAuth = to.meta.requiresAuth;
  const token = getAuthToken();

  console.log(
    "Navigating to:",
    to.name,
    "Requires auth:",
    requiresAuth,
    "Has token:",
    !!token
  );

  if (requiresAuth && !token) {
    console.log("Redirecting to login - no token");
    next("/login");
  } else if ((to.name === "login" || to.name === "register") && token) {
    console.log("Redirecting to dashboard - already authenticated");
    next("/dashboard");
  } else {
    next();
  }
});

export default router;
