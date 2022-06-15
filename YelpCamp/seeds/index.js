const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const {adjectives, places} = require('./seed-helper'); 

mongoose.connect('mongodb://localhost:27017/yelpcamp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
})

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async() => {
    await Campground.deleteMany({});
    for (let i=0; i < 50; i++) {
        const seed1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '62a01e22cadf878aa5ce2f99',
            location: `${cities[seed1000].city}, ${cities[seed1000].state}`,
            title: `${sample(adjectives)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet cosecteur adipsisij',
            price: price,
            images: [
                {
                  url: 'https://res.cloudinary.com/dwcswvhik/image/upload/v1654916173/YelpCamp/v4k4xmfw2qdpmjz0tnnb.avif',
                  filename: 'YelpCamp/v4k4xmfw2qdpmjz0tnnb'
                },
                {
                  url: 'https://res.cloudinary.com/dwcswvhik/image/upload/v1654916173/YelpCamp/t2exdwcjliqn2mxzn65u.avif',
                  filename: 'YelpCamp/t2exdwcjliqn2mxzn65u'
                }
              ],
              geometry: { 
                type: 'Point', 
                coordinates: [ -85.759407, 38.254238 ] 
              }
       })
     await camp.save()
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});