import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import elementTest from '@/components/elementTest'
import mySystems from '@/components/mySystems'
import systemsIndex from '@/components/system/index'
import systemsApps from '@/components/system/apps'
import systemsModels from '@/components/system/models'
import systemsDataSource from '@/components/system/dataSource'
import systemsRoles from '@/components/system/roles'
import systemsCreateApp from '@/components/system/createApp'
import systemsAppUpdate from '@/components/system/apps'

import componentList from '@/components/custom/components'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'HelloWorld',
      component: HelloWorld
    },
    {
      path: '/et',
      name: 'et',
      component: elementTest
    },
    {
      path: '/user/systems',
      name: 'mySystems',
      component: mySystems
    },
    {
      path: '/custom/components',
      name: 'components',
      component: componentList
    },
    {
      path: '/user/systems/:id',
      name: 'systemsIndex',
      component: systemsIndex,
      children: [{
        path: 'roles',
        components: { child: systemsRoles },
      },{
        path: 'apps',
        components: { child: systemsApps },
      }, {
        path: 'createApp',
        components: { child: systemsCreateApp },
      }, {
        path: 'app/:appId',
        name: 'appUpdate',
        components: { child: systemsAppUpdate },
      }, {
        path: 'models',
        components: { child: systemsModels },
      }, {
        path: 'dataSource',
        components: { child: systemsDataSource }
      }]
    }
  ]
})
