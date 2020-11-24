const db = require('../lib/db');

const router = require('express').Router();

//get all the bloody restaurants in the collection
router.get('/', (req, res, next)=>{
    global.db.collection('restaurants').find().toArray((err, results)=>{
        if (err) throw err;
        res.send(results);
    });
});

module.exports = router;