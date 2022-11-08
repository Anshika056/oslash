
//const {oauthErrorHandler} = require('../middleware/oauthErrorHandler')
/**
 *
 * file - authRoutes.js - auth routes
 *
 * 
 * @created    07/11/2022
 *
 * @description : This file contains the auth routes related to the user.
 *
 *
 *  
**/
const jwtn = require('jsonwebtoken');
const {authenticateRequest} = require("../middleware/verifytoken")

module.exports = (router, app, authController) => {

    router.post('/userRegistrationDetails', authController.userRegisteration);
    router.post('/login',authController.login);
    router.post('/getAccessToken', authController.getAccessToken);
    router.post('/logout', authenticateRequest,authController.logout);

    return router
}