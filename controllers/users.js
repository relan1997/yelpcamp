const User=require('../models/user');


module.exports.registerForm=(req,res)=>{
    res.render('users/register')
}

module.exports.createUser=async (req,res,next)=>{
    try{
    const {username,password,email}=req.body;
    const user=new User({email,username});
    const new_user=await User.register(user,password);
    req.login(new_user,(err)=>{
        if(err) return next(err);
    })
    req.flash("success","Welcome To YelpCamp");
    res.redirect('/campgrounds');
    }catch(e)
    {
        req.flash('error',e.message);
        res.redirect('/register');
    }
}

module.exports.loginForm=(req,res)=>{
    res.render('users/login');
}

module.exports.logoutUser=(req,res)=>{
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });;
}

module.exports.loginUser=(req,res)=>{
    req.flash("success","Welcome To YelpCamp");
    const redirectUrl=res.locals.returnTo || '/campgrounds';
    res.redirect(redirectUrl);
}