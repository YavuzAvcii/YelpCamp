const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const reviews = require("../controllers/reviews");
const {
  validateReviews,
  isLoggedIn,
  isReviewAuthor,
} = require("../middlevare");
const Campground = require("../models/campground");
const Review = require("../models/review");

router.post("/", isLoggedIn, validateReviews, catchAsync(reviews.createReview));

router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  catchAsync(reviews.deleteReview)
);

module.exports = router;
