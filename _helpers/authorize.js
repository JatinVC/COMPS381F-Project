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
            return next();
        }
    }
    if(req.session.authenticated){
        return next();
    }else{
        return res.redirect('/login');
    }
}