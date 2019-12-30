import Vue from 'vue'
import VueLazyload from 'vue-lazyload'
import FastClick from 'fastclick'
import store from './store'
import './plugins/axios'
import App from './App.vue'
import router from './router'
import 'assets/stylus/index.styl'

Vue.config.productionTip = false

Vue.use(VueLazyload, {
  loading: require('assets/image/default.png')
})

FastClick.prototype.onTouchEnd = function(event) {
  if (
    event.target.hasAttribute('type') &&
    event.target.getAttribute('type') === 'text'
  ) {
    event.preventDefault()
    return false
  }
}

FastClick.attach(document.body)

new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('#app')
