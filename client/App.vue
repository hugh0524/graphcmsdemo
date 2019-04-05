<template>
  <div id="app">
    <el-container v-bind:style="{height: windowHeight+'px'}">
      <el-header>
        <el-menu
          :default-active="activeIndex2"
          class="el-menu-demo"
          mode="horizontal"
          @select="handleSelect"
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#ffd04b"
          :router="true" >
          <el-menu-item index="/">MY CMS</el-menu-item>
          <el-submenu index="2">
            <template slot="title">我的工作台</template>
            <el-menu-item index="/user/systems">我的系统</el-menu-item>
          </el-submenu>
          <el-menu-item index="3" disabled>消息中心</el-menu-item>
          <el-menu-item index="/custom/components">组件维护</el-menu-item>
        </el-menu>
      </el-header>
      <el-main>
        <router-view/>
      </el-main>
      <el-footer height="30px" style="text-align: center;">copy right</el-footer>
    </el-container>
  </div>
</template>

<script type="text/javascript">
export default {
  name: 'App',
  data () {
    return {
      activeIndex2: '1',
      windowHeight: '500'
    }
  },
  mounted: function () {
    this.windowHeight = window.innerHeight
  },
  methods: {
    handleSelect (key, keyPath) {
      console.log(key, keyPath)
    }
  }
}
</script>

<style scoped>

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

  .el-header {
    padding: 0;
  }

</style>
<style>
  body {
    margin: 0;
  }
</style>
