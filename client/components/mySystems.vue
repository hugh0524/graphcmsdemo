<template>
  <div>
    <el-row :gutter="20" style="text-align: center">
      <el-col :span="6" v-for="sys in sysList" :key="sys.id"><div class="grid-content bg-purple" v-on:click="selectOrAddSys(sys)">
        <div class="icon " v-bind:class="[sys.type!='add' ? 'el-icon-news' : 'el-icon-circle-plus-outline']"></div>
       <div class="sys-title"> {{ sys.sysName }}</div>
      </div></el-col>
    </el-row>
    <el-dialog
      title="创建新的系统"
      :visible.sync="addSysDialogVisible"
      width="30%"
      center>
      <div>
        <el-input v-model="sysName" placeholder="请输入系统名称"></el-input>
        <div class="error" v-if="!$v.sysName.required">system's name is required.</div>
        <el-input
          type="textarea"
          :rows="2"
          placeholder="请输入描述"
          v-model="description">
        </el-input>
        <div class="error" v-if="!$v.description.required">description is required.</div>
        <el-select v-model="theme" placeholder="请选择系统风格">
          <el-option
            v-for="item in themeOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id">
          </el-option>
        </el-select>
        <div class="error" v-if="!$v.description.required">theme is required.</div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addSysDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addSystem">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import { required } from 'vuelidate/lib/validators'

export default {
  name: 'Systems',
  data () {
    return {
      sysList: [],
      addSysDialogVisible: false,
      themeOptions: [],
      sysName: '',
      description: '',
      theme: ''
    }
  },
  validations: {
    sysName: {
      required
    },
    description: {
      required
    },
    theme: {
      required
    }
  },
  created () {

  },
  methods: {
    selectOrAddSys (sys) {
      if (sys.type === 'add') {
        this.addSysDialogVisible = true
      } else {
        this.$router.push({name: 'systemsIndex', params: {id: sys.id}})
      }
    },
    addSystem () {
      this.$apollo.mutate({
        // Query
        mutation: gql`mutation ($sysName: String!, $description: String) {
          m_systems_add(sysName: $label, description: $description) {
            sysName
            description
          }
        }`,
        // Parameters
        variables: {
          sysName: this.sysName,
          description: this.description,
          theme: this.theme
        },
        // Update the cache with the result
        // The query will be updated with the optimistic response
        // and then with the real result of the mutation
        update: (store, { data: { newSys } }) => {

        }
      }).then((data) => {
        // Result
        console.log(data)
        this.addSysDialogVisible = false
      }).catch((error) => {
        // Error
        console.error(error)
      })
    }
  },
  apollo: {
    // Simple query that will update the 'hello' vue property
    sysList: {
      query: gql`{
                list: m_systems_all {
                  id,
                  sysName
                }
              }`,
      result: function (result) {
        if (!result.loading) {
          this.sysList = result.data.list.concat([{sysName: '创建系统', type: 'add', id: 0}])
        }
        // return data.list
      }
    },
    themeOptions: {
      query: gql`{
              themeOptions: m_theme_all {
                  id,
                  name
              }
            }`

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
