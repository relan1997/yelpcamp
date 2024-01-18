const Campground=require('../models/campgrounds');
const cities=require('./cities');
const mongoose = require('mongoose');
const {places , descriptors}=require('./seedHelpers');
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp',{
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology:true
});

const sample = array => array[Math.floor(Math.random()* array.length)];

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const seedDB=async()=>{
    await Campground.deleteMany({});
    for(let i=0;i<200;i++)
    {
        const rand=Math.floor(Math.random()*1000+1);
        const price100=Math.floor(Math.random()*100+1);
        const c=new Campground({
            author:"658bd8746bcc796b949b4c1b",
            location:`${cities[rand].city} ${cities[rand].state}`,
            geometry:{ coordinates: [ cities[rand].longitude,cities[rand].latitude ], type: 'Point' },
            title:`${sample(descriptors)} ${sample(places)}`,
            images:[{
                url: 'https://res.cloudinary.com/dsxtijfwb/image/upload/v1704278829/yelp-camp/segqaad97bx9ndjjtmwy.jpg',
                filename: 'yelp-camp/segqaad97bx9ndjjtmwy'
              },
              {
                url: 'https://res.cloudinary.com/dsxtijfwb/image/upload/v1704278829/yelp-camp/xxndxtocgbgmlwkoeuwb.jpg',
                filename: 'yelp-camp/xxndxtocgbgmlwkoeuwb'
              }],
            description:'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Optio explicabo quia natus expedita cum reprehenderit laboriosam, unde, id temporibus odio earum aspernatur laborum voluptas dolores illo eos adipisci et molestiae.',
            price:price100
        });
        await c.save();
    }
}

seedDB().then(()=>{
    mongoose.connection.close();
});
