<template>
  <div>
    <div class="query-cont">
      <el-select v-model="dsId" placeholder="请选择数据源">
        <el-option
          v-for="item in dsOptions"
          :key="item.id"
          :label="item.name"
          :value="item.id">
        </el-option>
      </el-select>
    </div>
    <el-table
      :data="modelList"
      border
      style="width: 100%">
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-table
            border
            :data="props.row.mModelFields"
            style="width: 100%">
            <el-table-column
              prop="name"
              label="字段名"
              sortable
            >
            </el-table-column>
            <el-table-column
              prop="description"
              label="描述"
              >
            </el-table-column>
            <el-table-column
              prop="type"
              label="类型"
            >
            </el-table-column>
            <el-table-column
              prop="formType"
              label="form类型"
            >
            </el-table-column>
            <el-table-column
              prop="notNull"
              label="不为空"
            >
            </el-table-column>
            <el-table-column
              prop="isUnique"
              label="是否唯一"
            >
            </el-table-column>
            <el-table-column
              prop="enumList"
              label="枚举列表"
            >
            </el-table-column>
          </el-table>
        </template>
      </el-table-column>
      <el-table-column
        prop="id"
        label="ID"
        width="180">
      </el-table-column>
      <el-table-column
        prop="name"
        label="姓名"
        width="180">
      </el-table-column>
      <el-table-column
        prop="description"
        label="描述">
      </el-table-column>
    </el-table>
  </div>
</template>
<script>

import gql from 'graphql-tag'
// import { required } from 'vuelidate/lib/validators'

export default {
  data () {
    return {
      dsOptions: [],
      modalList: [],
      sysId: this.$route.params.id,
      dsId: ''
    }
  },
  created: function() {
    this.sysId = this.$route.params.id
  },
  apollo: {
    // Simple query that will update the 'hello' vue property
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
      result: function (result) {
        if (!result.loading) {

        }
        // return data.list
      },
      skip() {
        return !this.sysId
      }
    },
    modelList: {
      query: gql`query getModels($databaseId: Int!){
        modelList: m_models_byField(dataSourceId: $databaseId) {
          id,
          name,
          description,
          mModelFields {
            id,
            name,
            description,
            type,
            formType,
            notNull,
            isUnique,
            enumList
          }
        }
      }`,
      variables() {
        return {databaseId: this.dsId}
      },
      skip() {
        return !this.dsId
      }
    }
  }

}
</script>
<style scoped lang="less">
  .query-cont {
    text-align: left;
    margin: 10px 0;
  }
  .table-expand {
    font-size: 0;
    label {
      width: 90px;
      color: #99a9bf;
    }
    .el-form-item {
      margin-right: 0;
      margin-bottom: 0;
      width: 50%;
    }
    .el-input {
      width: 100%;
    }
  }
</style>
