var template = require('art-template');

var test = require("./test.json")
var path = require ('path')

var baseDao = require("../dao/baseDao")

class ApplicationService {

  constructor() {
    this.config = null;
    this.artPath = path.resolve(__dirname, "../views/uis/element/page.art")
    this.baseDao = new baseDao();
  }

  loadingConfig() {
    console.log(test)
    this.config = test;

  }

  beforeParse() {
    this.loadingConfig();
    // check config
    // if(this.config.name != "page") {
    //   throw new Error("根节点需为page")
    // }

  }

  doParse(req, res) {
    console.log(req.query)
    var appId = req.query.appId

    this.beforeParse();
    var pageConfig = {};
    if(appId){
      this.baseDao.queryById("m_page", appId).then((page) => {
        console.log(page)
        pageConfig.app = JSON.parse(page.structure);
        pageConfig.data = JSON.parse(page.dataStructure);

        template.defaults.imports.json = JSON
        // 解析page开始
        var html = template(this.artPath, pageConfig);

        //
        // console.log(html)
        res.send(html)
      })

    }else{
      pageConfig = this.config
      template.defaults.imports.json = JSON
      // 解析page开始
      var html = template(this.artPath, pageConfig);
      //
      console.log(html)
      res.send(html)
    }

  }


}

// var apps = new ApplicationService();
//
// console.log(apps.doParse())

module.exports = ApplicationService
