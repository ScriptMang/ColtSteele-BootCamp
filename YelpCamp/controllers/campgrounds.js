
const Campground = require('../models/campground');
const mbxGeoCoding = require('@mapbox/mapbox-sdk/services/geocoding')
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeoCoding({accessToken: mapBoxToken});

const {cloudinary} = require("../cloudinary")

module.exports.index = async(req, resp) => {
    const campgrounds = await Campground.find({});
    resp.render('campgrounds/index', {campgrounds});
}

module.exports.createCampground = async(req, resp, next) => {
    const geoData = await geocoder.forwardGeocode ({
        query: req.body.campground.location,
        limit: 1
    }).send();

    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({url: f.path, filename: f.filename}));
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Successfully Made a Campground');
    resp.redirect(`/campgrounds/${campground._id}`);
}

module.exports.showNewCampgroundForm = (req, resp) => {
    resp.render('campgrounds/new');
}
module.exports.showCampground = async(req, resp) => {
    const campground = await Campground.findById(req.params.id).populate(
       { path: 'reviews',
         populate: {
             path: 'author'
         },
    }).populate('author'); 
    console.log(campground);
    if (!campground) {
        req.flash('error', 'Can\'t find that campground!');
        return resp.redirect('/campgrounds');
    }
    resp.render('campgrounds/show', { campground });
}

module.exports.showEditCampgroundForm = async(req, resp) => {
    const campground = await Campground.findById(req.params.id); 
    if (!campground) {
        req.flash('error', 'Can\'t find that campground!');
        return resp.redirect('/campgrounds');
    }
    resp.render('campgrounds/edit', {campground});
};

module.exports.updateCampground = async(req, resp)=> {
    const { id } = req.params;
    console.log(req.body)
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename}));
    campground.images.push(...imgs);
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename)
        }
        await campground.updateOne({$pull: {images: {filename:{ $in: req.body.deleteImages}}}});
    }
    req.flash('success', 'Successfully Updated a Campground');
    resp.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req, resp) => {
    const { id } = req.params;
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission')
        return resp.redirect(`/campgrounds/${id}`);
    }
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully Deleted a Campground');
    resp.redirect('/campgrounds')
}