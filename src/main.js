import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './registerServiceWorker'
import VueMaterial from 'vue-material';
import 'vue-material/dist/vue-material.min.css';

import 'vue-material/dist/theme/default.css';
import 'vue-material/dist/theme/black-green-dark.css';

Vue.config.productionTip = false;
Vue.use(VueMaterial);
Vue.component('router-link', Vue.options.components.RouterLink);
Vue.component('router-view', Vue.options.components.RouterView);

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
