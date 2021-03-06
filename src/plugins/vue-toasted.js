import 'material-design-icons-iconfont/dist/material-design-icons.css';

import Vue from 'vue';
import Toasted from 'vue-toasted';

import router from '../router';

Vue.use(Toasted, {
	router: router,
});
