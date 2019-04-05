/**
 * Created by yinhe on 18/9/6.
 */

const db = require("../utils/DB")
var BaseDao = require("../dao/baseDao")
var template = require('art-template');
var { makeExecutableSchema } = require('graphql-tools') ;
var path = require ('path')
require('date-utils');
var DataSource = require("../models/DataSource")
const relations = require("../config/dbRelationConfig.json");

class SystemGraphController {

  constructor(systemId){
    this.systemId = systemId
    this.baseDao = new BaseDao();
    this.artPath = path.resolve(__dirname, "../views/graph/gql.art")

  }


  async queryAllDbs() {
    var result = await this.baseDao.queryAll("m_datasource", {}, {systemId: this.systemId})

    return result
  }

  async parseTableToStr () {
    let dbs = await this.queryAllDbs();
    var data = [];
    // 构建resolve对象
    var resolvers = {
      Query: {

      },
      Mutation: {

      }
    }
    if(dbs) {
      for(let i = 0;i<dbs.length;i++) {
        let curDs = new DataSource(dbs[i]);
        let curDbUtil = curDs.getDBUtil();
        let tables = await curDbUtil.execBySql("show tables")
        await this.parseTables(tables, resolvers, curDbUtil, data)
      }
    }

    var gql = template(this.artPath, data);
    // console.log(gql)
    let typeDefs = `${gql}`
    let jsSchema = makeExecutableSchema({
      typeDefs,
      resolvers,
    });

    return jsSchema;
  }


  async parseTables(tables, resolvers, daoUtil, data) {
    if(tables){


      let curDbRelations = relations[daoUtil.dbName] || {};
      for(var i= 0; i< tables.length;i++){
        var tbObj = {};
        tbObj["name"] = tables[i]["Tables_in_"+daoUtil.dbName];
        tbObj["modal"] = this.toCamelCase(tables[i]["Tables_in_"+daoUtil.dbName]);
        let columns = await daoUtil.showTableInfo(tbObj["name"]);
        let enums = [];
        let fields = [];
        // 类型转换
        for(var j=0; j< columns.length; j++) {
          if(columns[j] && columns[j] != "null"){
            // 找出所有的枚举类型
            this.transEnum(enums, columns[j].Type, tbObj["name"]+"_"+columns[j].Field)
            columns[j].fieldType = this.transType(columns[j].Type, "YES", tbObj["name"]+"_"+columns[j].Field);
            columns[j].Type = this.transType(columns[j].Type, columns[j]["Null"], tbObj["name"]+"_"+columns[j].Field)
            columns[j].unUserInMutation = columns[j].Key == "PRI" && columns[j].Extra == "auto_increment"
            fields.push(columns[j].Field)
          }
        }
        let curTableRelation = curDbRelations[tbObj["name"]] || [];
        tbObj["columns"] = columns;
        tbObj["enums"] = enums;

        tbObj["relations"] = curTableRelation.map(item => {
          item.modal = this.toCamelCase(item.targetTable);
          return item
        })

        data.push(tbObj);

        (function  (tbOName, daoUtil, allField, tbData) {
          resolvers["Query"][tbOName+"_all"] = async (root, args, context) => {
            return await daoUtil.queryAll(tbOName);
          }
          resolvers["Query"][tbOName+"_byId"] = async (root, args, context) => {
            return await daoUtil.queryById(tbOName, args.id);
          }
          resolvers["Query"][tbOName+"_page"] = async (root, args, context) => {
            return await daoUtil.queryPage(tbOName, null, args.page, args.limit, args);
          }
          resolvers["Query"][tbOName+"_byField"] = async (root, args, context) => {
            return await daoUtil.queryAll(tbOName, null, args);
          }

          let curTableRelation = tbData.relations
          for(var i =0; i< curTableRelation.length; i++){
            let curRel = curTableRelation[i]
            if(curRel) {
              // resolvers["Query"][tbOName+"_"+curRel.field+"_relation"] = async (root, args, context) => {
              //   return await daoUtil.queryAll(tbOName, null, args);
              // }
              // 先创建目标表的 关系查询
              // resolvers[tbData.modal+"_"+curRel.field+"_relation"] = resolvers[tbData.modal] = {};
              // resolvers[tbData.modal+"_"+curRel.field+"_relation"][curRel.modal] = resolvers[tbData.modal][curRel.modal]= async (root) => {
              //   var param = {};
              //   param[curRel.targetField] = root[curRel.field];
              //   return await daoUtil.queryAll(curRel.targetTable, null, param);
              // }
              if(!resolvers[tbData.modal]){
                resolvers[tbData.modal] = {};
              }
              resolvers[tbData.modal][curRel.modal]= async (root) => {
                var param = {};
                param[curRel.targetField] = root[curRel.field];
                let res =  await daoUtil.queryAll(curRel.targetTable, null, param);
                if(curRel.type == "o2o") {
                  return res && res[0]
                }else if(curRel.type == "o2m") {
                  return res;
                } else {
                  return null;
                }
              }
            }
          }

          resolvers["Mutation"][tbOName+"_add"] = async (root, args, context) => {
            // 插入前动态设置 固定字段
            allField.forEach(function(item) {
              if(!args[item]){
                if(item == "createAt" || item == "updateAt" || item == "deletedAt") {
                  args[item] = new Date().toFormat("YYYY-MM-DD HH24:MI:SS")
                }else if(item == "createBy"){
                  args[item] = 1; // TODO userID
                }
              }
            })
            return await daoUtil.insert(tbOName, args);
          }

          resolvers["Mutation"][tbOName+"_delete"] = async (root, args, context) => {
            // 插入前动态设置 固定字段
            allField.forEach(function(item) {
              if(item == "deletedAt") {
                args[item] = new Date().toFormat("YYYY-MM-DD HH24:MI:SS")
              }else if(item == "isDeleted"){
                args[item] = 1;
              }
            })
            await daoUtil.update(tbOName, "id", args.id, args);
            return {result: true};
          }

          resolvers["Mutation"][tbOName+"_batch"] = async (root, args, context) => {
            if(args.list) {
              await args.list.forEach(async function(record) {
                // 插入前动态设置 固定字段
                allField.forEach(function(item) {
                  //if(!record[item]){
                  if(record.id && record["_exe_type"] == "update"){
                    if(item == "updateAt") {
                      record[item] = new Date().toFormat("YYYY-MM-DD HH24:MI:SS")
                    }
                  }else if(record["_exe_type"] == "add"){
                    if(item == "createAt" || item == "updateAt" || item == "deletedAt") {
                      record[item] = new Date().toFormat("YYYY-MM-DD HH24:MI:SS")
                    }else if(item == "createBy"){
                      record[item] = 1; // TODO userID
                    }
                  }else if(record.id && record["_exe_type"] == "delete") {
                    if(item == "isDeleted") {
                      record[item] = 1
                    } else if(item == "deletedAt") {
                      record[item] = new Date().toFormat("YYYY-MM-DD HH24:MI:SS")
                    }
                  }
                  //}
                })
                var extType = record["_exe_type"]
                delete record["_exe_type"]
                //
                if(record.id && extType == "update"){
                  await daoUtil.update(tbOName, "id", record.id, record);
                } else if(extType == "add"){
                  await daoUtil.insert(tbOName, record);
                } else if(record.id && extType == "delete") {
                  await daoUtil.deleteById(tbOName, record.id);
                }
              })
            }
            return {result: true}
          }

        })(tbObj["name"], daoUtil, fields, tbObj)

      }

      console.log(resolvers)

    }

  }

