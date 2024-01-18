const express=require('express');
const app=express();
const mongoose=require('mongoose');
const router=express.Router();
const User=require('../models/user');
const passport=require('passport');
const catchError=require('../utils/catchError');
const storeReturnTo=require('../returnTo');
const {isLoggedIn}=require('../middleware');
const users=require('../controllers/users');


router.route('/register')
    .get(users.registerForm)
    .post(catchError(users.createUser))

router.route('/login')
    .post(storeReturnTo,passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}),users.loginUser)
    .get(users.loginForm);

router.get('/logout',users.logoutUser)

module.exports=router;

