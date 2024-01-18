const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const Review=require("./review");

const imageSchema = new Schema({
        url:String,
        filename:String
})

imageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload','/upload/w_200');
})

const opts={toJSON:{virtuals:true}};

const CampgroundSchema= new Schema({
    title:String,
    price:Number,
    images:[imageSchema],//image attribute is an array where each object has the following properties
    geometry: {
        type: {
          type: String, // Don't do `{ location: { type: String } }`
          enum: ['Point'], // 'location.type' must be 'Point'
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
      },
    description:String,
    location:String,
    author:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    reviews:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Review"
        }
    ]
},opts);

CampgroundSchema.virtual('properties.popUpMarkup').get(function() {
    return `<strong><a href='/campgrounds/${this._id}'>${this.title}</a></strong>
    <p>${this.description.substring(0,20)}...</p>`;
})

CampgroundSchema.post('findOneAndDelete',async(campground)=>{
    if(campground.reviews.length)
    {
        const res=await Review.deleteMany({_id:{$in : campground.reviews}})
        console.log(res);
    }
    //console.log("DELETED!!!!");
});

module.exports=mongoose.model("Campground",CampgroundSchema);