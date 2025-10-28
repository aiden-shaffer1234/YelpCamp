const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const PORT = 5500;
const CampGround = require('./models/campground');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError')
const Joi = require('joi');

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

function validateCampground(req, res, next) {
    if (req.method === 'get' || req.method === 'delete'){
        return next();
    }

    const campgroundSchema = Joi.object({
        campground: Joi.object({
            title: Joi.string().required(),
            location: Joi.string().required(),
            price: Joi.number().min(0).required(),
            description: Joi.string().required(),
        }).required()
    });

    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const message = error.details.map(detail => detail.message);
        throw new ExpressError(message, 404);
    }else {
        next();
    }
}

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await CampGround.find({})
    res.render('campgrounds/index', { campgrounds } )
}));

app.get('/campgrounds/new', catchAsync(async (req, res) => {
    res.render('campgrounds/new')
}));

app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const id = req.params.id;
    const campground = await CampGround.findById(id)
    res.render('campgrounds/show', { campground } )
}));

app.post('/campgrounds', validateCampground, catchAsync(async (req, res) => {
    const newCampground = new CampGround(  req.body.campground );
    await newCampground.save();
    res.redirect(`/campgrounds/${newCampground._id}`);
}));

app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await CampGround.findByIdAndUpdate(id, {...req.body.campground});
    res.redirect(`/campgrounds/${campground._id}`);
}));

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await CampGround.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
}));

app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await CampGround.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));

app.all(/(.*)/, (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})

app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if (!err.message) err.message = 'Oh no, something went wrong!'
    res.status(statusCode).render('error', { err });
})
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});