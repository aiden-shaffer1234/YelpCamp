const mongoose = require('mongoose');
const PORT = 5500;
const CampGround = require('../models/campground');
const cities = require('./cities');
const {places, descriptors} = require('./seedHelper')
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    autoIndex: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected');
});

const selectRandom = (array) => array[Math.floor(Math.random() * array.length)]

const seedDB = async () => {
    await CampGround.deleteMany({});

    for (let i = 0; i < 50; i++){
        const camp = new CampGround({
            location : `${selectRandom(cities).city}, ${selectRandom(cities).state}`,
            title: `${selectRandom(descriptors)}, ${selectRandom(places)}`,
            image: `https://picsum.photos/400?random=${Math.random()}`,
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
            price: Math.floor(Math.random() * 20) + 10
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close()
});