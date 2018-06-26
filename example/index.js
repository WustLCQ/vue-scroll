import Vue from 'vue';
import app from './app';
import VueScroll from '../src/index';

Vue.use(VueScroll);

new Vue({
    el: '#app',
    render: h => h(app)
})