
/**
 *
 * file - shortcutRoutes.js - shortcut routes
 *
 * 
 * @created    07/11/2022
 *
 * @description : This file contains the routes related to the shortcuts created by users.
 *
 *
 *  
**/

const {authenticateRequest} = require("../middleware/verifytoken")

module.exports = (router, app, shortcutController) => {

    router.post('/createshortcut',authenticateRequest, shortcutController.createShortcut);
    router.post('/fetchUserShortcuts',authenticateRequest, shortcutController.fetchUserShortcuts);
    router.post('/deleteshortcut',authenticateRequest, shortcutController.deleteshortcut);
    router.post('/fetchShortCutsWithMatch',authenticateRequest, shortcutController.fetchShortCutsWithMatch);
    

    return router
}