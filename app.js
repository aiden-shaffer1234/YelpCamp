const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const PORT = 5500;
const CampGround = require('./models/campground');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');

app.engine('ejs', ejsMate);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    autoIndex: true,
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(methodOverride('_method'));

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected');
});


app.get('/', (req, res) => {
    res.render('home');
});

app.get('/campgrounds', async (req, res) => {
    const campgrounds = await CampGround.find({})
    res.render('campgrounds/index', { campgrounds } )
})

app.get('/campgrounds/new', async (req, res) => {
    res.render('campgrounds/new')
});

app.get('/campgrounds/:id', async (req, res) => {
    const id = req.params.id;
    const campground = await CampGround.findById(id)
    res.render('campgrounds/show', { campground } )
})

app.post('/campgrounds', async (req, res) => {
    const newCampground = new CampGround(  req.body.campground );
    await newCampground.save();
    res.redirect(`/campgrounds/${newCampground._id}`);
});

app.put('/campgrounds/:id', async (req, res) => {
    const { id } = req.params
    console.log(id);
    const campground = await CampGround.findByIdAndUpdate(id, {...req.body.campground});
    res.redirect(`/campgrounds/${campground._id}`);
});

app.get('/campgrounds/:id/edit', async (req, res) => {
    const campground = await CampGround.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
});

app.delete('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    await CampGround.findByIdAndDelete(id);
    res.redirect('/campgrounds');
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});