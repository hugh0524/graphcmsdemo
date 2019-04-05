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
const tableName = "m_theme";

const Themes = new GraphQLObjectType({
  name:'Theme',
  description:"组件主题POJO",
  fields: () => {
    return ({
      id: {type: new GraphQLNonNull(GraphQLInt)},
      name: {type: new GraphQLNonNull(GraphQLString)},
      description: {type: GraphQLString},
      createAt: {type: GraphQLString},
      createBy: {type: new GraphQLNonNull(GraphQLInt)},
    });
  }
});

module.exports = {
  query: {
    themes_list: {
      type: new GraphQLList(Themes),
      description: '查询组件主题列表',
      resolve: async function() {
        return (await daoUtil.queryAll(tableName));
      }
    }
  },
  mutation: {
    themes_add: {
      type: Themes,
      description: '添加组件主题',
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

