/**
 *
 * file - requestHandler.js - sql connection
 *
 * @created    07/11/2022
 *
 * @description : This file contains the function to handle the response of the apis
 *
 *  
**/
function sendResponse(res, data, message, internalCode, name, statusCode) { //name denotes presence of error, it signifies type of error
    errorJson = {
        'code': internalCode,
        'message': message,
        'name': name,
    }
    if(data == null){
        successJson = {
            'code': internalCode,
            'message':message
        }
        res
        .status(statusCode)
        .json(name !== null ? errorJson : successJson);
    }else{
        successJson = {
            'code':internalCode,
            'message':message,
            'data':data,
        }
        res
        .status(statusCode)
        .json(name !== null ? errorJson : successJson);
    }
}

module.exports =
{
    sendResponse
}