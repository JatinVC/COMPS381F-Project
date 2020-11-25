const router = require('express').Router();
const ObjectID = require('mongodb').ObjectID;

//get all the bloody restaurants in the collection
router.get('/', (req, res, next)=>{
    global.db.collection('restaurants').find().toArray((err, results)=>{
        if (err) throw err;
        // res.send(results);
        console.log(results[0]);
        res.render('restaurants', {restaurants: results});
    });
});

router.get('/restaurant/:id', (req, res, next)=>{
    let searchCrit = {
        _id: new ObjectID(req.params.id)
    };
    //TODO setup pagination for the main page
    global.db.collection('restaurants').find(searchCrit).toArray((err, result)=>{
        if (err) throw err;
        console.log(result);
        res.render('restaurant', {restaurant: result[0]}); 
    });
});

module.exports.router = router;