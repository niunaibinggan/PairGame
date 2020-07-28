import Vue from 'vue'
import Element from 'element-ui'
import locale from 'element-ui/lib/locale/lang/en'

Vue.use(Element, { locale })
Vue.prototype.$message = function (msg) {
  Element.Message({ ...msg, duration: 1000 })
}
