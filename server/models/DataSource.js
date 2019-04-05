/**
 * Created by yinhe on 18/9/2.
 */
const BaseModel = require("./BaseModel");
const db = require("../utils/DB")
const BaseDao = require("../dao/baseDao")

class DataSource extends BaseModel{

  constructor(params) {
    super(params);
    this.user = params.user;
    this.url = params.url;
    this.password = params.password;
    this.config = params.config ? JSON.parse(params.config) : {};
    this.name = params.name;
    this.systemId = params.systemId;
    this.database = this.config? this.config.database : "";

  }

  getDBUtil() {
    if(!this.database){
      throw new Error("database is require")
    }
    // 注入到配置中
    db.getDbPool(this.database, Object.assign({host:this.url, user: this.user, password: this.password}, this.config))
    return new BaseDao(this.database)
  }
}

module.exports = DataSource;
