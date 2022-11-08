/**
 *
 * file - app.js - all the controllers,routes and databases controller
 *
 * @created    07/11/2022
 *
 * @description : This file contains all the exported controllers , database connectivity and api routes related to the app.
 *
 *
 *  
**/
require('dotenv').config();
const config = require('./config.json').staging
const path = require('path');
const express = require('express')
const bodyParser = require('body-parser')
const app = express();
const helmet = require('helmet');
const morgan = require('morgan');
const {createMySqlPool} = require('./database/mysql')


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//json middleware
app.use(express.json())

const sessions = require("express-session");

const oneDay = 1000 * 60 * 60 * 24;
app.use(
  sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: false,
  })
);

  app.get("/",(req,res) => {
    res.send("check")
})


const authController = require('./controllers/authController');
const shortcutController = require("./controllers/shortcuts")
const authRoutes = require('./routes/authRoutes')(express.Router(), app, authController);
const shortcutRoutes = require("./routes/shortcutRoutes")(express.Router(), app, shortcutController);

app.use('/auth', authRoutes);
app.use('/restricted', shortcutRoutes);

// database connection
  createMySqlPool().then(async () => {
    console.log("\x1b[32m",'MySql Database connected')
   }).catch((err) => setImmediate(() => {console.log("\x1b[31m",'Could not connect to  mysql Database, error - %s',err)}));

  

module.exports = app;