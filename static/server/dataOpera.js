/**
 * Created by yinhe on 18/9/6.
 */

function dataOpera () {

}

dataOpera.prototype = {

  queryData: function(type, action, object, fields, owner) {
    var param = {}
    if(type == "graphDB") {
      var all_fields = fields.map(function(item) {
        return item.name
      }).join(",")
      param.query = "{list:"+object+"_"+action+" {"+all_fields+"}}"
      param.variables = null
    }

    var self = owner;
    $.post("/api/graphql2/1", param).done(function(data) {
      self[object+"_list"] = data.data.list
    })
  }
}


window.dataOpera = new dataOpera();
