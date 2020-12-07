require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const session = require('cookie-session');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const http = require('http');
const initDB = require('./lib/db');
const server = http.createServer(app);

//setting stuff
app.set('port', 3000);
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
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
    name: 'session',
    keys: [process.env.SECRET_KEY_ONE, process.env.SECRET_KEY_TWO]
}));

//requiring the routes
const restaurants = require('./routes/restaurants');
const auth = require('./routes/auth');
//mounting the routes
app.use('/', restaurants.router);
app.use('/', auth.router);


//saving db as global variable, starting express server
initDB().then(db =>{
    global.db = db[0];
    server.listen(3000);
}).catch(err=>{
    console.log('failed to connect to database');
    console.log(err);
});

module.exports = app;