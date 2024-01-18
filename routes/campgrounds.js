const express=require('express');
const router=express.Router();
const catchError=require('../utils/catchError');
const appError=require('../utils/ExpressError');
const Campground=require('../models/campgrounds');
const isLoggedIn=require('../middleware');
const isAuthor=require('../isAuthor');
const campgrounds=require('../controllers/campgrounds');
const multer=require('multer');
const {storage} = require('../cloudinary/index');
const upload=multer({storage:storage});

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

const validateCampground=(req,res,next)=>{
    const campgroundSchema=Joi.object({
        campground:Joi.object({
            title:Joi.string().required().escapeHTML(),
            price:Joi.number().required().min(0),
            description:Joi.string().required(),
            // images:Joi.string().required(),
            location:Joi.string().required( ).escapeHTML()
        }).required(),
        deleteImages:Joi.array()
    });

    const {error}=campgroundSchema.validate(req.body);
    if(error)
    {
        const msg=error.details.map(e=>e.message).join(',');
        throw new appError(msg ,500)
    }else{
        next(error);
    }
}

router.get("/new",isLoggedIn,(campgrounds.renderNewForm));

router.route("/")
    .get(catchError(campgrounds.index))
    .post(upload.array('image'),validateCampground,isLoggedIn,catchError(campgrounds.createCampground))

router.route("/:id")
    .get(catchError(campgrounds.showCampground))
    .put(isLoggedIn,isAuthor,upload.array('image'),validateCampground,catchError(campgrounds.editCampground))
    .delete(isLoggedIn,catchError(campgrounds.deleteCampground));
    
router.get("/:id/edit",isLoggedIn,isAuthor,catchError(campgrounds.editForm));

module.exports=router;