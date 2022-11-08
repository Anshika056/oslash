const shortcutMethods = require("../services/shortcutMethods")
const sendResponse = require("../helpers/requestHandler").sendResponse

/**
 * 
 * @author Anshika madan
 * @description The controller function is used to create shortcut and save the unique shortcut in the database
 * @param {object} req - The express req object
 * @param {object} res - The express res object
 * @returns {void} - The function does not return anything. It sends the response using the sendResponse function
 * @throws none
 * 
**/

function createShortcut(req,res){
    if ((req.body.shortlink != null && req.body.url != null && req.body.description != null)  || req.body.tags != null) {
        shortcutMethods.uniqueShortcut(req.body.shortlink,res.locals.userId).then(isUnique=>{
            console.log(isUnique,"the unique")
          if(isUnique){
            if(/[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi.test(req.body.url)){
                let shortcutName = `o/${req.body.shortlink}`
                return shortcutMethods.createShortcut(shortcutName,req.body.url,req.body.description,res.locals.userId,req.body.tags)
            }else{
                sendResponse(res, null, "Invalid Url", 452, "invalid_feilds", 400);
            }
          }else{
            sendResponse(res, null, "create a unique shortcut", 452, "invalid_shortcut", 400);
          }
        }).then(shortcutcreated=>{
            if(shortcutcreated){
                let data ={}
                data.shortlink = shortcutcreated.shortCut;
                data.url = req.body.url;
                data.description = req.body.description;
                sendResponse(res, data, "shortcut created succesfully", 200, null, 200);
            }
        })
    }else{ 
        sendResponse(res, null, "Shorcut creation failed", 400, "fields_missing", 400);
    }
}


/**
 * 
 * @author Anshika madan
 * @description The controller function is used to fetch the list of shortcut created by user and sort them according to the user choice ie- shortlink,url etc
 * @param {object} req - The express req object
 * @param {object} res - The express res object
 * @returns {void} - The function does return  the response using the sendResponse function and all the list of shortcuts
 * @throws none
 * 
**/

function fetchUserShortcuts(req,res){
    if(res.locals.userId != null){
        shortcutMethods.fetchShortCuts(res.locals.userId,req.body.requestedColumn).then(results=>{
            sendResponse(res, results, "shortcut fetched succesfully", 200, null, 200);
        })
    }else{
        sendResponse(res, null, "Insufficient permissions", 400, "fields_missing", 400);
    }
}

/**
 * 
 * @author Anshika madan
 * @description The controller function is used to delete the shortcut
 * @param {object} req - The express req object
 * @param {object} res - The express res object
 * @returns {void} - The function does not return anything. It sends the response using the sendResponse function
 * @throws none
 * 
**/

function deleteshortcut(req,res){
    if(res.locals.userId != null){
        shortcutMethods.isShortcut(req.body.shortlink,res.locals.userId).then(results=>{
            if(results){
               return shortcutMethods.deleteUserShortCut(req.body.shortlink,res.locals.userId)
            }else{
                sendResponse(res, null, "Invalid Shortcut", 452, "invalid_feilds", 400);
            }
        }).then(data=>{
            console.log(data,"the data")
            if(data){
                sendResponse(res, null, "shortcut deleted succesfully", 200, null, 200);
            }else{
                sendResponse(res, null, "shortcut not deleted ", 452, "unable_to_delete", 400);
            }
        })
    }else{
        sendResponse(res, null, "Insufficient permissions", 400, "fields_missing", 400);
    }
}

/**
 * 
 * @author Anshika madan
 * @description The controller function is used to search the shortcut with the matched conditions
 * @param {object} req - The express req object
 * @param {object} res - The express res object
 * @returns {void} - The function does not return anything. It sends the response using the sendResponse function
 * @throws none
 * 
**/


function fetchShortCutsWithMatch(req,res){
    if(res.locals.userId != null){
        shortcutMethods.fetchUserShortCuts(res.locals.userId,req.body.shortlink,req.body,description,req.body.tag).then(results=>{

            sendResponse(res, results, "shortcut fetched succesfully", 200, null, 200);
        })
    }else{
        sendResponse(res, null, "Insufficient permissions", 400, "fields_missing", 400);
    }
}


module.exports={
    createShortcut,
    fetchUserShortcuts,
    deleteshortcut,
    fetchShortCutsWithMatch
}