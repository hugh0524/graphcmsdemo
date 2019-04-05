/**
 * Created by yinhe on 18/8/14.
 */
var { makeExecutableSchema } = require('graphql-tools') ;

var { PubSub, withFilter } = require('graphql-subscriptions');

const pubsub = new PubSub();

const BaseDao = require("../../dao/baseDao")
const tableName = "testTable";

const TAGS_CHANGED_TOPIC = 'tags_changed'

var daoUtil = new BaseDao();

const typeDefs = [`
  type Test {
    id: Int
    test1: String
    test2: String
  }

  type Query {
    tests: [Test]
  }

  type Mutation {
    addTest(test1: String!, test2: String!): Test
  }

  schema {
    query: Query
    mutation: Mutation
  }
`];

const resolvers = {
  Query: {
    tests: async (root, args, context) => {
      return await daoUtil.queryAll(tableName);
    },
  },
  Mutation: {
    addTest: async (root, { test1, test2 }, context) => {
      console.log(`adding ${type} tag '${label}'`);
      const newTag = null;
      return newTag;
    },
  }
};

const jsSchema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

module.exports = jsSchema;
