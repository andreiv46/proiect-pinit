import {createApp} from 'vue'
import './style.css'
import App from './App.vue'
import PrimeVue from "primevue/config"
import Aura from "@primevue/themes/aura"
import router from "./router/router.ts";
import ToastService from "primevue/toastservice";
import {definePreset} from "@primevue/themes";
import Ripple from "primevue/ripple";

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
});

const app = createApp(App)
app.use(PrimeVue, {
    theme: {
        preset: MyPreset
    }
})
app.use(ToastService)
app.directive("ripple", Ripple)
app.use(router)

app.mount('#app')
