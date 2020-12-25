const router = require('express').Router();
const ObjectID = require('mongodb').ObjectID;
const formidable = require('formidable');
const fs = require('fs');
const url = require('url');
const assert = require('assert');
//get all the restaurants in the collection
//redirect into the first page of all restaurants
//TODO: just make a first page for this system
router.get('/', (req, res, next) => {res.redirect('/restaurants/1');});

router.get('/creatrestaurant', (re, res, next) => { 
    res.render('creatrestaurant');});
router.get('/restaurants/:page', async (req, res, next)=>{
    let page = req.params.page;
    let pageLimit = 25;
    let documents = await Promise.all([global.db.collection('restaurants').countDocuments()]);
    let pageCount = Math.ceil(documents[0] / pageLimit);
    if(page==1){
        global.db.collection('restaurants').find().limit(pageLimit).toArray((err, results)=>{
            if(err) console.log(err);
            res.render('restaurants', {restaurants: results, currentPage:page, pageCount, search: false, filter:'', query:''});
        })
    }else{
        global.db.collection('restaurants').find().skip(page*pageLimit).limit(pageLimit).toArray((err, results)=>{
            if (err) console.log(err);
            res.render('restaurants', {restaurants: results, currentPage:page, pageCount, search: false, filter:'', query:''});
        });
    }
});

router.get('/restaurant/:id', (req, res, next)=>{
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
router.get('/restaurant/:resid/rate', (req, res, next)=>{
    res.render('rate', {resid:req.params.resid});
});
//delete restaurant
router.get('/restaurant/:resid/delete', (req, res, next)=>{
    let searchCrit = {
        _id: new ObjectID(req.params.resid)
    };
    global.db.collection('restaurants').find(searchCrit).toArray((err, result)=>{
        if (err) console.log(error);
        let username = req.session.username;
            if (result[0].owner == username){
                global.db.collection('restaurants').deleteOne({_id: new ObjectID(req.params.resid)})
                res.redirect(`/`);
            }
            else{
                res.render('warn');
                }
        
  
})
});


//update restaurant
router.get('/restaurant/:resid/edit', (req, res, next)=>{
    let searchCrit = {
        _id: new ObjectID(req.params.resid)
    };
    global.db.collection('restaurants').find(searchCrit).toArray((err, result)=>{
        if (err) console.log(error);
        let username = req.session.username;
            if (result[0].owner == username){
                res.render('edit', {resid:req.params.resid});
            }
            else{
                res.render('warn');
                }
});
});


router.post('/api/updaterestaurant', (req, res, next)=>{
    let restaurantname = req.body.name;
    let borough = req.body.borough;
    let cuisine = req.body.cuisine;
    let street = req.body.street;
    let building = req.body.building;
    let zipcode = req.body.zipcode;
    let coord = req.body.coord;
    let score = req.body.score;
    let owner = req.session.username;
    var changeDoc = {
        name : restaurantname,
        borough : borough,
        cuisine : cuisine,
        street : street,
        building : building,
        zipcode : zipcode,
        coord : coord,
        score : score,
        owner : owner,
    };
    global.db.collection('restaurants').updateOne({_id: new ObjectID(req.params.resid)},{$push: {name: changeDoc,  borough:changeDoc, cuisine:changeDoc,street :changeDoc,building :changeDoc, zipcode :changeDoc
       , coord :changeDoc,  score :changeDoc, owner :changeDoc }});
    res.redirect(`/restaurant/${req.params.resid}`)
    
});
/*
algorithm:
check if the user already has a review in the system for this restaurant
if does have, cannot give a rating on this restaurant, return them back to the restaurant page with message or something
if doesn't have, take in the data and create the review by appending it to the end of the grades array of the document.
*/
//TODO: TEST THIS, UNTESTED
router.post('/api/restaurant/:resid/rate', (req, res, next)=>{
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

//search system
router.get('/search/:page', async (req, res, next)=>{
    let searchQuery = {};
    searchQuery[req.query.filter] = req.query.query
    let page = req.params.page;
    let pageLimit = 25;
    let documents = await Promise.all([global.db.collection('restaurants').countDocuments(searchQuery)]);
    let pageCount = Math.ceil(documents[0] / pageLimit);
    if(page==1){
        //something happens here
        global.db.collection('restaurants').find(searchQuery).limit(pageLimit).toArray((err, results)=>{
            if(err) console.log(err);
            res.render('restaurants', {restaurants:results, currentPage: page, pageCount, search: true, filter: req.query.filter, query: req.query.query});
        });
    }else{
        global.db.collection('restaurants').find(searchQuery).skip(page*pageLimit).limit(pageLimit).toArray((err, results)=>{
            if(err) console.log(err);
            res.render('restaurants', {restaurants:results, currentPage:page, pageCount, search: true, filter: req.query.filter, query: req.query.query});
        })
    }
});
router.post('/api/creatrestaurant', (req, res, next)=>{
            let restaurantname = req.body.name;
            let borough = req.body.borough;
            let cuisine = req.body.cuisine;
            let street = req.body.street;
            let building = req.body.building;
            let zipcode = req.body.zipcode;
            let coord = req.body.coord;
            let score = req.body.score;
            let owner = req.session.username;
            var newrestaurant = {
                name : restaurantname,
                borough : borough,
                cuisine : cuisine,
                street : street,
                building : building,
                zipcode : zipcode,
                coord : coord,
                score : score,
                owner : owner,
            };
                    global.db.collection('restaurants').insertOne(newrestaurant, (err)=>{
                        if(err) console.log(err);
                        res.redirect('/');
                    })
              
            
        });
module.exports.router = router;