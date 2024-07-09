const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");

const Listing = require("../models/listing");
const {isLoggedIn,isOwner,validateListing} = require("../middleware");

const listingController = require("../controller/listing");
const multer  = require('multer');

const {storage} = require("../cloudConfig.js");

const upload = multer({storage});

// create new route

router.get("/new",isLoggedIn, listingController.renderNewForm);

router.route("/")
 .get(wrapAsync(listingController.index))
 .post(
  isLoggedIn,
  
  upload.single('listing[image]'),
  validateListing ,
  wrapAsync(listingController.createListing)
);
 




router.route("/:id")
  .get(wrapAsync(listingController.showlisting))
  .put(isLoggedIn,
    isOwner,
    upload.single('listing[image]'),
    validateListing , 
    wrapAsync(listingController.updateListing
    
    ))
  .delete(isLoggedIn ,isOwner, wrapAsync(listingController.destroyListing)
);





// edit route
router.get("/:id/edit",isLoggedIn ,isOwner,wrapAsync(listingController.renderEditForm));

module.exports = router;

