module.exports = (req, res, next)=>{
        console.log(req.session.authenticated);
        // if(req.session.authenticated){
        //     next();
        // }else{
        //     res.redirect('/login');
        // }
}