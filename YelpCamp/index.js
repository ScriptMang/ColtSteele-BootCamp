if(process.envNode !== "production") {
    require('dotenv').config();
}

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
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize');
const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const MongoStore = require("connect-mongo");
const dbUrl = process.env.DB_URL ||'mongodb://localhost:27017/yelpcamp';
mongoose.connect(dbUrl);
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
app.use(mongoSanitize({
    replaceWith: '_'
}
));
const secretKy = process.env.SECRET || 'thisissupersecret';
const store =  MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: secretKy
    }
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
    store,
    name: "session",
    secret: secretKy,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + (1000*60*60*24*7),
        maxAge: (1000*60*60*24*7)
    }
};
app.use(session(sessionConfig));
app.use(flash());
const scriptUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
];
const connectUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontUrls = [];
app.use(helmet({
    contentSecurityPolicy: ({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob",
               " data:",
               "https://res.cloudinary.com/dwcswvhik/",
               "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontUrls]
        }
    }),
    crossOriginEmbedderPolicy: false
}));


app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, resp, next) => {
    console.log(req.query);
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

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`LISTENING ON PORT ${port}`);
})