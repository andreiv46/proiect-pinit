import {createApp} from 'vue'
import './style.css'
import App from './App.vue'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import router from './router/router.ts'
import ToastService, {ToastServiceMethods} from 'primevue/toastservice'
import {definePreset} from '@primevue/themes'
import Ripple from 'primevue/ripple'
import {createPinia} from 'pinia'
import {configureAxios} from "./api/axios.config.ts";
import {VueQueryPlugin} from "@tanstack/vue-query";
import {Toast} from "primevue";

const MyPreset = definePreset(Aura, {
    semantic: {
        colorScheme: {
            light: {
                formField: {
                    hoverBorderColor: '{primary.color}'
                }
            },
            dark: {
                formField: {
                    hoverBorderColor: '{primary.color}'
                }
            }
        }
    }
})

const pinia = createPinia()
const app = createApp(App)

app.use(PrimeVue, {
    theme: {
        preset: MyPreset
    }
})
app.use(pinia)
app.use(ToastService)
app.component('Toast', Toast)
app.directive('ripple', Ripple)
app.use(router)
app.use(VueQueryPlugin)
app.mount('#app')

const toastInstance = app.config.globalProperties.$toast as ToastServiceMethods;
configureAxios(toastInstance)