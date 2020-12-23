require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const cors = require('cors');
const http = require('http');
const initDB = require('./lib/db');
const authorize = require('./_helpers/authorize');


//setting stuff
app.set('view engine', 'ejs');

//allowing requests CORS (Cross origin resource sharing)
app.use(function(req, res, next) {
    app.options('*', cors());
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Referer, Authorization");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    next();
});
//enabling middlewares
app.use(bodyParser.urlencoded({extended: false}));
// app.use(cookieParser());
app.use(cookieSession({
    name: 'session',
    keys: [process.env.SECRET_KEY_ONE, process.env.SECRET_KEY_TWO]
}));
app.use(bodyParser.json());
app.use(authorize);

//requiring the routes
const restaurants = require('./routes/restaurants');
const auth = require('./routes/auth');
//routing the mounts
app.use(restaurants.router);
app.use(auth.router);


//saving db as global variable, starting express server
initDB().then(db =>{
    global.db = db[0];
    const server = http.createServer(app);
    server.listen(4000);
}).catch(err=>{
    console.log('failed to connect to database');
    console.log(err);
});

module.exports = app;