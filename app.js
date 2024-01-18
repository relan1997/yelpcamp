require('dotenv').config();
//console.log(process.env.CLOUDINARY_CLOUD_NAME,process.env.CLOUDINARY_SECRET,process.env.CLOUDINARY_KEY);
//db.musics.findOneAndUpdate({name:'Chamak Challo'},{$set:{songURL:'https://res.cloudinary.com/dsxtijfwb/video/upload/v1704876236/music-player/Chammak_Challo_sxm8mf.mp3'}})
const express=require('express');
const app=express();
const path=require('path');
const ejsMate=require('ejs-mate');
const Joi=require('joi');
const catchError=require('./utils/catchError');
const appError=require('./utils/ExpressError');
const Campground=require('./models/campgrounds');
const methodOverride=require("method-override");
const Review=require('./models/review');
const campgrounds=require('./routes/campgrounds')
const reviews=require('./routes/reviews');
const users=require('./routes/users');
const flash=require('connect-flash');
const mongoose = require('mongoose');
const passport=require('passport');
const localStrategy=require('passport-local');  
const User=require('./models/user');
const mongosSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

const session=require('express-session');
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp',{
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology:true,
    useFindAndModify:false
});


app.engine("ejs",ejsMate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'))

app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')));

const sessionOption={secret:'thisisasecret',resave:false,saveUninitialized:true,
    cookie:{
        expires:Date.now() + 1000*60*60*24*7,
        maxAge:1000*60*60*24*7,
        httpOnly:true
    }
}
app.use(session(sessionOption));
app.use(flash());
app.use(helmet({contentSecurityPolicy:false}));

// const scriptSrcUrls = [
//     "https://stackpath.bootstrapcdn.com/",
//     "https://api.tiles.mapbox.com/",
//     "https://api.mapbox.com/",
//     "https://kit.fontawesome.com/",
//     "https://cdnjs.cloudflare.com/",
//     "https://cdn.jsdelivr.net",
// ];
// const styleSrcUrls = [
//     "https://kit-free.fontawesome.com/",
//     "https://stackpath.bootstrapcdn.com/",
//     "https://api.mapbox.com/",
//     "https://api.tiles.mapbox.com/",
//     "https://fonts.googleapis.com/",
//     "https://use.fontawesome.com/",
// ];
// const connectSrcUrls = [
//     "https://api.mapbox.com/",
//     "https://a.tiles.mapbox.com/",
//     "https://b.tiles.mapbox.com/",
//     "https://events.mapbox.com/",
// ];
// const fontSrcUrls = [];
// app.use(
//     helmet.contentSecurityPolicy({
//         directives: {
//             defaultSrc: [],
//             connectSrc: ["'self'", ...connectSrcUrls],
//             scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
//             styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
//             workerSrc: ["'self'", "blob:"],
//             objectSrc: [],
//             imgSrc: [
//                 "'self'",
//                 "blob:",
//                 "data:",
//                 "https://res.cloudinary.com/douqbebwk/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
//                 "https://images.unsplash.com/",
//             ],
//             fontSrc: ["'self'", ...fontSrcUrls],
//         },
//     })
// );


app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate())); //basically we want to execute the function authenticate which is provided by mongoose
passport.serializeUser(User.serializeUser())// both of the methods tell us
passport.deserializeUser(User.deserializeUser());//how info is stored and retreived from the session


app.use((req,res,next)=>{

    res.locals.currentUser=req.user;
    res.locals.success=req.flash("success");
    res.locals.error=req.flash('error');
    next();
})

app.use(mongosSanitize());

app.use('/',users);
app.use('/campgrounds',campgrounds);
app.use('/campgrounds/:id/reviews',reviews);


app.get('/',(req,res)=>{
    res.render('home.ejs') 
})

app.all("*",(req,res,next)=>{
    next(new appError("Page Not Found",404));
})

app.use((err,req,res,next)=>{
    const {status=500}=err;
    if(!err.message) err.message="Something Went Wrong";
    res.status(status).render('error',{err});
})

app.listen(3000,()=>{
    console.log("serving on port 3000");
});