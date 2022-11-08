/**
 *
 * file - userMethods.js - queries related to users 
 *
 * @created    07/11/2022
 *
 * @description : This file contains the queries needed to for the user database
 *
 *
 *  
**/

const { getSqlDatabasePool } = require('../database/mysql');
//const parallel = require('async-parallel');
const parallel = require('async/parallel');
const cn = require("../helpers/common")
var bcrypt = require('bcryptjs');
const { resolve } = require('path');
const jwt = require("jsonwebtoken")
const {JWT_SECRET,JWT_EXPIRE_TIME,JWT_EXPIRE_TIME_UNIT} = require("../config.json");
const { access } = require('fs');

function checkRegistrationDetailsValidity(firstName, lastName, email, password, phoneNumber) {
    return new Promise(function (resolve, reject) {
        parallel([
            function (cb) {
                if (firstName.length < 2 || !(/^[a-zA-Z]+$/.test(firstName))) {
                    cb("Invalid first name");
                    // console.log("Error - Invalid first name")
                }
                else cb(null);
            },
            function (cb) {
                if (lastName.length < 2 || !(/^[a-zA-Z]+$/.test(lastName))) {
                    cb("Invalid last name");
                    // console.log("Error - Invalid last name")
                }
                else cb(null);
            },
            function (cb) {
                dCheck = email.split('.')
                if (!(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)) || dCheck[dCheck.length - 1].length > 6) {
                    cb("Invalid email address")
                    // console.log("Error - Invalid email")
                }
                else cb(null)
            },
            function (cb) {
                if (password.length < 8 || password.length > 16) {
                    cb("invalid_fields")
                }
                else cb(null)
            },
            function (cb) {
                if (!(/^[0-9]{10}/).test(phoneNumber)) {
                    cb("Invalid phoneNumber");
                } else cb(null);
            }
        ], function (err) {
            if (err) {
                resolve(false);
                console.log("Error - " + err)
            }
            else resolve(true);
        })
    })
}

async function userEmailPreExists(email) {
    const database = await getSqlDatabasePool();

    let checkEmailQuery = "SELECT * FROM user WHERE email = ?"
    let varQ = [email]
    return new Promise(function (resolve, reject) {
        database.query(checkEmailQuery, varQ, function (e, results, fields) {
            console.log(checkEmailQuery,varQ)
            database.release();
            console.log(results);
            if (e) {
                let obj = {};
                obj.error = e.code;
                obj.message = "Database server error";
                reject(obj);
            }
            else {
                if (results.length == 1) {
                    let obj = {}
                    obj.exists = true;
                    obj.userId = results[0]._id;
                    obj.password = results[0].password
                    resolve(obj);
                } else if (results.length > 1) {
                    let obj = {};
                    obj.error = "Duplicate emails found!";
                    obj.message = "Internal server error";
                    reject(obj);
                } else if (results.length == 0) {
                    let obj = {}
                    obj.exists = false;
                    obj.userId = null;
                    resolve(obj);
                } else {
                    let obj = {};
                    obj.error = "Unexpected response from database server while trying to check email";
                    obj.message = "Internal server error";
                    reject(obj);
                }
            }
        })
    })
}

