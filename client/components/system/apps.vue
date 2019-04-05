<template>
  <div class="el-content">
    <el-tabs v-model="activeTab" type="border-card" >
      <el-tab-pane label="数据源管理" name="ds">
        <el-row>
          <el-col :span="10">
            <el-tree
              :data="dataTree"
              node-key="id"
              default-expand-all
              :expand-on-click-node="false"
              :props="dataDefaultProps"
            >
            </el-tree>
          </el-col>
          <el-col :span="14">
            <el-form ref="form" :model="form" label-width="100px">
              <el-form-item label="数据源类型">
                <el-select v-model="form.type">
                  <el-option label="graphDB" value="graphDB"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="数据源名称">
                <el-input ></el-input>
              </el-form-item>
            </el-form>
          </el-col>
        </el-row>

      </el-tab-pane>
      <el-tab-pane label="Actions管理" name="actions">Actions管理
      </el-tab-pane>
      <el-tab-pane label="页面结构管理" name="pageStructure">

        <el-row style="padding: 10px; border: 1px solid #ececec;">
          <el-button type="primary" icon="el-icon-circle-check-outline" size="mini" v-on:click="updateStructure">更新page结构</el-button>
          <el-button type="primary" icon="el-icon-view" size="mini" v-on:click="previewApp">预览</el-button>
        </el-row>
        <el-row >
          <el-col :span="5">
          <el-tree
            :data="structure"
            node-key="id"
            ref="appTree"
            default-expand-all
            :expand-on-click-node="false"
            @node-drag-start="handleDragStart"
            @node-drag-enter="handleDragEnter"
            @node-drag-leave="handleDragLeave"
            @node-drag-over="handleDragOver"
            @node-drag-end="handleDragEnd"
            @node-drop="handleDrop"
            @node-contextmenu="rightContextMenu"
            @node-click="handleNodeClick"
            draggable
            :highlight-current="true"
            :allow-drop="allowDrop"
            :allow-drag="allowDrag" :props="defaultProps">
          </el-tree>
          </el-col>
          <el-col :span="19">
            <div>
              <el-card class="box-card">
                <div slot="header" class="clearfix">
                  <span>基本组件</span>
                </div>
                <div class="text item">
                  <el-button v-for="(item, index) in componentList" :key="item.id" type="success" style="width:110px;margin-bottom:10px;" icon="el-icon-rank" v-on:click="addCompToTree(item)">{{item.name}}</el-button>
                </div>
              </el-card>
              <el-card class="box-card">
                <div slot="header" class="clearfix">
                  <span>属性设置</span>
                  <el-button style="float: right; padding: 3px 0" type="text" v-on:click="saveCompProp">保存属性</el-button>
                </div>
                <div class="text item">
                  <el-form ref="propForm" label-width="80px" size="mini">
                    <el-form-item  v-for="o in curNodePropList" :key="o.name" >

                      <div slot="label">
                        <el-tooltip :content="o.description" placement="top">
                          <span>{{o.name}}</span>
                        </el-tooltip>
                      </div>
                      <el-input v-model="o.value" :title="o.description"></el-input>
                    </el-form-item>
                  </el-form>
                </div>
              </el-card>
            </div>
          </el-col>
        </el-row>
      </el-tab-pane>
      <el-tab-pane label="预览" name="pagePreview">
        <iframe :src="showPreUrl" frameborder="0" width="100%" height="500px"></iframe>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import gql from 'graphql-tag'

