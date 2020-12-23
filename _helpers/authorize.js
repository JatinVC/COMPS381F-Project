module.exports = (req, res, next)=>{
    let pathAllowed = [
        '/',
        '/login',
        '/api/login',
        '/register',
        '/api/register',
        '/api/logout'
    ]
    for(let path in pathAllowed){
        if(path == req.path){
            next();
        }
    }
    if(req.session.authenticated){
        next();
    }else{
        res.redirect('/login');
    }
}