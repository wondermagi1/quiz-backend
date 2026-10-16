import Vue from 'vue'
import VueRouter from 'vue-router'
import UserView from '../views/element/UserView.vue'
import QuestionView from '../views/element/QuestionView.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/user' },
  { path: '/user', component: UserView },
  { path: '/quiz', component: QuestionView }
]

const router = new VueRouter({
  routes
})

export default router