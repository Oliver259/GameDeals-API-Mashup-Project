var express = require("express");
var router = express.Router();

const { google } = require('googleapis'); 

const Youtube_API_KEY = 'AIzaSyA3WxDsVXc07K6DSkl0uqLRtxPYcLqBbrU';
// API_KEY = "EA1D9E34754E899A4983EC1A9F1C687E";
/* GET home page. */

// TODO: Add UI for game search and game deals so the user can see the response

router.get("/", async function (req, res, next) {
  try {
    const STEAM_ID = "76561198277446098";
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
    console.log(steamAppID);

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
      maxResults: 5,
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
