/**
 * Created by yinhe on 18/8/14.
 */

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

const componentsSchema = require('./components');
const themesSchema = require('./themes');

const testSchema = require('./test');

const Query=new GraphQLObjectType({
  name:'CommonQuery',
  description:'通用查询',
  fields:()=>(Object.assign({},
    componentsSchema.query,
    themesSchema.query,
    testSchema.query
  ))
});
const Mutation=new GraphQLObjectType({
  name:'CommonMutation',
  description:'通用编辑',
  fields:()=>(Object.assign({},
    componentsSchema.mutation
  ))
});
const schema = new GraphQLSchema({
  query: Query,
  mutation: Mutation
});

module.exports = schema;
