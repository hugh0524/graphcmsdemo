/**
 * Created by yinhe on 18/9/1.
 */
const baseDao  = require("../baseDao")
const db = require("../../utils/DB")
const Logger = require("../../utils/Logger")
require('date-utils');
const indexEnum = require("../../models/enum/dbIndex")

const DataSourceModal = require("../../models/DataSource")

class DataSourceDao extends baseDao {

  constructor(dbName){
    super(dbName)
  }

  async insert(table, fieldMaps) {
    try {
      var result = await super.insert(table, fieldMaps);
      // 执行创建 相关内容
      // var insertSql = `insert into ${table}(${Object.keys(fieldMaps).join(",")}) values ("${Object.values(fieldMaps).fill("?", 0).join("\",\"")}")`
      // 创建 models
      var tables = [];
      // tables.push({sql: insertSql, params: Object.values(fieldMaps)})
      var dbModel = new DataSourceModal(fieldMaps);
      var dbUtil = dbModel.getDBUtil()
      var tableList = await dbUtil.execBySql("show tables")
      var systemId = fieldMaps.systemId;
      var dbId = result.id;
      if(tableList){
        for(let i = 0; i< tableList.length; i++) {
          var tbName = tableList[i]["Tables_in_"+dbModel.database];
          let tableSql = `insert into m_models (dataSourceId, systemId, name, description, createAt, deletedAt, updateAt, createBy) values (?,?,?,?,?,?,?,?)`
          let curDate = new Date().toFormat("YYYY-MM-DD HH24:MI:SS");
          let tableParams = [dbId, systemId, tbName, '', curDate, curDate,curDate, 1];

          let modalId = await db.doExecSql("manage_config", tableSql, tableParams);
          if(modalId && modalId.id) {
            let columns = await dbUtil.showTableInfo(tbName);
            for(let j=0; j< columns.length; j++ ) {
              let colField = columns[j].Field;
              let colType = columns[j].Type;
              let canNull = columns[j]["Null"] != "NO";
              let isUnique = columns[j].key == "PRI" || columns[j].key == "UNI";
              let colDefault = columns[j]["Default"] || "";
              let colDesc = columns[j]["Comment"] || "";
              // 构建列的sql
              let colSql = `insert into m_model_fields (name, modelId, description, type, formType, notNull, isUnique, defaultValue, enumList, createAt, updateAt, deletedAt, createBy) values (?,?,?,?,?,?,?,?,?,?,?,?,?)`
              let colParams = [colField, modalId.id, colDesc, colType, "input", !canNull, isUnique, colDefault, '', curDate,curDate,curDate, 1]
              await db.doExecSql("manage_config", colSql, colParams);
            }
          }
        }
      }
    } catch (e) {
      throw new Error(e);
    }
  }

}
module.exports = DataSourceDao
