const {campgroundSchema, reviewSchema} = require('./validationSchema.js');
const Campground = require('./models/campground');
const ExpressError = require('./helpers/ExpressError');
const Review = require('./models/review');

module.exports.isLoggedIn = (req, resp, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirect = req.originalUrl;
        req.flash('error', 'you must be signed in')
        return resp.redirect('/login');
    }
    next();
}
module.exports.validateCampground = (req, resp, next) => {
    const { error } = campgroundSchema.validate(req.body);
     if (error) {
         const msg = error.details.map(el => el.message).join(',')
         throw new ExpressError(msg, 400)
     } else { next(); }
 }
 module.exports.isAuthor = async (req, resp, next) => {
    const { id } =  req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission!');
        return resp.redirect(`/campgrounds/${id}`)
    }
    next(); 
 }
 module.exports.validateReview = (req, resp, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

module.exports.isReviewAuth = async(req, resp, next) => {
    const { id, reviewId } =  req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission!');
        return resp.redirect(`/campgrounds/${id}`)
    }
    next();

}
