import { createApp } from 'vue'
import './style.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import './js/select2.min.css'
import './js/select2-bootstrap4.min.css'
import './adminlte.min.css'
import './fontawesome-pro/css/all.css'

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
app.config.globalProperties.toDateString = window.toDateString
app.config.globalProperties.toDateTimeString = window.toDateTimeString
app.config.globalProperties.toTimeString = window.toTimeString
app.config.globalProperties.getAgeYMD = window.getAgeYMD
app.config.globalProperties.getYearAge = window.getYearAge
app.config.globalProperties.moment = moment
app.mount('#app')
