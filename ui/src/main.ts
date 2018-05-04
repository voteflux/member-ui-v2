import Vue from 'vue'
import App from './App.vue'

require('normalize.css');

Vue.config.productionTip = true
Vue.prototype.$dev = Vue.config.productionTip

import VueResource from 'vue-resource';
Vue.use(VueResource);

import Notifications from 'vue-notification';
Vue.use(Notifications)

import FluxApi from './lib/api';
Vue.use(FluxApi);

new Vue({
    render: h => h(App)
}).$mount('#app')
