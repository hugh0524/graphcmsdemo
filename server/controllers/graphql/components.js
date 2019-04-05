/**
 * Created by yinhe on 18/8/14.
 */

const BaseDao = require("../../dao/baseDao")

var {
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
  GraphQLEnumType,
  GraphQLNonNull,
  GraphQLInterfaceType,
  GraphQLInputObjectType
} = require('graphql');

var daoUtil = new BaseDao();
const tableName = "m_components";

const Components = new GraphQLObjectType({
  name:'Components',
  description:"组件对象POJO",
  fields: () => {
    return ({
      id: {type: new GraphQLNonNull(GraphQLInt)},
      name: {type: new GraphQLNonNull(GraphQLString)},
      theme: {type: new GraphQLNonNull(GraphQLInt)},
      frontShow: {type: GraphQLString},
      backShow: {type: GraphQLString},
      createAt: {type: GraphQLString},
      createBy: {type: new GraphQLNonNull(GraphQLInt)},
    });
  }
});

module.exports = {
  query: {
    components_list: {
      type: new GraphQLList(Components),
      description: '查询组件列表',
      resolve: async function(source) {
        return (await daoUtil.queryAll(tableName));
      }
    }
  },
  mutation: {
    components_add: {
      type: Components,
      description: '添加组件',
      args: {
        id: {type: GraphQLInt},
        name: {type: new GraphQLNonNull(GraphQLString)},
        theme: {type: new GraphQLNonNull(GraphQLString)},
      },
      resolve: async function(source, {id, name, theme}) {
        var user = {
          name: name,
          theme: theme,
        };
        return await daoUtil.insert(tableName, user);
      }
    }
  }
}

