<template>
  <div>
    <el-row style="text-align: right">
      <el-button type="primary" @click="toAddDataSource">添加数据源</el-button>
     </el-row>
  <el-table
    :data="dataSourceList"
    border
    style="width: 100%; text-align: left">
    <el-table-column
      fixed
      prop="name"
      label="数据源名称"
      width="150">
    </el-table-column>
    <el-table-column
      prop="url"
      label="连接地址"
      width="220">
    </el-table-column>
    <el-table-column
      prop="user"
      label="用户名"
      width="120">
    </el-table-column>
    <el-table-column
      prop="config"
      label="配置"
      width="120">
    </el-table-column>
    <el-table-column
      prop="createAt"
      label="创建时间"
      width="200">
    </el-table-column>
    <el-table-column
      fixed="right"
      label="操作"
      width="100">
      <template slot-scope="scope">
        <el-button  type="text" size="small">查看</el-button>
        <el-button type="text" size="small">编辑</el-button>
      </template>
    </el-table-column>
  </el-table>
    <el-dialog
      title="创建数据源"
      :visible.sync="addDSDialogVisible"
      width="30%"
      center>
      <div>
        <el-input v-model="form.name" placeholder="请输入数据源名称"></el-input>
        <div class="error" v-if="!$v.form.name.required">数据源名称必填</div>
        <el-input v-model="form.url" placeholder="请输入数据源连接地址"></el-input>
        <div class="error" v-if="!$v.form.url.required">连接地址必填</div>
        <el-input v-model="form.user" placeholder="请输入连接用户名"></el-input>
        <div class="error" v-if="!$v.form.user.required">连接用户名必填</div>
        <el-input v-model="form.password" placeholder="请输入连接密码"></el-input>
        <el-input v-model="form.config" placeholder="请输入配置对象"></el-input>

      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDSDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addDataSource">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import gql from 'graphql-tag'
import { required } from 'vuelidate/lib/validators'

export default {
  data () {
    return {
      dataSourceList: [],
      form: {
        name: '',
        url: '',
        user: '',
        password: '',
        config: ''
      },
      addDSDialogVisible: false,
      sysId: this.$route.params.id
    }
  },
  created: function() {
    this.sysId = this.$route.params.id
  },
  validations: {
    form: {
      name: {
        required
      },
      url: {
        required
      },
      user: {
        required
      }
    }
  },
  methods: {
    toAddDataSource () {
      this.addDSDialogVisible = true
    },
    addDataSource () {
      this.$apollo.mutate({
          // Query
          mutation: gql`mutation ($systemId: Int!, $name: String!, $url: String!, $user: String!, $password: String, $config: String) {
          m_datasource_add(systemId: $systemId,name: $name, url: $url, user: $user, password: $password, config: $config) {
            id
          }
        }`,
        // Parameters
        variables: {
          systemId: this.$route.params.id,
          name: this.form.name,
          url: this.form.url,
          user: this.form.user,
          password: this.form.password,
          config: this.form.config
        }
      }).then((data) => {
          // Result
        console.log(data)
        this.addDSDialogVisible = false
        this.$apollo.queries.dataSourceList.refresh()
      }).catch((error) => {
          // Error
          console.error(error)
      })
    }
  },
  apollo: {
    dataSourceList: {
      query: gql`query getDS($systemId: Int!){
                dataSourceList: m_datasource_byField(systemId: $systemId) {
                  id,
                  name,
                  url,
                  user,
                  password,
                  config,
                  createAt
                }
            }`,
      variables () {
        return {systemId: this.sysId}
      },
      skip () {
        return !this.sysId
      }
    }
  }
}
</script>
