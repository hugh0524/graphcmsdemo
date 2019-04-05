<template>
  <div>
    <el-row style="text-align: right">
      <el-button type="primary" @click="toAddRole">添加角色</el-button>
    </el-row>
    <el-table
      :data="roleList"
      border
      style="width: 100%">
      <el-table-column
        prop="id"
        label="ID"
        width="180">
      </el-table-column>
      <el-table-column
        prop="name"
        label="角色名"
        width="180">
      </el-table-column>
      <el-table-column
        prop="createAt"
        label="创建时间">
      </el-table-column>
    </el-table>
    <el-dialog
      title="创建角色"
      :visible.sync="addRoleDialogVisible"
      width="30%"
      center>
      <div>
        <el-input v-model="form.name" placeholder="请输入角色名称"></el-input>
        <div class="error" v-if="!$v.form.name.required">角色名称必填</div>

      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
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
        roleList: [],
        sysId: this.$route.params.id,
        form: {
          name:''
        },
        addRoleDialogVisible: false
      }
    },
    validations: {
      form: {
        name: {
          required
        }
      }
    },
    created: function() {
      this.sysId = this.$route.params.id
    },
    methods: {
      toAddRole () {
        this.addRoleDialogVisible = true
      },
      addRole () {
        this.$apollo.mutate({
          // Query
          mutation: gql`mutation ($systemId: Int!, $name: String!,) {
          roles_add(systemId: $systemId,name: $name) {
            id
          }
        }`,
          // Parameters
          variables: {
            systemId: this.$route.params.id,
            name: this.form.name,
          }
        }).then((data) => {
          // Result
          console.log(data)
        this.addRoleDialogVisible = false
        this.$apollo.queries.roleList.refresh()
      }).catch((error) => {
          // Error
          console.error(error)
      })
      }
    },
    apollo: {
      // Simple query that will update the 'hello' vue property
      roleList: {
        query: gql`query getRoles($systemId: Int!){
                roleList: roles_byField(systemId: $systemId) {
                  id,
                  name,
                  createAt
                }
              }`,
        variables() {
          return {systemId: this.sysId}
        },
        skip() {
          return !this.sysId
        }
      }
    }

  }
</script>
<style scoped>
  .query-cont {
    text-align: left;
    margin: 10px 0;
  }
</style>