export default {
  data() {
    return {
      activeTab: 'ds',
      data6: [],
      defaultProps: {
        children: 'children',
        label: function(data, node){
          return node.id+"."+data.name
        }
      },
      appId: '',
      sysId: '',
      appInfo: {},
      componentList: [],
      basePropList:[],
      previewUrl: "/api/req?action=preview",
      showPreUrl:'',
      curNodePropList: [],
      sysInfo: {},
      dataDefaultProps: {
        children: 'fields',
        label: function(data, node){
          return node.id+"."+data.name
        }
      },
      form: {
        type: ''
      }
    }
  },
  created: function() {
    this.appId = this.$route.params.appId
    this.previewUrl = "/api/req?action=preview&appId="+this.appId
    this.showPreUrl = this.previewUrl+"&_t="+new Date().getTime();
    this.sysId = this.$route.params.id
    console.log(this.$route.params)
  },
  computed: {
    structure: function() {
      return this.appInfo && this.appInfo.structure ? JSON.parse(this.appInfo.structure): []
    },
    themeId: function() {
      return this.sysInfo && this.sysInfo.theme ? this.sysInfo.theme : ""
    },
    dataTree: function() {
      return this.appInfo && this.appInfo.dataStructure ? JSON.parse(this.appInfo.dataStructure): []
    }
  },
  methods: {
    handleNodeClick(obj, node, comp) {
      var comp = this.componentList.filter(function(item) {
        return item.name == obj.name
      })
      console.log(comp)
      var params = [];
      params = params.concat(this.basePropList)
      if(comp && comp[0].mComponentProps) {
        params = params.concat(comp[0].mComponentProps)
      }
      params = JSON.parse(JSON.stringify(params))
      var paramsCopy = JSON.parse(JSON.stringify(params))
      params.forEach(function(item, index) {
        if(item.supportComputed === 1 && (item.name.indexOf("v-bind:")!=0 && item.name.indexOf(":")!=0)) {
          var copyItem = Object.assign({}, item);
          copyItem.name = ":"+item.name;
          copyItem.description = "动态-"+item.description;
          paramsCopy.splice(index, 0, copyItem)
        }
      })
      paramsCopy = paramsCopy.map(function(item){
        if(obj.params) {
          for(let key in obj.params) {
             if(item.name == key) {
               item.value = obj.params[key]
             }
          }
        }
        return item
      })
      this.curNodePropList = paramsCopy;
    },
    handleDragStart(node, ev) {
      console.log('drag start', node);
    },
    handleDragEnter(draggingNode, dropNode, ev) {
      console.log('tree drag enter: ', dropNode.label);
    },
    handleDragLeave(draggingNode, dropNode, ev) {
      console.log('tree drag leave: ', dropNode.label);
    },
    handleDragOver(draggingNode, dropNode, ev) {
      console.log('tree drag over: ', dropNode.label);
    },
    handleDragEnd(draggingNode, dropNode, dropType, ev) {
      console.log('tree drag end: ', dropNode && dropNode.label, dropType);
    },
    handleDrop(draggingNode, dropNode, dropType, ev) {
      console.log('tree drop: ', dropNode.label, dropType);
    },
    rightContextMenu(event, data, node) {
      console.log(data, node)

    },
    allowDrop(draggingNode, dropNode, type) {
      if (dropNode.data.name === 'page') {
        return false;
      } else {
        return true;
      }
    },
    allowDrag(draggingNode) {
      return true;
    },
    addCompToTree(item) {
      var node = this.$refs.appTree.getCurrentNode()
      this.$refs.appTree.append({id: new Date().getTime(), name: item.name, params: {}}, node);
    },
    updateStructure() {
      this.$apollo.mutate({
          // Query
          mutation: gql`mutation upapp($id: Int!, $structure: String) {
            m_page_updateById(id: $id, structure: $structure) {
              id
              structure
            }
          }`,
          // Parameters
          variables: {
            id: this.appId,
            structure: JSON.stringify(this.structure)
          },
          // Update the cache with the result
          // The query will be updated with the optimistic response
          // and then with the real result of the mutation
          update: (store, { data: { newSys } }) => {

        }
      }).then((data) => {
          // Result
          console.log(data)
      }).catch((error) => {
          // Error
          console.error(error)
      })
    },
    previewApp: function() {
      this.showPreUrl = this.previewUrl+"&_t="+new Date().getTime();
      this.activeTab = 'pagePreview'
    },
    saveCompProp() {
      var props = {};
      this.curNodePropList.forEach(function(item) {
        if(item.value) {
          props[item.name] = item.value
        }
      })
      // 设置到节点上
      var node = this.$refs.appTree.getCurrentNode()
      node.params = props
    }
  },
  apollo: {
    appInfo: {
      query: gql`query getApp($id: Int!){
                appInfo: m_page_byId(id: $id) {
                  id,
                  name,
                  title,
                  structure,
                  dataStructure
                }
              }`,
      fetchPolicy: "network-only",
      variables() {
        return {id: this.appId}
      },
      skip() {
        return !this.appId
      }
    },
    componentList: {
      query: gql`query queryComponentList($themeId: Int!){
                componentList: m_components_byField(themeId: $themeId) {
                  id,
                  name,
                  description,
                  mComponentProps {
                    name,
                    description,
                    type,
                    enumList,
                    isNeed,
                    ifShow,
                    level,
                    supportComputed
                  }
                }
              }`,
      variables () {
        return {
          themeId: this.themeId
        }
      },
      skip () {
        return !this.themeId
      }
    },
    sysInfo: {
      query: gql`query sysInfo($id: Int!){
        sysInfo: m_systems_byId(id: $id) {
          id,
          theme
        }
      }`,
      variables () {
        return {
          id: this.sysId
        }
      },
      skip () {
        return !this.sysId
      }
    },
    basePropList: {
      query: gql`query baseProps($themeId: Int!){
              basePropList: m_theme_base_props_byField(themeId: $themeId) {
                  id,
                  name,
                  description,
                  type,
                  enumList,
                  isNeed,
                  ifShow,
                  level,
                  supportComputed,
                  orderIndex
              }
            }`,
      variables () {
        return {
          themeId: this.themeId
        }
      },
      skip () {
        return !this.themeId
      }
    }
  }
};
</script>
<style lang="less" scoped>
  .el-tree {
    border-right: 1px solid #ccc;
  }
  .el-content {
    position: relative;
    .prop-panel {
      position: absolute;
      right: -300px;
      top: 10px;
      width: 350px;
      background: #EBEEF5;
      padding: 20px;
      &:hover {
         right: 0px
      }
    }
  }
</style>
