import "primeicons/primeicons.css";
import "leaflet/dist/leaflet.css";
import "./mapStyles.css"
import "./style.css";
import "./flags.css";

import {createApp} from "vue";
import PrimeVue from "primevue/config";

import App from "./App.vue";
import GeopulsePreset from "@/presets/GeopulsePreset";
import { initializeThemeMode } from "@/utils/themeMode";
import router from "./router";
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';
import Tooltip from 'primevue/tooltip'
import { createPinia } from 'pinia'

initializeThemeMode()

const app = createApp(App);

app.use(PrimeVue, {
    ripple: false,
    theme: {
        preset: GeopulsePreset,
        options: {
            prefix: 'p',
            darkModeSelector: '.p-dark',
            cssLayer: false,
        }
    }
});

app.use(createPinia())
app.use(router);
app.use(ToastService);
app.use(ConfirmationService);
app.directive('tooltip', Tooltip)

app.mount("#app");
