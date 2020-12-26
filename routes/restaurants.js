const router = require('express').Router();
const ObjectID = require('mongodb').ObjectID;
const formidable = require('formidable');
const fs = require('fs');

//home page redirect to the first page of restaurants
router.get('/', (req, res, next) => {res.redirect('/restaurants/1');});

//create new restaurant page
router.get('/restaurants/create', (req, res, next) => { 
    res.render('createrestaurant');
});

//show all restaurants using pagination
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

//look at the individual restaurant
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

//rate restaurants, only one review per user per restaurant
router.get('/restaurant/:resid/rate', (req, res, next)=>{
    res.render('rate', {resid:req.params.resid});
});

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

//delete restaurant
router.post('/api/restaurant/:resid/delete', (req, res, next)=>{
    let searchCrit = {
        _id: new ObjectID(req.params.resid)
    };
    global.db.collection('restaurants').find(searchCrit).toArray((err, result)=>{
        if (err) console.log(error);
        if(result[0].owner){
            if (result[0].owner == req.session.username){
                global.db.collection('restaurants').deleteOne(searchCrit)
                .then(result=>{
                    if(result){
                        res.redirect('/restaurants/1')
                    }
                })
                .catch(err=>{
                    if(err){
                        res.redirect(`/restaurant/${req.params.resid}`, {message: 'error deleting file'});
                    }
                });
            }
            else{
                res.render('warn');
            }
        }else{
            //delete it if there is no owner
            global.db.collection('restaurants').deleteOne(searchCrit)
            .then(result=>{
                if(result){
                    res.redirect('/restaurants/1')
                }
            })
            .catch(err=>{
                if(err){
                    res.redirect(`/restaurant/${req.params.resid}`, {message: 'error deleting file'});
                }
            });
        }
    })
});

//update restaurant, add more information to just make this easier lol
router.get('/restaurant/:resid/edit', (req, res, next)=>{
    let searchCrit = {
        _id: new ObjectID(req.params.resid)
    };
    global.db.collection('restaurants').find(searchCrit).toArray((err, result)=>{
        if (err) console.log(error);
        if(result[0].owner){
            if (result[0].owner == req.session.username){
                res.render('edit', {restaurant:result[0]});
            }
            else{
                res.render('warn');
            }
        }else{
            res.render('edit', {restaurant:result[0]});
        }
    });
});

router.post('/api/restaurant/:resid/edit', (req, res, next)=>{
    //add image insertion in here as well
    const form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files){
        if(err){
            console.log(err);
        }else{
            let updateQuery = {
                name: fields.name,
                borough: fields.borough,
                cuisine: fields.cuisine,
                address:{
                    street: fields.street,
                    building: fields.building,
                    zipcode: fields.zipcode,
                    coord: [fields.long,fields.lat]
                },
            }
        
            if(files.photo.size > 0){
                fs.readFile(files.photo.path, (err, data)=>{
                    if(err){
                        console.log(err);
                    }else{
                        // convert the picture to base 64 for insertion
                        updateQuery['mimetype'] = files.photo.type;
                        updateQuery['photo'] = new Buffer.from(data).toString('base64');
                        // insertion of the new document
                        // find the restaurant we want to update
                        let findQuery = {
                            _id: new ObjectID(req.params.resid),
                        }
                        global.db.collection('restaurants').updateOne(findQuery, {$set: updateQuery}, {upsert:true})
                        .then(result=>{
                            if(result){
                                res.redirect(`/restaurant/${req.params.resid}`);
                            }
                        })
                        .catch(err=>{
                            if(err){
                                res.redirect(`/restaurant/${req.params.resid}`, {message: err});
                            }   
                        });
                    }
                })
            }else{
                //update document without the picture
                let findQuery = {
                    _id: new ObjectID(req.params.resid),
                }
                global.db.collection('restaurants').updateOne(findQuery, {$set: updateQuery}, {upsert:true})
                .then(result=>{
                    if(result){
                        res.redirect(`/restaurant/${req.params.resid}`);
                    }
                })
                .catch(err=>{
                    if(err){
                        res.redirect(`/restaurant/${req.params.resid}`, {message: err});
                    }   
                });
            }
        }
    })
});

router.post('/api/restaurant/create', (req, res, next)=>{
    //convert photo to base64
    let form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files)=>{
        if(err){
            console.log(err);
        }else{
            let insertQuery = {
                name: fields.name || '',
                borough: fields.borough || '',
                cuisine: fields.cuisine || '',
                address: {
                    street: fields.street || '',
                    building: fields.building || '',
                    zipcode: fields.zipcode || '',
                    coord: [fields.lat, fields.long] || [],
                },
                grades: [],
                owner: req.session.username
            }
            if(files.photo.size > 0){
                fs.readFile(files.photo.path, (err, data)=>{
                    if(err){
                        console.log(err);
                    }else{
                        //convert the picture to base64
                        insertQuery['mimetype'] = files.photo.type;
                        insertQuery['photo'] = new Buffer.from(data).toString('base64');
                        //insertion here
                        global.db.collection('restaurants').insertOne(insertQuery)
                        .then(result=>{
                            res.redirect('/');
                        })
                    }
                });
            }else{
                global.db.collection('restaurants').insertOne(insertQuery)
                .then(result=>{
                    res.redirect('/');
                })
            }
        }
    });   
});

module.exports.router = router;