async function saveNewUserData(firstName, lastName, email, password, phoneNumber) {
    const database = await getSqlDatabasePool();

    return new Promise(function (resolve, reject) {
        Promise.all([
            cn.GenerateRandomId(5)
        ]).then(tempId => {
            bcrypt.genSalt(10, function (err, salt) {
                if (err) {
                    let obj = {};
                    obj.error = "Error while generating salt for password - " + JSON.stringify(err);
                    obj.message = "Interal server error";
                    reject(obj);
                } else {
                    bcrypt.hash(password, salt, function (err, hash) {
                        if (err) {
                            let obj = {};
                            obj.error = "Error while creating hash with password and salt - " + JSON.stringify(err);
                            obj.message = "Interal server error";
                            reject(obj);
                        }
                        else {
                            let uid = tempId;
                            console.log(uid)
                            database.query("START TRANSACTION");
                            const registerUserQuery = `INSERT INTO user (_id, firstName, lastName, email, password, phoneNumber) VALUES (?)`
                            const varQ = [[uid, firstName, lastName, email, hash,  phoneNumber]];
                            database.query(registerUserQuery, varQ, function (e, results) {
                                // database.release();
                                console.log(e, 'DATABASE ERROR--------');
                                console.log(results, 'DATABASE RESULT==========');
                                if (e) {
                                    let obj = {};
                                    obj.error = e.code;
                                    obj.message = "Database server error";
                                    obj.code = 503;//error name
                                    obj.name = "database_server_error"
                                    database.query("ROLLBACK");
                                    database.release();
                                    reject(obj);
                                } else {
                                    if (results.affectedRows == 1) {
                                        let response = {};
                                            response.userId = uid;
                                            database.query("COMMIT");
                                            database.release();
                                            resolve(response);
                                    } else {
                                        let obj = {};
                                        obj.error = "No rows inserted while saving temporary user";
                                        obj.message = "Internal server error";
                                        obj.code = 500;//error name
                                        obj.name = "internal_server_error"
                                        database.query("ROLLBACK");
                                        database.release();
                                        reject(obj);
                                    }
                                }
                            })
                        }
                    })
                }
            })
        }).catch((error) => setImmediate(() => {
            console.log("Error while registration - " + JSON.stringify(error));
            const err = {};
            err.message = 'Internal server error';
            err.internalCode = 500;
            err.name = 'internal_server_error';
            reject(err);
        }))
    })
}

function comparePassword(value, hash){
  return bcrypt.compare(value, hash)
   
}

function generateJwt(payload){
    console.log(payload,JWT_SECRET,"the main")
    return jwt.sign({id: payload}, JWT_SECRET, { expiresIn: `${JWT_EXPIRE_TIME}${JWT_EXPIRE_TIME_UNIT}`  });
}

async function saveAccessToken(accesstoken,userId){
    const database = await getSqlDatabasePool();
    
    return new Promise(function (resolve, reject){
       cn.GenerateRandomId(5).then(_id=>{
            const registerUserQuery = `INSERT INTO accesstoken (_id, accessToken, user_id) VALUES (?)`
            const varQ = [[_id, accesstoken,userId]];
            database.query(registerUserQuery, varQ, function (e, results) {
                 database.release();
                console.log(e, 'DATABASE ERROR--------');
                console.log(results, 'DATABASE RESULT==========');
                if (e) {
                    let obj = {};
                    obj.error = e.code;
                    obj.message = "Database server error";
                    obj.code = 503;//error name
                    obj.name = "database_server_error"
                    reject(obj);
                } else{
                    let response = {};
                    response.userId = userId;
                    response.accesstoken = accesstoken;
                    resolve(response);
                }
                })
        }).catch((error) => setImmediate(() => {
            console.log("Error while token - " + JSON.stringify(error));
            const err = {};
            err.message = 'Internal server error';
            err.internalCode = 500;
            err.name = 'internal_server_error';
            reject(err);
        }))
        
       
    })

}

async function clearAccessToken(accessTokenId,userId){
    const database = await getSqlDatabasePool();

    return new Promise(function(resolve, reject) {
        let deleteAccessTokenEntryQuery = 'DELETE FROM accesstoken WHERE accessToken = ? and userId=?';
        let varQ = [[accessTokenId,userId]];

        database.query(deleteAccessTokenEntryQuery, varQ, function (err, results, fields) {
            database.release();
            if (err) {
                let obj = {};
                obj.error = e.code;
                obj.message = "Database server error"
                reject(obj);
            }else{
                if(results.affectedRows == 1){
                    resolve(true)
                }else{
                    let obj = {};
                    obj.error = "No primary id found";
                    obj.message = "Internal server error"
                    reject(obj);
                }
            }
            // database.end(); 
        });
    });
}



module.exports ={
    checkRegistrationDetailsValidity,
    userEmailPreExists,
    comparePassword,
    saveNewUserData,
    generateJwt,
    saveAccessToken,
    clearAccessToken
}