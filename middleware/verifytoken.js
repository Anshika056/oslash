/**
 *
 * file - verifytoken.js - Authorization
 *
 * @created    07/11/2021
 * @description : This file contains a middleware function to authenticate the request got from the user. 
 *             
 * @returns: UserId is required for all the users.
 *          
 * 
**/

const jwt = require("jsonwebtoken")
const {JWT_SECRET,JWT_EXPIRE_TIME,} = require("../config.json");

exports.authenticateRequest = async (req, res, next) => {
    try {
      const verifytoken = req.header('Authorization').split(" ")[1];
      console.log(verifytoken)
      if (!verifytoken) return res.status(400).send("token is required!");
      const isValidToken = await jwt.verify(verifytoken,JWT_SECRET);
      console.log(isValidToken,"the")
      
      res.locals.userId = isValidToken.id;
      next()

    } catch (err) {
      console.log(err);
      return res.status(400).send("Something went wrong!");
    }
  };