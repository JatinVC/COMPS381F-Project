require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;

const connect = (url, dbName)=>{
    return MongoClient.connect(url).then(client => client.db(dbName));
};

module.exports = async ()=>{
    let devURL = process.env.MONGO_URL;
    //can put in multiple databases here for production and or development purposes
    let database = await Promise.all([connect(devURL, 'project')]);
    return database;
}