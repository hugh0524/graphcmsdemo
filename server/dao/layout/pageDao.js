/**
 * Created by yinhe on 18/9/4.
 */

const BaseDao  = require("../baseDao")
class PageDao extends BaseDao {
  constructor(dbName) {
    super(dbName)
  }

  async insert(table, fieldMaps) {
    // 先解析fieldMaps, 构建默认的参数对象
    var models = await this.queryById("m_models", fieldMaps.modelId);
    // 查询对应的fields
    let fields = await this.queryAll("m_model_fields", {}, {modelId: fieldMaps.modelId})
    // 创建页面结构
    /**
     * 页面结构 主要是讲model生成对应的表格
     */
    var id = new Date().getTime();
    var structure = {id:id++, name: "page", children:[]};

    var cols = [], dataCols=[];
    console.log(models)

    fields.forEach(function(field) {
      cols.push({id:id++, name:"tableCol", params:{"prop":field.name, label: field.description||field.name}})
      dataCols.push({name: field.name, type: field.formType})
    })
    structure.children.push({id:id++, name: "table", children: cols, params:{":data": models.name+"_list"}})

    fieldMaps.structure = "["+JSON.stringify(structure)+"]";
    // 插件页面数据
    var data = [{type:"graphDB", name: models.name, fields: dataCols}];
    fieldMaps.dataStructure = JSON.stringify(data);

    super.insert(table, fieldMaps)
  }
}

module.exports = PageDao
