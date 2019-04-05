<template>
  <div>
    <el-row style="margin: 10px 0;">
      <el-col :span="5">
      <el-select v-model="themeType" placeholder="请选择风格">
        <el-option
          v-for="item in themeOptions"
          :key="item.id"
          :label="item.name"
          :value="item.id">
        </el-option>
      </el-select>
      </el-col>
    </el-row>
    <el-tabs v-model="curTab" type="card" >
      <el-tab-pane label="公共基础属性" name="first">
        <el-table
          :data="basePropList"
          style="width: 100%">
          <el-table-column
            prop="id"
            label="ID">
          </el-table-column>
          <el-table-column
            prop="name"
            label="名称">
          </el-table-column>
          <el-table-column
            prop="description"
            label="描述">
          </el-table-column>
          <el-table-column
            prop="type"
            label="类型">
          </el-table-column>
        </el-table>

      </el-tab-pane>
      <el-tab-pane label="组件列表" name="second">
        <el-container>
          <el-main>
            <el-row style="text-align: right">
              <el-button type="primary" v-on:click="toModifyComp">新增组件</el-button>
            </el-row>
            <div v-if="componentList">
            <el-table
              ref="compTable"
              :data="componentList.list"
              v-on:row-click="rowClick"
              highlight-current-row
              stripe border
              style="width: 100%; text-align: left">
              <el-table-column
                prop="id"
                label="ID"
                width="180">
              </el-table-column>
              <el-table-column
                prop="name"
                label="名称"
                width="180">
              </el-table-column>
              <el-table-column
                prop="themeId"
                label="风格">
              </el-table-column>
              <el-table-column
                fixed="right"
                label="操作"
                width="100">
                <template slot-scope="scope">
                  <el-button type="text" size="small">编辑</el-button>
                  <el-button type="text" size="small">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page.sync="currentPage"
              :page-size="10"
              layout="prev, pager, next"
              :total="componentList.total" style="text-align: center; margin: 20px;">
            </el-pagination>
            </div>
          </el-main>
          <el-aside width="400px" v-bind:style="{ display: showProps ? 'block' :'none'  }">
            <h3>{{curCompRow.name}}属性列表</h3>
            <el-collapse v-if="componentPropsList && componentPropsList.length > 0">
              <el-collapse-item v-for="(comp, index) in componentPropsList" :key="index" :name="index">
                <template slot="title">
                  <div style="position: relative">
                    {{comp._exe_type == 'add' ? '待编辑属性:'+comp.name: comp.name}}
                    <span style="color: #E6A23C; padding-left:10px">{{comp._exe_type == 'add' || comp._exe_type == 'update' ? '待保存' : (comp._exe_type == 'delete' ? '待删除' : '')}}</span>
                    <el-button type="danger" @click="deleteProp(comp, index)" icon="el-icon-delete" circle style="position: absolute;left:10px;padding:5px;top:8px;"></el-button>
                  </div>
                </template>
                <el-form :model="comp" label-width="90px">
                  <el-form-item label="属性名称">
                    <el-input v-model="comp.name"></el-input>
                  </el-form-item>
                  <el-form-item label="属性描述">
                    <el-input v-model="comp.description"></el-input>
                  </el-form-item>
                  <el-form-item label="属性类型">
                    <el-select v-model="comp.type">
                      <el-option
                        v-for="item in propTypeEnum"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                      </el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item label="是否必须">
                    <el-select v-model="comp.isNeed">
                      <el-option label="否" :value="0"></el-option>
                      <el-option label="是" :value="1"></el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item label="展示条件">
                    <el-input v-model="comp.ifShow"></el-input>
                  </el-form-item>
                  <el-form-item label="属性等级">
                    <el-select v-model="comp.level">
                      <el-option label="base" value="1"></el-option>
                      <el-option label="advance" value="2"></el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item label="属性枚举值" v-if="comp.type=='select'">
                    <el-input v-model="comp.enumList"></el-input>
                  </el-form-item>
                  <el-form-item label="展示顺序">
                    <el-input v-model="comp.orderIndex"></el-input>
                  </el-form-item>
                </el-form>
              </el-collapse-item>
            </el-collapse>
            <div style="margin-top: 10px">
              <el-button type="primary" @click="toAddCompProp">新增属性</el-button>
              <el-button type="info" @click="addCompProp" v-if="componentPropsList.length > 0">保存属性</el-button>
            </div>
          </el-aside>
        </el-container>

        <el-dialog
          title="编辑组件"
          :visible.sync="addCompDialogVisible"
          width="40%"
          center>
          <div>
            <el-form ref="form" label-width="80px">
              <el-form-item label="组件名称">
                <el-input v-model="compName" placeholder="请输入组件名称"></el-input>
                <div class="error" v-if="!$v.compName.required">请输入组件名称.</div>
              </el-form-item>
              <el-form-item label="组件风格">
                <el-select v-model="theme" placeholder="请选择组件风格">
                  <el-option
                    v-for="item in themeOptions"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id">
                  </el-option>
                </el-select>
                <div class="error" v-if="!$v.theme.required">theme is required.</div>
              </el-form-item>
            </el-form>

          </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCompDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addComp">确 定</el-button>
      </span>
        </el-dialog>
      </el-tab-pane>
    </el-tabs>

  </div>
</template>

<script>
import gql from 'graphql-tag'
import { required } from 'vuelidate/lib/validators'

