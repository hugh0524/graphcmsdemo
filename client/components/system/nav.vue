<template>

  <el-menu
    default-active="/apps"
    class="el-menu-vertical-demo"
    :router="true" >
    <el-menu-item :index="'/user/systems/'+sysId+'/roles'">
      <i class="el-icon-menu"></i>
      <span slot="title">系统角色设定</span>
    </el-menu-item>
    <el-menu-item :index="'/user/systems/'+sysId+'/datasource'">
      <i class="el-icon-menu"></i>
      <span slot="title">数据源设定</span>
    </el-menu-item>
    <el-menu-item :index="'/user/systems/'+sysId+'/models'">
      <i class="el-icon-menu"></i>
      <span slot="title">数据model</span>
    </el-menu-item>
    <el-submenu index="1">
      <template slot="title">
        <i class="el-icon-location"></i>
        <span slot="title">我的apps</span>
      </template>
      <el-menu-item-group>
        <el-menu-item :index="'/user/systems/'+sysId+'/createApp'">创建app</el-menu-item>
      </el-menu-item-group>
    </el-submenu>

  </el-menu>

</template>
<script type="text/javascript">

export default {
  name: 'SystemNav',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
      sysId: this.$route.params.id
    }
  }
}
</script>
