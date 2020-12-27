module.exports = (req, res, next)=>{
    let pathAllowed = [
        '/',
        '/login',
        '/api/login',
        '/register',
        '/api/register',
        '/api/logout'
    ]
    for(let i=0;i<pathAllowed.length;i++){
        if(pathAllowed[i] == req.path){
            return next();
        }
    }
    if(req.session.authenticated){
        return next();
    }else{
        return res.redirect('/login');
    }
}