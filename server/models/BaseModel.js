/**
 * Created by yinhe on 18/9/2.
 */


class BaseModel {
  constructor(params) {
    this.id = params.id || "";
    this.createAt = params.createAt || "";
    this.updateAt = params.updateAt || "";
    this.deletedAt = params.deletedAt || "";
    this.createBy = params.createBy || "";
  }
}

module.exports = BaseModel
