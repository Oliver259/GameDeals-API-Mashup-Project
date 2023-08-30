var express = require("express");
var router = express.Router();

// API_KEY = "EA1D9E34754E899A4983EC1A9F1C687E";
const STEAM_ID = "76561198277446098";
/* GET home page. */

// router.get("/", function (req, res, next) {
//   fetch(
//     `https://store.steampowered.com/wishlist/profiles/${STEAM_ID}/wishlistdata/`
//   )
//     .then((wishlistResponse) => wishlistResponse.json())
//     .then((wishlistData) => {
//       const wishlistedGames = Object.values(wishlistData);
//       res.render("index", {
//         title: "Wishlist",
//         games: wishlistedGames,
//       });
//     })

//     .catch((error) => {
//       console.error("Error fetching wishlist data:", error);
//       res.render("error", {
//         title: "Error",
//         games: [],
//         error: error, // Pass the error object to the view
//       });
//     });

// });

// TODO: Add UI for game search and game deals so the user can see the response

router.get("/", async function (req, res, next) {
  try {
    const steamWishlistResponse = await fetch(
      `https://store.steampowered.com/wishlist/profiles/${STEAM_ID}/wishlistdata/`
    );
    const steamWishlistData = await steamWishlistResponse.json();

    const wishlistedGames = Object.values(steamWishlistData);

    res.render("index", {
      title: "Wishlist",
      games: wishlistedGames,
    });
  } catch (error) {
    console.error("Error fetching wishlist data:", error);
    res.render("error", {
      title: "Error",
      games: [],
      error: error,
    });
  }
});

router.get("/compare/:gameTitle", async function (req, res, next) {
  try {
    const gameTitle = req.params.gameTitle;
    const cheapSharkResponse = await fetch(`https://www.cheapshark.com/api/1.0/games?title=${encodeURIComponent(gameTitle)}`);
    const cheapSharkData = await cheapSharkResponse.json();

    res.json(cheapSharkData);
  } catch (error) {
    console.error('Error fetching game prices:', error);
    res.status(500).json({ error: 'An error occured while fetching game prices. '});
  }
});

router.get("/deals/:gameId", async function (req, res, next) {
  try {
    const gameID = req.params.gameId;

    // Fetch game deals from from CheapShark API using gameID
    const gameDealsResponse = await fetch(
      `https://www.cheapshark.com/api/1.0/games?id=${gameID}`
    );
    const gameDealsData = await gameDealsResponse.json();

    res.json(gameDealsData)
  } catch (error) {
    console.error("Error fetching game deals:", error);
    res.status(500).json({ error: 'An error occured while fetching game deals. '});
  }
});

module.exports = router;