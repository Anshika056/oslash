const userMethods =  require("../services/userMethods")
const sendResponse = require("../helpers/requestHandler").sendResponse

/**
 * 
 * @author Anshika madan
 * @description The controller function is used to register the user and save the user data in the DB
 * @param {object} req - The express req object
 * @param {object} res - The express res object
 * @returns {void} - The function does not return anything. It sends the response using the sendResponse function
 * @throws none
 * 
**/
function userRegisteration (req,res){
    console.log("called")
    if ( req.body.email != null && req.body.firstName != null && req.body.lastName != null && req.body.password != null &&  req.body.phoneNumber != null) {
           userMethods.checkRegistrationDetailsValidity(req.body.firstName,req.body.lastName,req.body.email,req.body.password,req.body.phoneNumber).then(result=>{
            if(result){
                console.log("in the mail")
               return userMethods.userEmailPreExists(req.body.email)
            }else {
                sendResponse(res, null, " invalid user details", 400,"invalid_fields", 400);  
            }
           }).then(emailExists=>{
            console.log(emailExists)
              if(!emailExists.exists){
                console.log("in the last")
                  return userMethods.saveNewUserData(req.body.firstName, req.body.lastName, req.body.email, req.body.password, req.body.phoneNumber)
              }else{
                sendResponse(res, null, "User Email Already exists ", 400, "Invaild_Credentials", 400);
              }
           }).then(data=>{
            if(data.userId){
                sendResponse(res, data, "Registration successful", 200, null, 200);
            }
           }).catch((err) => setImmediate(() => {
            console.log(err); if (err.message == "Database server error") { sendResponse(res, null, "User registration details addition failed", 503, "database_server_error", 503) } else { sendResponse(res, null, "User registration details addition failed", 500, "internal_server_error", 500) }
        }))
    }else{
        sendResponse(res, null, "User registration failed", 400, "fields_missing", 400);
    }
}

/**
 * 
 * @author Anshika madan
 * @description The controller function is used to verify the user and make the valid user login with email and password as credentials
 * @param {object} req - The express req object
 * @param {object} res - The express res object
 * @returns {void} - The function does not return anything. It sends the response using the sendResponse function
 * @throws none
 * 
**/

function login(req,res){
    if ( req.body.email != null && req.body.password != null ){
        if (/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(req.body.email)) { 
              userMethods.userEmailPreExists(req.body.email).then(emailExists=>{
                if(emailExists.exists){
                   return Promise.all([
                    userMethods.comparePassword(req.body.password, emailExists.password),
                    emailExists.userId
                   ])
                }
              }).then(([isValidUser,userId])=>{
                if(isValidUser){
                    let userData= {
                         userId: userId
                    }
                    req.session.userId = userId;
                    sendResponse(res, userData, "User login successful", 200, null, 200);
                }else{
                    sendResponse(res, null, "Invalid Credentials!", 452, "unauthorized", 400);
                }
              })
        }else{ 
            sendResponse(res, null, "User login details check failed", 401, "unauthorized", 401);
        }
    }else{
        sendResponse(res, null, "User Login failed", 400, "fields_missing", 400);
    }
}

/**
 * 
 * @author Anshika madan
 * @description The controller function is used to get access token for logged in user
 * @param {object} req - The express req object
 * @param {object} res - The express res object
 * @returns {void} - The function does return the token and userId. It sends the response using the sendResponse function
 * @throws none
 * 
**/

function getAccessToken(req,res){
    console.log("hub")
    if(req.body.userId != null){
       let access_token =  userMethods.generateJwt(req.body.userId)
        console.log(access_token)
        userMethods.saveAccessToken(access_token,req.body.userId).then(result=>{
           if(result){
            sendResponse(res,{"token": result}, "access token generated", 200, null,200);
           }
       })
    }
}

/**
 * 
 * @author Anshika madan
 * @description The controller function is used to logout the logged in user
 * @param {object} req - The express req object
 * @param {object} res - The express res object
 * @returns {void} - The function does return the token and userId. It sends the response using the sendResponse function
 * @throws none
 * 
**/

function logout(req,res){
    if(req.body.userId != null){
        const access_token = req.header('Authorization').split(" ")[1];
         userMethods.clearAccessToken(access_token,req.body.userId).then(result=>{
            if(result){
             sendResponse(res,null, "user logout successful", 200, null,200);
            }else{
                sendResponse(res, null, "user logout unsuccessful", 452, "unauthorized", 400);
            }
        })
     }else sendResponse(res, null, "Invalid Credentials!", 452, "unauthorized", 400);
}


module.exports={
    userRegisteration,
    login,
    getAccessToken,
    logout
}