export default {
  name: 'ComponentList',
  data () {
    return {
      themeType: '',
      curTab: 'first',
      addCompDialogVisible: false,
      compName: '',
      theme: '',
      componentList: {},
      showProps: false,
      themeOptions: [],
      componentPropsList: [],
      oldPropList:[],
      curCompId: 0,
      curCompRow: {},
      queryFetchIndex: {
        comp: 0,
        prop: 0
      },
      propTypeEnum: [{ label: '文本输入框', value: 'input'},
       { label: '选择框', value: 'select'},{ label: '数值输入框', value: 'number'},{ label: '日期输入框', value: 'date'},{ label: '日期时间输入框', value: 'datetime'},
      ],
      currentPage:1,
      basePropList:[]
    }
  },
  validations: {
    compName: {
      required
    },
    theme: {
      required
    }
  },
  watch: {
    componentPropsList: {
      deep: true,
      handler: function (val) {
        if(val && this.oldPropList && this.oldPropList.length>0) {
          var oldVal = this.oldPropList;
          val.forEach(function(item, index) {
            if(item._exe_type != "add" && item._exe_type != "delete") {
              if(JSON.stringify(item) == JSON.stringify(oldVal[index])) {
                console.log(index + "====未变化")
              } else {
                console.log(index + "====已变化")
                item._exe_type = "update"
              }
            }
          })
        }
      }
    }
  },
  created () {

  },
  methods: {
    rowClick (row) {
      console.log(row)
      if(row.id != this.curCompId) {
        this.componentPropsList = []
        this.oldPropList = []
        this.curCompId = row.id
        this.showProps = true
        this.curCompRow = row
        this.$refs.compTable.setCurrentRow(row)
      }
    },
    toModifyComp () {
      this.addCompDialogVisible = true
    },
    addComp () {
      this.$apollo.mutate({
        // Query
        mutation: gql`mutation ($name: String!, $themeId: Int!) {
          m_components_add(name: $name, themeId: $themeId) {
            id,
            name,
            themeId
          }
        }`,
        // Parameters
        variables: {
          name: this.compName,
          themeId: this.theme
        },
        update: (store, { data: { newComp } }) => {
          console.log(newComp)
        }
      }).then((data) => {
        // Result
        console.log(data)
        this.addCompDialogVisible = false;
        this.$apollo.queries.componentList.refresh()
      }).catch((error) => {
        // Error
        console.error(error)
      })
    },
    toAddCompProp () {
      this.componentPropsList = this.componentPropsList.concat([{componentId: this.curCompId, name: '', description: '', type: 'select', _exe_type: 'add', isNeed: 0, level: '1', orderIndex: 1}])
    },
    addCompProp () {
      this.$apollo.mutate({
        // Query
        mutation: gql`mutation propBatch($list: [mComponentProps_mutation]!){
            data: m_component_props_batch(list: $list) {
              result
            }
          }`,
        // Parameters
        variables: {
          list: this.componentPropsList.filter(function(item) {
            return item._exe_type == "add" || item._exe_type == "update" || item._exe_type == "delete"
          })
        },
        update: (store, { data: { newComp } }) => {
          console.log(newComp)
        }
      }).then((data) => {
        // Result
        console.log(11111222)
        console.log(data)
        this.$apollo.queries.componentPropsList.refresh()
      }).catch((error) => {
        // Error
        console.error(error)
      })
    },
    deleteProp (data, index) {
      if(data._exe_type == "add") {
        this.componentPropsList.splice(index, 1)
      }else {
        if(data["_exe_type"]) {
          delete data["_exe_type"]
        } else {
          data["_exe_type"] = "delete"
        }
        this.componentPropsList.splice(index, 1, data)
      }
    },
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`);
    },
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`);
      this.currentPage = val;
    }
  },
  apollo: {
    // Simple query that will update the 'hello' vue property
    componentList: {
      query: gql`query getComponentList($page: Int!, $where: [where_query]){
              componentList: m_components_page(page:$page, limit:10, where: $where) {
                page,
                limit,
                list {
                   id,
                   name,
                   themeId
                },
                total
              }
            }`,
      variables () {
        return {
          page: this.currentPage -1,
          where: [{
            name: "themeId",
            opera: "=",
            value: this.themeType
          }]
        }
      },
      skip () {
        return !this.themeType
      },
      result: function (result) {
        if (!result.loading) {
        }
        return result
      },
      fetchPolicy: "network-only"
    },
    themeOptions: {
      query: gql`{
              themeOptions: m_theme_all {
                  id,
                  name,
                  mThemeBaseProps{
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
              }
            }`,
      result: function (result) {
        if (!result.loading) {
          return result.list
        }
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
          themeId: this.themeType
        }
      },
      skip () {
        return !this.themeType
      }
    },
    componentPropsList: {
      query: gql`query getComponentProps($componentId: Int!){
              componentPropsList: m_component_props_byField(componentId: $componentId) {
                  id,
                  name,
                  componentId,
                  description,
                  type,
                  isNeed,
                  ifShow,
                  enumList,
                  level,
                  orderIndex
              }
            }`,
      // Parameters
      variables () {
        return {
          componentId: this.curCompId,
          queryIndex: this.queryFetchIndex.prop
        }
      },
      fetchPolicy: "network-only",
      manual: true,
      result: function (result, loading) {
        if (!loading) {
          var copyProp = JSON.parse(JSON.stringify(result.data.componentPropsList))
          var props = copyProp.map(function(item) {
            delete item["__typename"]
            return item
          })
          console.log(props)
          this.componentPropsList = JSON.parse(JSON.stringify(props))
          this.oldPropList = props;
        }
      }
    }
  }
}
</script>
<style scoped>
  .el-select, .el-input {
    width: 100%;
  }
  .el-collapse-item {
    text-align: center;
  }
</style>
