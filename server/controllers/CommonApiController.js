/**
 * Created by yinhe on 18/8/21.
 */

var BaseDao = require("../dao/baseDao")

var ApplicationService = require("../service/ApplicationService");

class CommonApiController {
  constructor() {

  }

  _parseQuery(req) {

  }

  /**
   * 执行请求操作
   * @param req
   * @param res
     */
   doRequest(req, res) {
    //
    var method = req.method;

    let action = req.query.action; // 操作类型
    let model = req.query.model; // 对应的modal

    console.log(method)

    let postData = null;
    if(method == "POST") {
      postData = res.json(req.body);
    }

    // 执行编辑操作
    if(action == "Mutation") {

    }else if (action == "preview") {
      new ApplicationService().doParse(req, res);
    }

    //res.send('respond with a resource');

  }

  doMutation(model, datas) {
    // 对数据进行基本校验

    // 执行操作
    var daoUtil = new BaseDao()
    for(var i=0; i< datas.length; i++) {
      if(datas[i]) {
        
      }
    }
  }
}

module.exports = CommonApiController
