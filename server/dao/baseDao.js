/**
 * Created by yinhe on 18/8/12.
 */

const db = require("../utils/DB")
const Logger = require("../utils/Logger")

class BaseDao {
  constructor(dbName) {
    this.dbName = dbName || "manage_config"
    this.logger = Logger.getLogger("dao.baseDao")
  }

  async showTableInfo(table) {
    try {
      this.logger.info("show-table-info:"+table)
      // var info = await db.doExecSql(this.dbName, `desc ${table}`)
      var info = await db.doExecSql(this.dbName, `show full fields from ${table}`)
      return info
    }catch(e){
      this.logger.error(e)
      throw e;
    }
  }

  async insert(table, fieldMaps) {
    try{
     var id = await db.doExecSql(this.dbName, `insert into ${table}(${Object.keys(fieldMaps).join(",")}) values (${Object.values(fieldMaps).fill("?", 0).join(",")})`, Object.values(fieldMaps))
     var results = await this.queryById(table, id.insertId);
     return results ? results[0] : null;
    }catch(e){
      this.logger.error(e)
      throw e;
    }
  }

  async update(table, indexFiled, indexValue, fieldMaps) {
    try{
      this.logger.info("update-table-info:"+indexValue)
      var setStr = "";
      for(var f in fieldMaps) {
        if(setStr){
          setStr +=", "
        }
        setStr += f+" = ? "
      }
      var id = await db.doExecSql(this.dbName, `update ${table} set ${setStr} where ${indexFiled} = '${indexValue}'`, Object.values(fieldMaps))
      console.log(id)
      return await this.queryById(table, indexValue);
    }catch(e){
      this.logger.error(e)
      throw e;
    }
  }

  async deleteById(table, id) {
    try{
      await db.doExecSql(this.dbName, `delete from ${table} where id = ${id}`)
      return true;
    }catch(e){
      this.logger.error(e)
      throw e;
    }
  }

  async queryById(table, id) {
    try{
      this.logger.info("query-ById:"+table+",id:"+id);
      var results = await db.doExecSql(this.dbName, `select * from ${table} where id = ${id}`)
      return results ? results[0] : null;
    }catch(e){
      this.logger.error(e)
      throw e;
    }
  }

  async queryAll(table, options, where) {
    try{
      options = options || {};
      var whereStr = "", whereParams = [];
      where = where || options.where;
      if(where) {
        whereStr += "where 1=1";
        for(let o in where) {
          whereStr += " and "+ o + " = ? "
          whereParams.push(where[o])
        }
      }
      this.logger.info("query-all:"+table)
      var result = await db.doExecSql(this.dbName, `select * from ${table} ${whereStr} ${options.order? "order by "+ options.order: ""} ${options.order? (options.orderType? options.orderType :"asc"):""}`, whereParams)
      console.log(result)
      return result
    }catch(e){
      this.logger.error(e)
      throw e;
    }
  }

  async queryPage(table, params, page, limit, options) {
    try{
      options = options || {};
      this.logger.info("query-page:"+table)
      var whereStr = "", whereParams = [];
      var where = options.where;
      if(where) {
        whereStr += "where 1=1";
        for(let o in where) {
          whereStr += " and "+ where[o].name + " = ? "
          whereParams.push(where[o].value)
        }
      }
      var index = page * limit;
      var list = await db.doExecSql(this.dbName, `select ${params? params.join(",") : "*" } from ${table} ${whereStr} ${options.order? "order by "+ options.order: ""} ${options.order? (options.orderType? options.orderType :"asc"):""} limit ${index},${limit}`, whereParams)
      var total =  await db.doExecSql(this.dbName, `select count(1) as total from ${table} ${whereStr} `, whereParams)
      this.logger.info(total[0].total)
      // 查询总条数
      var result = {
        page: page,
        limit: limit,
        list: list,
        total: total[0].total
      }
      this.logger.info(result)
      return result
    }catch(e){
      this.logger.error(e)
      throw e;
    }
  }

  async execBySql(sqlStr, params) {
    try{
      var result = await db.doExecSql(this.dbName, sqlStr, params)
      return result
    }catch(e){
      this.logger.error(e)
      throw e;
    }
  }

  /**
   * 事务操作
   * @param sqlList
   */
  async execByTransaction(sqlList) {
    try{
     var result = await db.doExecTransaction(this.dbName, sqlList)
      return result
    }catch(e){
      this.logger.error(e)
      throw e;
    }
  }
}


module.exports = BaseDao;

