import {createRouter, createWebHistory, NavigationGuardNext, RouteLocationNormalizedGeneric} from "vue-router";
import NotFound from "../components/NotFound.vue";
import Home from "../components/Home.vue";
import Login from "../components/Login.vue";
import Register from "../components/Register.vue";
import {authService, waitForAuthInitialization} from "../firebase/firebase.auth.ts";
import Test from "../components/Test.vue";
import SignInResult from "../components/SignInResult.vue";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: "/", component: Home
        },
        {
            path: "/login", component: Login
        },
        {
            path: "/register", component: Register
        },
        {
            path: "/test", component: Test, meta: {
                requiresAuth: true
            }
        },
        {
            path: "/signInResult", component: SignInResult
        },
        {
            path: "/:pathMatch(.*)*", component: NotFound
        }
    ],
})

function verifyAccess(to: RouteLocationNormalizedGeneric, next: NavigationGuardNext) {
    if (to.matched.some((record) => record.meta.requiresAuth)) {
        if (!authService.isAuthenticated.value) {
            return next({path: "/login"})
        }
    }
    if (to.path === "/login" && authService.isAuthenticated.value) {
        return next({path: "/"})
    }
    next()
}

router.beforeEach(
    async (
        to: RouteLocationNormalizedGeneric,
        _from: RouteLocationNormalizedGeneric,
        next: NavigationGuardNext): Promise<void> => {
        await waitForAuthInitialization()
        verifyAccess(to, next)
    })

export default router