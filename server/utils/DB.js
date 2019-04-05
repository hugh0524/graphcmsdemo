/**
 * Created by yinhe on 18/8/12.
 */

const config = require("../config/config").db

var mysql = require('mysql');

let dbList = {}

// var poolConfig  = mysql.createPool({
//   connectionLimit : config.connectionLimit,
//   host            : config.host,
//   user            : config.user,
//   password        : config.password,
//   database        : 'manage_config'
// });
//
// dbList["Config"] = poolConfig;

function getDbPool (dbName, configInfo) {
  var curConfig = configInfo || config;
  if(dbList[dbName]) {
    return dbList[dbName]
  }else {
    let curPool = mysql.createPool({
      connectionLimit : curConfig.connectionLimit || 10,
      host            : curConfig.host,
      user            : curConfig.user,
      password        : curConfig.password,
      database        : dbName
    });
    dbList[dbName] = curPool;
    return curPool;
  }
}



let doExecSql = function (db, $sql, params) {
  return new Promise((resolve, reject) => {
    getDbPool(db).getConnection(function (err, connection) {
      connection.query($sql, params,function (err, result) {

        connection.release();
        if (err) {
          reject(err)
        }else{
          if(result.insertId) result.id = result.insertId;
          resolve(result);
        }
      });
    });
  })
}

async function asyncQuery (conn, $sql, params) {
  return new Promise((resolve, reject) => {
      conn.query($sql, params, function(error, result, fields) {
        if (error) {
          return conn.rollback(function() {
            reject(error);
          });
        }else{
          if(result.insertId) result.id = result.insertId;
          resolve(result)
        }
      })
    })
}

let doExecTransaction = function  (db, $sqlList) {

  return new Promise((resolve, reject) => {
    if(!$sqlList || $sqlList.length == 0 ){
      reject("no exec sql list")
    }else {
      getDbPool(db).getConnection(function (err, connection) {
        connection.beginTransaction(async function(err) {
          if(err) {
            reject(err)
          }
          for(let i = 0;i< $sqlList.length; i++) {
            let curSql = $sqlList[i];
            try{
              await asyncQuery(connection ,curSql.sql, curSql.params)
            }catch (err){
              reject(err)
            }
          }
          connection.commit(function(err) {
              if (err) {
                return connection.rollback(function() {
                  reject(error);
                });
              }else{
                console.log('success!');
                resolve()
              }
            });
          })
      })
    }
  })
}



// async function doTest () {
//   // await doConfigSql('manage_config','select * from m_systems')
//   try{
//     console.log(await doConfigTransaction('manage_config',[{sql:'insert into m_systems(sysName) values ("test11")'}, {sql:'insert into m_systems(sysName) values ("test12")'}]));
//   }catch(e) {
//     console.log(e)
//   }
// }
//
// doTest();

module.exports = { doExecSql, doExecTransaction, getDbPool }
