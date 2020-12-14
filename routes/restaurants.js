const router = require('express').Router();
const ObjectID = require('mongodb').ObjectID;
const authorize = require('../_helpers/authorize');

//get all the restaurants in the collection
//redirect into the first page of all restaurants
router.get('/', (req, res, next) => {res.redirect('/restaurants/1');});

router.get('/restaurants/:page', authorize, async (req, res, next)=>{
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

router.get('/restaurant/:id', authorize, (req, res, next)=>{
    let searchCrit = {
        _id: new ObjectID(req.params.id)
    };
    global.db.collection('restaurants').find(searchCrit).toArray((err, result)=>{
        if (err) console.log(error);
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
router.get('/restaurant/:resid/rate', authorize, (req, res, next)=>{
    res.render('rate', {resid:req.params.resid});
});

/*
algorithm:
check if the user already has a review in the system for this restaurant
if does have, cannot give a rating on this restaurant, return them back to the restaurant page with message or something
if doesn't have, take in the data and create the review by appending it to the end of the grades array of the document.
*/
//TODO: TEST THIS, UNTESTED
router.post('/api/restaurant/:resid/rate', authorize, (req, res, next)=>{
    let searchCrit = {
        _id: new ObjectID(req.params.resid)
    };
    global.db.collection('restaurants').find(searchCrit).toArray((err, result)=>{
        if (err) console.log(error);
        let username = req.session.username;
        for(let i = 0; i<result[0].grades.length; i++){
            if (result[0].grades[i].username == username){
                console.log('you cannot rate again');
                res.redirect(`/restaurant/${req.params.resid}`);
            }
        }
        let currentDate = new Date().toISOString();
        let gradeDoc = {
            username: req.session.username,
            grade: req.body.score,
            date: currentDate
        };
        global.db.collection('restaurants').updateOne({_id: new ObjectID(req.params.resid)},{$push: {grades: gradeDoc}});
        res.redirect(`/restaurant/${req.params.resid}`)
    });
}); 
module.exports.router = router;