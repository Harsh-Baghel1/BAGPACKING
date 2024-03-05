const Listing = require("../models/listing.js");
const Review = require("../models/review.js");


module.exports.createReview = async (req, res) => {
    console.log(req.params.id);
    let listing = await Listing.findById(req.params.id);
    let newReview = new(req.body.review);
    newReview.author = req.user._id;
    
    listing.reviews.push(newReview);
  
    await newReview.save();
    await listing.save();
    req.flash("success","new Review Created!");
    res.redirect(`/listings/${listing_id}`);
  };

  module.exports.destroyReview = async(req, res) => {
    let{ id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","Review Deleted!");
    res.redirect(`/listing/${id}`);
  };