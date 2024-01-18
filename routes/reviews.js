const express=require('express');
const mongoose=require('mongoose');
const router=express.Router({mergeParams:true});
const catchError=require('../utils/catchError');
const appError=require('../utils/ExpressError');
const Campground=require('../models/campgrounds');
const Review=require('../models/review');
const isLoggedIn=require('../middleware')
const isReviewAuthor=require("../isReviewAuthor");
const reviews=require('../controllers/reviews');

const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi=BaseJoi.extend(extension);


const validateReview=(req,res,next)=>{
    const reviewSchema=Joi.object({
        review:Joi.object({
             body:Joi.string().required().escapeHTML(),
             rating:Joi.number().required().min(1).max(5)
        }).required()
    });
    const {error}=reviewSchema.validate(req.body);
    if(error)
    {
        const msg=error.details.map(e=>e.message).join(',');
        throw new appError(msg ,500)
    }else{
        next(error);
    }
}   
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

router.post('/',validateReview,isLoggedIn,catchError(reviews.createReview))

router.delete("/:reviewId",isLoggedIn,isReviewAuthor,catchError(reviews.deleteReview));

module.exports=router;