  toCamelCase(str){
    var o = /_(\w)/g;
    return	str.replace(o,function(a,b){
      // b为子项；
      return b.toUpperCase()
    })
  }

  transType(sType, isNull, fieldName) {
    var map = {
      "TINYINT": "Int","SMALLINT": "Int","MEDIUMINT": "Int","INTEGER": "Int","INT": "Int","BIGINT": "Int","TINYINT": "Int",
      "FLOAT": "Float", "DOUBLE":"Float", "DECIMAL":"Float",
      "DATE":"String", "TIME":"String", "YEAR":"String", "DATETIME":"String", "TIMESTAMP":"String",
      "CHAR":"String", "VARCHAR":"String", "TINYBLOB":"String", "TINYTEXT":"String", "BLOB":"String",
      "TEXT":"String", "MEDIUMBLOB":"String", "MEDIUMTEXT":"String", "LONGBLOB":"String", "LONGTEXT":"String",
      "ENUM": "ENUM",  "SET":"String"
    }
    if(sType.toUpperCase().indexOf("ENUM") == 0) {

      // 枚举类型
      var enumMatch = sType.match(/^(\w+)(\(((\'\w\'\,*)+)\))*$/)
      if(enumMatch && enumMatch.length >4) {

        return fieldName+ (isNull == "NO" ? "!" :"")
      }
    }
    var ms = sType.match(/^(\w+)(\((\d+)\))*$/)
    if(ms.length>=2){
      return (map[ms[1].toUpperCase()] || "String") + (isNull == "NO" ? "!" :"")
    }else{
      return "String" + (isNull == "NO" ? "!" :"")
    }
  }

  transEnum(list, sType, fieldName){
    if(sType.toUpperCase().indexOf("ENUM") == 0) {
      // 枚举类型
      var enumMatch = sType.match(/^(\w+)(\(((\'\w\'\,*)+)\))*$/)
      if(enumMatch && enumMatch.length >=4) {
        let enumList = enumMatch[3].replace(/'/g, "").split(",")
        var obj = {};
        obj["key"] = fieldName;
        obj["list"] = enumList
        list.push(obj)
      }
    }
  }

}

module.exports = SystemGraphController
