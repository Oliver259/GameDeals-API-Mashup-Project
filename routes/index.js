var express = require("express");
var router = express.Router();

// API_KEY = "EA1D9E34754E899A4983EC1A9F1C687E";
const STEAM_ID = "76561198277446098";
/* GET home page. */
router.get("/", function (req, res, next) {
  fetch(
    `https://store.steampowered.com/wishlist/profiles/${STEAM_ID}/wishlistdata/`
  )
    .then((wishlistResponse) => wishlistResponse.json())
    .then((wishlistData) => {
      const wishlistedGames = Object.values(wishlistData);
      res.render("index", {
        title: "Wishlist",
        games: wishlistedGames,
      });
    })

    .catch((error) => {
      console.error("Error fetching wishlist data:", error);
      res.render("error", {
        title: "Error",
        games: [],
        error: error, // Pass the error object to the view
      });
    });

});

module.exports = router;