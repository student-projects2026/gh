import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'Index', component: () => import('@/views/Index.vue') },
  { path: '/login', name: 'Login', component: () => import('@/views/Login.vue') },
  { path: '/verify', name: 'Verify', component: () => import('@/views/Verify.vue') },
  { path: '/user', name: 'User', component: () => import('@/views/User.vue') },

  { path: '/forum/list', name: 'ForumList', component: () => import('@/views/forum/List.vue') },
  { path: '/forum/detail', name: 'ForumDetail', component: () => import('@/views/forum/Detail.vue') },
  { path: '/forum/publish', name: 'ForumPublish', component: () => import('@/views/forum/Publish.vue') },

  { path: '/confession/list', name: 'ConfessionList', component: () => import('@/views/confession/List.vue') },
  { path: '/confession/detail', name: 'ConfessionDetail', component: () => import('@/views/confession/Detail.vue') },
  { path: '/confession/publish', name: 'ConfessionPublish', component: () => import('@/views/confession/Publish.vue') },

  { path: '/notice/list', name: 'NoticeList', component: () => import('@/views/notice/List.vue') },
  { path: '/notice/detail', name: 'NoticeDetail', component: () => import('@/views/notice/Detail.vue') },

  { path: '/job/list', name: 'JobList', component: () => import('@/views/service/List.vue'), meta: { type: 'job', title: '校园兼职', icon: '💼' } },
  { path: '/job/detail', name: 'JobDetail', component: () => import('@/views/service/Detail.vue'), meta: { type: 'job', title: '校园兼职' } },
  { path: '/job/publish', name: 'JobPublish', component: () => import('@/views/service/Publish.vue'), meta: { type: 'job', title: '校园兼职' } },

  { path: '/express/list', name: 'ExpressList', component: () => import('@/views/service/List.vue'), meta: { type: 'express', title: '快递代取', icon: '📦' } },
  { path: '/express/detail', name: 'ExpressDetail', component: () => import('@/views/service/Detail.vue'), meta: { type: 'express', title: '快递代取' } },
  { path: '/express/publish', name: 'ExpressPublish', component: () => import('@/views/service/Publish.vue'), meta: { type: 'express', title: '快递代取' } },

  { path: '/takeout/list', name: 'TakeoutList', component: () => import('@/views/service/List.vue'), meta: { type: 'takeout', title: '外卖代取', icon: '🍱' } },
  { path: '/takeout/detail', name: 'TakeoutDetail', component: () => import('@/views/service/Detail.vue'), meta: { type: 'takeout', title: '外卖代取' } },
  { path: '/takeout/publish', name: 'TakeoutPublish', component: () => import('@/views/service/Publish.vue'), meta: { type: 'takeout', title: '外卖代取' } },

  { path: '/trade/list', name: 'TradeList', component: () => import('@/views/service/List.vue'), meta: { type: 'trade', title: '二手交易', icon: '🛒' } },
  { path: '/trade/detail', name: 'TradeDetail', component: () => import('@/views/service/Detail.vue'), meta: { type: 'trade', title: '二手交易' } },
  { path: '/trade/publish', name: 'TradePublish', component: () => import('@/views/service/Publish.vue'), meta: { type: 'trade', title: '二手交易' } },

  { path: '/ad/list', name: 'AdList', component: () => import('@/views/service/List.vue'), meta: { type: 'ad', title: '广告发布', icon: '📣' } },
  { path: '/ad/detail', name: 'AdDetail', component: () => import('@/views/service/Detail.vue'), meta: { type: 'ad', title: '广告发布' } },
  { path: '/ad/publish', name: 'AdPublish', component: () => import('@/views/service/Publish.vue'), meta: { type: 'ad', title: '广告发布' } },

  { path: '/admin/dashboard', name: 'AdminDashboard', component: () => import('@/views/admin/Dashboard.vue') },
  { path: '/admin/audit', name: 'AdminAudit', component: () => import('@/views/admin/Audit.vue') },
  { path: '/admin/reports', name: 'AdminReports', component: () => import('@/views/admin/Reports.vue') },
  { path: '/admin/users', name: 'AdminUsers', component: () => import('@/views/admin/Users.vue') },
  { path: '/admin/sensitiveWords', name: 'AdminSensitiveWords', component: () => import('@/views/admin/SensitiveWords.vue') },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
