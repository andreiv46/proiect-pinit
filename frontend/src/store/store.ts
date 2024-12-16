import {createStore} from "vuex";
import {authModule} from "./authState.ts";


const store = createStore({
    modules: {
        auth: authModule,
    },
});

export default store