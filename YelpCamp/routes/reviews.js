const express = require('express');
const catchAsync = require('../helpers/CatchAsyncError');
const router = express.Router({mergeParams: true});
const {isLoggedIn, validateReview, isReviewAuth} = require('../middleware.js')
const reviews = require('../controllers/reviews');

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))
router.delete('/:reviewId', isLoggedIn, isReviewAuth, catchAsync(reviews.deleteReview))
module.exports = router;