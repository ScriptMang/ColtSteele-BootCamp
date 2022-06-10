const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./helpers/ExpressError');
const methodOverride = require('method-override');

const passport = require('passport');
const LocalStrategy = require('passport-local')
const User = require('./models/user') 

const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');


mongoose.connect('mongodb://localhost:27017/yelpcamp');
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
})

const app = express();
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')));

const sessionConfig = {
    secret: 'thisissupersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + (1000*60*60*24*7),
        maxAge: (1000*60*60*24*7)
    }
};
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, resp, next) => {
    resp.locals.currentUser = req.user;
    resp.locals.success = req.flash('success');
    resp.locals.error = req.flash('error');
    next();
})

app.get('/fakeUser', async (req, resp) => {
    const user = new User({ email: 'janitor@gmail.com', username: 'jhonstone'})
    const newUser = await User.register(user, 'chicken');
    resp.send(newUser)
})

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

app.get('/', (req, resp) => {
    resp.render('home');
})

app.all('*',  (req, resp, next) =>{
   next(new ExpressError('Page Doesn\'t Exist', 404));
})

app.use((err, req, resp, next) => {
    const {status= 500} = err;
    if (!err.message) err.message = 'Ooff, something Went Wrong';
    resp.status(status).render('error', { err });
})

app.listen(3000, () => {
    console.log("LISTENING ON PORT 3000");
})