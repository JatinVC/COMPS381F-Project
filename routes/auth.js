const router = require('express').Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;

router.get('/login', (req, res, next)=>{
    if(req.session.authenticated){
        res.redirect('/');
    }else{
        res.render('login');
    }
});

router.get('/register', (req, res, next)=>{
    if(req.session.authenticated){
        res.redirect('/');
    }else{
        res.render('register');
    }
});

router.post('/api/register', (req, res, next)=>{
    let username = req.body.username;
    let plainPassword = req.body.password;
    let name = req.body.firstname + ' ' + req.body.lastname;

    bcrypt.genSalt(saltRounds, (err, salt)=>{
        bcrypt.hash(plainPassword, salt, (err, hash)=>{
            //TODO add the user to the database
            var document = {
                username: username,
                password: hash,
                name: name
            };
            global.db.collection('users').insertOne(document, (err)=>{
                if(err) console.log(err);
                res.redirect('/');
            });
        });
    }); 
});

router.post('/api/login', (req, res, next)=>{
    let username = req.body.username;
    let plainPassword = req.body.password;

    //do the query to get the data for the user based on the username given
    let query = {
        username: username
    }
    global.db.collection('users').find(query).toArray((err, user)=>{
        if(user){
            bcrypt.compare(plainPassword, user[0].password, (err, result)=>{
                if (err) console.log(err);
                if(result){
                    req.session.authenticated = true;
                    req.session.username = username;
                    req.session.userid = user[0]._id.toString();
                    res.redirect('/');
                }
            });
        }else{
            console.log(err);
            res.redirect('/');
        }
    }); 
});

router.get('/api/logout', (req, res, next)=>{
    req.session = null;
});

module.exports.router = router;