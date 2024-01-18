const Campground=require('../models/campgrounds');
const mbxGeocoding=require('@mapbox/mapbox-sdk/services/geocoding')
const mapbox_token=process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapbox_token});
const {cloudinary} = require('../cloudinary/index');
module.exports.index=async (req,res)=>{
    const camp=await Campground.find({});
    res.render('./campgrounds/index',{camp});
}

module.exports.renderNewForm=(req,res)=>{
    res.render("./campgrounds/new.ejs");
}

module.exports.createCampground=async (req,res,next)=>{
    const geoData=await geocoder.forwardGeocode({
        query:req.body.campground.location,
        limit:1
    }).send()
    const c = new Campground(req.body.campground);
    c.author=req.user._id;
    c.images=req.files.map(f=>({url:f.path,filename:f.filename})) //basically maps over the entire req.files
    c.geometry=geoData.body.features[0].geometry;
    await c.save();//and it returns an array objects conatining the following properties for each image
    console.log(c);
    req.flash('success','Successfully Made a New Campground!');
    res.redirect(`/campgrounds/${c._id}`);
} 

module.exports.showCampground=async (req,res)=>{
    const camp = await Campground.findById(req.params.id)
    .populate({path:'reviews',populate:{
        path:"author"}
    }).populate('author');
    console.log(camp); 
    if(!camp) 
    {
        req.flash('error',"Campground Couldn't be found");
        res.redirect('/campgrounds');
        //throw new appError("Page Not Found",400); this will also work
    }
    res.render("./campgrounds/show.ejs",{camp})
}

module.exports.editForm=async (req,res)=>{
    const campground=await Campground.findById(req.params.id);
    if(!campground){
    req.flash('error',"Campground Couldn't be found");
        res.redirect('/campgrounds');
    }
    res.render("./campgrounds/edit",{campground});
}

module.exports.editCampground=async (req,res,next)=>{
    const {id}=req.params;
    const campground=await Campground.findById(id);
    if(!campground)
    {
        req.flash("error","Campground Does't Exist");
        return res.redirect('/campground');
    }
    console.log(req.body);
    const camp=await Campground.findByIdAndUpdate(req.params.id,{...req.body.campground});
    const imgs=req.files.map(f=>({url:f.path,filename:f.filename}))
    camp.images.push(...imgs); //basically maps over the entire req.files
    if(req.body.deleteImages)
    {
        for(let filename in req.body.deleteImages)
        {
            await cloudinary.uploader.destroy(filename);
        }
        await camp.updateOne({$pull :{images :{filename:{$in : req.body.deleteImages}}}});
       //pull out from images array the images having filename in req.body.deleteImages
    } 
    await camp.save();
    req.flash('success',"Successfully Updated the Campground");
    res.redirect(`/campgrounds/${campground._id}`);
     }
 

module.exports.deleteCampground=async(req,res)=>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success","Successfully Deleted Campground");
    res.redirect("/campgrounds");
}     