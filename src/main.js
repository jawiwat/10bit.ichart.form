import { createApp } from 'vue/dist/vue.esm-bundler.js'//'vue'
//import './style.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import './js/select2.min.css'
import './js/select2-bootstrap4.min.css'

import './js/jquery.min.js'
import './js/select2.full.min.js'
import moment from 'moment/moment.js'
import './Commonfunction.js'

import select2 from './components/Select2.vue'

import App from './App.vue'

let app =  createApp(App);
window.app = app;
app.component('select2',select2);
window.moment = moment;
app.mount('#app')
