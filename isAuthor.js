const Campground=require('./models/campgrounds');
const isAuthor=async (req,res,next)=>{
    const {id}=req.params;
    const campground=await Campground.findById(id);
    if(!campground.author.equals(req.user._id))
    {
        req.flash("error","You don't have Permission");
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}
module.exports=isAuthor;