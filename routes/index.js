var express = require("express");
var router = express.Router();

const { google } = require('googleapis'); 

const Youtube_API_KEY = 'AIzaSyA3WxDsVXc07K6DSkl0uqLRtxPYcLqBbrU';
/* GET home page. */

router.get('/', (req, res) => {
  res.render('index', { title: 'Steam ID Input' });
});

router.post("/wishlist", function (req, res) {
  const steamID = req.body.steamID;
  res.redirect(`/wishlist/${steamID}`);
});

router.get("/wishlist/:steamID", async function (req, res, next) {
  try {
    const STEAM_ID = req.params.steamID
    const totalPages = 10;
    const wishlistedGames = [];

    for (let page = 0; page < totalPages; page++) {
      const steamWishlistResponse = await fetch(
        `https://store.steampowered.com/wishlist/profiles/${STEAM_ID}/wishlistdata/?p=${page}`
      );

      const steamWishlistData = await steamWishlistResponse.json();

      const gamesOnPage = Object.values(steamWishlistData);
      wishlistedGames.push(...gamesOnPage);
    }

    res.render("wishlist", {
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

router.get("/details/:gameTitle", async function (req, res, next) {
  try {
    const gameTitle = req.params.gameTitle;

    // Fetch game info from CheapShark API using the gameTitle
    const cheapSharkResponse = await fetch(
      `https://cheapshark.com/api/1.0/games?title=${encodeURIComponent(
        gameTitle
      )}`
    );
    const cheapSharkData = await cheapSharkResponse.json();

    // Extract gameId from CheapShark response
    const gameId = cheapSharkData[0].gameID; // Assume the first result is the most relevant one

    // Fetch game deals using gameId
    const gameDealsResponse = await fetch(
      `https://www.cheapshark.com/api/1.0/games?id=${gameId}`
    );
    const gameDealsData = await gameDealsResponse.json();

    // Extract steamAppID from gameDeals Data
    const steamAppID = gameDealsData.info.steamAppID;

    if (steamAppID === null) {
      throw new Error("Game is not available")
    }

    // Fetch game details from Steam's app details API using steamAppID
    const steamAppResponse = await fetch(
      `https://store.steampowered.com/api/appdetails/?appids=${steamAppID}`
    );
    const steamAppDetailsData = await steamAppResponse.json();

    // Initialize the Youtube API client
    const youtube = google.youtube({
      version: 'v3',
      auth: Youtube_API_KEY,
    });

    // Search for reviews of the selected game on Youtube based on the game title
    const youtubeSearchResponse = await youtube.search.list({
      q: `${gameTitle} review`,
      maxResults: 8,
      part: 'snippet'
    });

    const youtubeSearchResults = youtubeSearchResponse.data.items;

    res.render("details", {
      title: "Game Details",
      gameDeals: gameDealsData,
      steamAppDetails: steamAppDetailsData[steamAppID].data, // Extract data for the specific steamAppID
      youtubeReviews: youtubeSearchResults, // Pass the Youtube search results to the template
    });
  } catch (error) {
    console.error("Error fetching game details and deals:", error);
    res.render("error", {
      games: [],
      error: error,
    });
  }
});

module.exports = router;
