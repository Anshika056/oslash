/**
 *
 * file - shortcutMethods.js - queries related to shortcuts 
 *
 * @created    07/11/2022
 *
 * @description : This file contains the queries needed to for the shortcut database
 *
 *
 *  
**/

const { getSqlDatabasePool } = require('../database/mysql');
const cn = require("../helpers/common")

async function uniqueShortcut(shortcut,userId) {
    const database = await getSqlDatabasePool();
    let shortcut1 = `o/${shortcut}`
    return new Promise((resolve, reject) => {
        let query = `SELECT * FROM shortcut WHERE shortlink =? AND userId = ? `;
        let varQ = [shortcut1,userId]
        console.log(varQ)
        database.query(query, varQ, function (err, results, fields) {
            console.log(results)
            if (err) {
                // database.release();
                console.log('Database error - ' + err);
                err.message = 'Database server error'
                err.internalCode = 503
                err.name = 'database_server_error'
                reject(err)
            }
            else if (results.length == 0) {
                resolve(true)
            } else {
                resolve(false)
            }
        })
    })
}

async function createShortcut(shortlink,url,description,userId,tags) {
    const database = await getSqlDatabasePool();
    const shortcutId = cn.generateRandomString(5);
    tags != null ? tags = tags : tags = null
    console.log("the tags",tags)
    return new Promise((resolve, reject) => {
        database.query("START TRANSACTION");
        let query = `INSERT INTO shortcut(_id, shortlink,url,description,userId,creationTime,updationTime) VALUES (?)`;
        let varQ = [[shortcutId,shortlink,url,description,userId, Date.now(), Date.now()]];
        database.query(query, varQ, function (e, results) {
            if (e) {
                console.log(e)
                let obj = {};
                obj.error = e.code;
                obj.message = "Database server error";
                obj.code = 503;
                obj.name = "database_server_error"
                database.query("ROLLBACK");
                database.release();
                reject(obj);
            }
            else {
                if (results.affectedRows == 1) {
                    console.log("in the last part4",tags)
                    if(tags != null ){
                        console.log("the tags",tags)
                                let query = `INSERT INTO tags(tag,shortlink_id) VALUES (?)`;
                                // database.query(query, varQ, function (e, results) {
                                //     if (e) {
                                //         console.log(e)
                                //         let obj = {};
                                //         obj.error = e.code;
                                //         obj.message = "Database server error";
                                //         obj.code = 503;
                                //         obj.name = "database_server_error"
                                //         database.query("ROLLBACK");
                                //         database.release();
                                //         reject(obj);
                                //     }
                                //     else {
                                //         if (results.affectedRows == 1) {
                                //             database.query("COMMIT");
                                //             database.release();
                                //             let obj = { ...organizationData };
                                //             obj.companyAddress = { ...organizationAddress }
                                //             console.log(obj, "organizationData")
                                //             resolve(obj);
                                //         }
                                //     }
                                // })
                                tags.map((tag) => {
                                    console.log(shortcutId,tag,"the id")
                                    database.query(query, [[tag,shortcutId]], function (e, results, fields) {
                                        if (e) {
                                            let obj = {};
                                            console.log(e, "******^^^^^")
                                            if (e) {
                                                console.log(e)
                                                let obj = {};
                                                obj.error = e.code;
                                                obj.message = "Database server error";
                                                obj.code = 503;
                                                obj.name = "database_server_error"
                                                database.query("ROLLBACK");
                                                database.release();
                                                reject(obj);
                                            }
                                        } else {
                                            database.query("COMMIT");
                                            database.release();
                                            resolve(shortlink);
                                        }
                                    })
                                });
                    } else {
                        console.log("in the last part")
                        let obj = {};
                        obj.shortCut = shortlink
                        database.query("commit");
                        database.release();
                        resolve(obj);
                    }
                }  else {
                    console.log("in the last part")
                    let obj = {};
                    obj.shortCut = shortlink
                    database.query("commit");
                    database.release();
                    resolve(obj);
                }
            }
        })
    })
}

async function fetchShortCuts(userId,requestcol){
    
    const database = await getSqlDatabasePool();
    return new Promise((resolve, reject) => {
        let query = `select shortlink, url, description from shortcut where userId = ? order By (?) ASC  ;`;
        let varQ = [userId,requestcol]
        // console.log(query,varQ,"&^*^&$%^%$&%^*")
        database.query(query, varQ, function (err, results, fields) {
            console.log(results)
            if (err) {
                // database.release();
                console.log('Database error - ' + err);
                err.message = 'Database server error'
                err.internalCode = 503
                err.name = 'database_server_error'
                reject(err)
            } else if (results.length > 0) {
                resolve(results)
            }
            else if (results.length == 0) {
                resolve(false)
            } else {
                let obj = {};
                obj.error = "No data found when checking shortcut";
                obj.message = "Internal server error";
                reject(obj);
            }

        })
    })
}

async function deleteUserShortCut(shortcut,userId){
    console.log("inside")
    const database = await getSqlDatabasePool();
    return new Promise((resolve, reject) => {
        let query = `delete from shortcut where shortlink=? and userId = ?`;
        let varQ = [shortcut,userId]
        // console.log(query,varQ,"&^*^&$%^%$&%^*")
        database.query(query, varQ, function (err, results, fields) {
            console.log(varQ,"fhwrhg")
            if (err) {
                // database.release();
                console.log('Database error - ' + err);
                err.message = 'Database server error'
                err.internalCode = 503
                err.name = 'database_server_error'
                reject(err)
            } 
            else if (results.affectedRows == 1) {
                resolve(true)
            } else {
                resolve(false)
            }

        })
    })
}


async function fetchUserShortCuts(userId,shortlink,description,tag){
    
    const database = await getSqlDatabasePool();
    return new Promise((resolve, reject) => {
        let query = ` select shortlink,url,description,tag from shortcut sc inner join tags t on  t.shortlink_id = sc._id where userId =? and (shortlink=? and description=? and tag= ? );`;
        let varQ = [userId,shortlink,description,tag]
        // console.log(query,varQ,"&^*^&$%^%$&%^*")
        database.query(query, varQ, function (err, results, fields) {
            console.log(results)
            if (err) {
                // database.release();
                console.log('Database error - ' + err);
                err.message = 'Database server error'
                err.internalCode = 503
                err.name = 'database_server_error'
                reject(err)
            } else if (results.length > 0) {
                let tags = results.map(result=> result.tag)
                let data={}
                data.shortlink=results[0].shortlink;
                data.description=results[0].description;
                data.url=results[0].url;
                data.tags=tags
                resolve(data)
            }
            else if (results.length == 0) {
                resolve(false)
            } else {
                let obj = {};
                obj.error = "No data found when checking shortcut";
                obj.message = "Internal server error";
                reject(obj);
            }

        })
    })
}

async function isShortcut(shortcut,userId) {
    const database = await getSqlDatabasePool();
    return new Promise((resolve, reject) => {
        let query = `SELECT * FROM shortcut WHERE shortlink =? AND userId = ? `;
        let varQ = [shortcut,userId]
        console.log(varQ)
        database.query(query, varQ, function (err, results, fields) {
            console.log(results)
            if (err) {
                // database.release();
                console.log('Database error - ' + err);
                err.message = 'Database server error'
                err.internalCode = 503
                err.name = 'database_server_error'
                reject(err)
            }
            else if (results.length > 0) {
                resolve(true)
            } else {
                resolve(false)
            }
        })
    })
}

module.exports={
    uniqueShortcut,
    createShortcut,
    fetchShortCuts,
    deleteUserShortCut,
    fetchUserShortCuts,
    isShortcut
}