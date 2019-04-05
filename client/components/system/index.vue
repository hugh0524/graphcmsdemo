<template>
  <el-container>
    <el-aside width="200px">
      <sysNav ></sysNav>
    </el-aside>
    <el-main>
      <router-view name="child"/>
    </el-main>
  </el-container>
</template>
<script type="text/javascript">

import sysNav from './nav'
export default {
  name: 'SystemIndex',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  },
  components: {sysNav}
}
</script>
