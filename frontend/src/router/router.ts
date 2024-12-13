import { createRouter, createWebHistory } from "vue-router";
import HelloWorld from "../components/HelloWorld.vue";
import NotFound from "../components/NotFound.vue";
import Login from "../components/Login.vue";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: "/", component: HelloWorld, props: {msg: "hellooo"}
        },
        {
            path:"/login", component: Login
        },
        {
            path: "/:pathMatch(.*)*", component: NotFound
        }
    ],
})

export default router