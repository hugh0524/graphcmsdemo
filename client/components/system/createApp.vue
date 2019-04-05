<template>
  <div>
    <el-row :gutter="20" style="text-align: center">
      <el-col :span="6" v-for="app in appList" :key="app.id"><div class="grid-content bg-purple" v-on:click="selectOrAddApp(app)">
        <div class="icon " v-bind:class="[app.type!='add' ? 'el-icon-news' : 'el-icon-circle-plus-outline']"></div>
        <div class="sys-title"> {{ app.name }}</div>
      </div></el-col>
    </el-row>
    <el-dialog
      title="创建新的APP"
      :visible.sync="addAppDialogVisible"
      width="50%"
      center>
      <div>
        <el-input v-model="form.name" placeholder="请输入APP名称"></el-input>
        <div class="error" v-if="!$v.form.name.required">app's name is required.</div>
        <el-input v-model="form.title" placeholder="请输入APP标题"></el-input>
        <div class="error" v-if="!$v.form.title.required">app's title is required.</div>
        <el-input v-model="form.keyWords" placeholder="请输入APP关键字"></el-input>
        <div class="error" v-if="!$v.form.keyWords.required">app's keyWords is required.</div>
        <el-select v-model="dsId" placeholder="请选择数据源">
          <el-option
            v-for="item in dsOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id">
          </el-option>
        </el-select>
        <el-select v-model="modelId" placeholder="选择主对象">
          <el-option
            v-for="item in modelList"
            :key="item.id"
            :label="item.name"
            :value="item.id">
          </el-option>
        </el-select>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addAppDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addApp">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import gql from 'graphql-tag'
import { required } from 'vuelidate/lib/validators'

export default {
  name: 'CreateApp',
  data () {
    return {
      appList: [],
      addAppDialogVisible: false,
      form: {
        name: '',
        title: '',
        keyWords: '',
        modal: ''

      },
      sysId: '',
      dsId: '',
      modelId: '',
      dsOptions: [],
      modelList: []
//      themeOptions: [],
//      sysName: '',
//      description: '',
//      theme: ''
    }
  },
  validations: {
    form: {
      name: {
        required
      },
      title: {
        required
      },
      keyWords: {
        required
      }
    },
    modelId: {
      required
    }
  },
  created: function() {
    this.sysId = this.$route.params.id
  },
  methods: {
    selectOrAddApp (app) {
      if (app.type === 'add') {
        this.addAppDialogVisible = true
      } else {
        this.$router.push({name: 'appUpdate', params: {appId: app.id}})
      }
    },
    addApp () {
      this.$apollo.mutate({
        // Query
        mutation: gql`mutation ($systemId: Int!, $modelId: Int, $name: String!, $title: String!, $keyWords: String) {
          m_page_add(systemId: $systemId, modelId: $modelId, name: $name, title: $title, keyWords: $keyWords) {
            name
            title,
            systemId,
            modelId,
            keyWords
          }
        }`,
        // Parameters
        variables: {
          systemId: this.sysId,
          modelId: this.modelId,
          name: this.form.name,
          title: this.form.title,
          keyWords: this.form.keyWords
        }
      }).then((data) => {
        // Result
        console.log(data)
        this.addAppDialogVisible = false
        this.$apollo.queries.appList.refresh()
      }).catch((error) => {
        // Error
        console.error(error)
      })
    }
  },
  apollo: {
    dsOptions: {
      query: gql`query getDS($systemId: Int!){
                dsOptions: m_datasource_byField(systemId: $systemId) {
                  id,
                  name
                }
              }`,
      variables() {
        return {systemId: this.sysId}
      },
      skip() {
        return !this.sysId
      }
    },
    modelList: {
      query: gql`query getModels($databaseId: Int!){
        modelList: m_models_byField(dataSourceId: $databaseId) {
          id,
          name
        }
      }`,
      variables() {
        return {databaseId: this.dsId}
      },
      skip() {
        return !this.dsId
      }
    },
    // Simple query that will update the 'hello' vue property
    appList: {
      query: gql`{
              list: m_page_all {
                id,
                name
              }
            }`,
      fetchPolicy: "network-only",
      result: function (result) {
        if (!result.loading) {
          this.appList = result.data.list.concat([{name: '创建APP', type: 'add', id: 0}])
        }
        // return data.list
      }
    }
  }
}
</script>
<style scoped lang="less">
  .grid-content {
    background: #fff;
    border:1px solid #DCDFE6;
    padding: 30px;
    .icon {
      font-size: 80px;
    }
    .sys-title {
      font-size: 16px;
      margin-top: 20px;
    }
    &:hover {
       border-color: #EBEEF5;
       cursor:pointer;
      .icon {
        color: #F56C6C;
      }
    }
  }

  .error {
    color: #F56C6C;

  }
</style>
