const express = require('express');
const catchAsync = require('../helpers/CatchAsyncError');
const router = express.Router();
const {isLoggedIn , isAuthor, validateCampground} = require('../middleware')
const campgrounds = require('../controllers/campgrounds');
const multer = require('multer');
const {storage} = require('../cloudinary')
const upload = multer({storage});

router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn,  upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground));
   
router.get('/new', isLoggedIn, campgrounds.showNewCampgroundForm);
router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, catchAsync(campgrounds.deleteCampground));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.showEditCampgroundForm));
module.exports = router;
