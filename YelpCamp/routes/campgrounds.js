const express = require('express');
const catchAsync = require('../helpers/CatchAsyncError');
const router = express.Router();
const {isLoggedIn , isAuthor, validateCampground} = require('../middleware')
const campgrounds = require('../controllers/campgrounds');

router.route('/')
    .get(catchAsync(campgrounds.index))
    // .post(isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));
    .post((req, resp) => {resp.send(req.body);});
    



router.get('/new', isLoggedIn, campgrounds.showNewCampgroundForm);
router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, catchAsync(campgrounds.deleteCampground));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.showEditCampgroundForm));
module.exports = router;
