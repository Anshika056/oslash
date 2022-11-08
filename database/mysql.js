/**
 *
 * file - mysql.js - sql connection
 *
 * @created    07/11/2022
 *
 * @description : This file contains the functions to create pool connection to  sql database and get poolconnection of the created connection
 *
**/

const config = require('../config.json').development
var mysql = require('mysql2');
// Initialize pool

let pool = null;

async function createMySqlPool(){
    try{
        pool = await mysql.createPool({
            connectionLimit : 100,
            host     : config.host,
            user     : config.username,
            password : config.password,
            database : config.database,
            debug    :  false,
            waitForConnections : true,
            queueLimit : 1000
        });  
    }
    catch (err){
        console.log('------------HERE------------------')
        console.log(err)
        return err;
    }
}
  
async function getSqlDatabasePool() {
    try{
        if(!pool) await createMySqlPool();
          //console.log(pool)
        return new Promise(function(resolve,reject){
            pool.getConnection(function(err,connection){
                if (err) {
                    if(connection) connection.release();
                    reject(err)
                }else{
                    resolve(connection)
                }   

            });
        })
    }catch(err){
        return new Promise(function(resolve,reject){
            reject(err);
        })
    }
}

module.exports = {
    getSqlDatabasePool,
    createMySqlPool,
};