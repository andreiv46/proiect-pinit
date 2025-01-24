import {createRouter, createWebHistory, NavigationGuardNext, RouteLocationNormalizedGeneric} from 'vue-router'
import NotFound from '../components/NotFound.vue'
import Home from '../components/Home.vue'
import Login from '../components/Login.vue'
import Register from '../components/Register.vue'
import {useAuthStore} from '../store/auth.store.ts'
import Test from '../components/Test.vue'
import SignInResult from '../components/SignInResult.vue'
import Map from "../components/map/Map.vue";
import AddPost from "../components/AddPost.vue";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/', component: Home
        },
        {
            path: '/login', component: Login
        },
        {
            path: '/register', component: Register
        },
        {
            path: '/map', component: Map
        },
        {
            path: '/addPost', component: AddPost,
            meta: {requiresAuth: true}
        },
        {
            path: '/test', component: Test, meta: {
                requiresAuth: true
            }
        },
        {
            path: '/signInResult', component: SignInResult
        },
        {
            path: '/:pathMatch(.*)*', component: NotFound
        }
    ],
})

function verifyAccess(to: RouteLocationNormalizedGeneric, next: NavigationGuardNext, isAuthenticated: boolean) {
    if (to.matched.some((record) => record.meta.requiresAuth)) {
        if (!isAuthenticated) {
            return next({path: '/login'})
        }
    }
    if (to.path === '/login' && isAuthenticated) {
        return next({path: '/'})
    }
    next()
}

router.beforeEach(
    async (
        to: RouteLocationNormalizedGeneric,
        _from: RouteLocationNormalizedGeneric,
        next: NavigationGuardNext): Promise<void> => {
        const authStore = useAuthStore()
        if (!authStore.getIsAuthInitialized) {
            await authStore.waitForAuthInitialization()
        }
        verifyAccess(to, next, authStore.getIsAuthenticated)
    })

export default router