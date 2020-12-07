const router = require('express').Router();
const ObjectID = require('mongodb').ObjectID;
const authenticate = require('../_helpers/authorize');

//get all the restaurants in the collection
//redirect into the first page of all restaurants
router.get('/', (req, res, next) => res.redirect('/restaurants/1'));

router.get('/restaurants/:page', authenticate, async (req, res, next)=>{
    let page = req.params.page;
    let pageLimit = 25;
    let documents = await Promise.all([global.db.collection('restaurants').countDocuments()]);
    let pageCount = Math.ceil(documents[0] / pageLimit);
    if(page==1){
        global.db.collection('restaurants').find().limit(pageLimit).toArray((err, results)=>{
            if(err) console.log(err);
            res.render('restaurants', {restaurants: results, currentPage:page, pageCount});
        })
    }else{
        global.db.collection('restaurants').find().skip(page*pageLimit).limit(pageLimit).toArray((err, results)=>{
            if (err) console.log(err);
            res.render('restaurants', {restaurants: results, currentPage:page, pageCount});
        });
    }
});

router.get('/restaurant/:id', authenticate, (req, res, next)=>{
    let searchCrit = {
        _id: new ObjectID(req.params.id)
    };
    global.db.collection('restaurants').find(searchCrit).toArray((err, result)=>{
        if (err) throw err;
        console.log(result);
        res.render('restaurant', {restaurant: result[0]}); 
    });
});

//find restaurants by name
router.get('/api/restaurant/name/:name', (req, res, next)=>{
    global.db.collection('restaurants').find({name: req.params.name}).toArray((err, results)=>{
        if(err){
            console.log(err);
            res.redirect('/');
        }else{
            res.status(200).json(results);
        }
    });
});

//find restaurants by borough
router.get('/api/restaurant/borough/:borough', (req, res, next)=>{
    global.db.collection('restaurants').find({borough: req.params.borough}).toArray((err, results)=>{
        if(err){
            console.log(err);
            res.redirect('/');
        }else{
            res.status(200).json(results);
        }
    });
});

//find restaurants by cuisine
router.get('/api/restaurant/cuisine/:cuisine', (req, res, next)=>{
    global.db.collection('restaurants').find({cuisine: req.params.cuisine}).toArray((err, results)=>{
        if(err){
            console.log(err);
            res.redirect('/');
        }else{
            res.status(200).json(results);
        }
    });
});

//rate restaurants, only one review per user per restaurant
/*
algorithm:
check if the user already has a review in the system for this restaurant
if does have, cannot give a rating on this restaurant, return them back to the restaurant page with message or something
if doesn't have, take in the data and create the review by appending it to the end of the grades array of the document.
*/
router.post('/api/restaurant/:resid/rate', authenticate, (req, res, next)=>{

}); 
module.exports.router = router;