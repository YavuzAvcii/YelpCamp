const Campground = require("../models/campground");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapboxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapboxToken });
const { cloudinary } = require("../cloudinary/index");

module.exports.index = async (req, res, next) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new");
};

module.exports.createNewCampground = async (req, res, next) => {
  const match = await geocoder
    .forwardGeocode({
      query: req.body.campground.location,
      limit: 1,
    })
    .send();
  const campground = new Campground(req.body.campground);
  campground.images = req.files.map((f) => ({
    filename: f.filename,
    url: f.path,
  }));
  campground.author = req.user._id;
  campground.geometry = match.body.features[0].geometry;
  if (campground.images.length > 3) {
    req.flash("error", "You can not add more than 3 photos");
    res.redirect(`/campgrounds/new`);
  }
  await campground.save();
  req.flash("success", "Successfully made a new campground!");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("author");
  if (!campground) {
    req.flash("error", "Cannot find that Campground!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/show", { campground });
};

module.exports.renderEditForm = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground) {
    req.flash("error", "Cannot find that Campground!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/edit", { campground });
};

module.exports.updateCampground = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(
    id,
    req.body.campground
  );
  const images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  console.log(req.body);
  campground.images.push(...images);
  if (campground.images.length > 3) {
    req.flash("error", "You can not have more than 3 photos");
    res.redirect(`/campgrounds/${id}/edit`);
  }
  await campground.save();
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await campground.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
  }

  req.flash("success", "Successfuly edited a campground!");
  res.redirect(`/campgrounds/${id}`);
};

module.exports.deleteCampground = async (req, res, next) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted a campground!");
  res.redirect("/campgrounds");
};
