const express = require("express");
const router = express.Router();
const { google } = require("googleapis"); // Ensure you have Google APIs properly configured

const Youtube_API_KEY = process.env.Youtube_API_KEY;

router.get("/:gameTitle", async function (req, res, next) {
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
      throw new Error("Game is not available");
    }

    // Fetch game details from Steam's app details API using steamAppID
    const steamAppResponse = await fetch(
      `https://store.steampowered.com/api/appdetails/?appids=${steamAppID}`
    );
    const steamAppDetailsData = await steamAppResponse.json();

    // Initialize the Youtube API client
    const youtube = google.youtube({
      version: "v3",
      auth: Youtube_API_KEY,
    });

    // Search for reviews of the selected game on Youtube based on the game title
    const youtubeSearchResponse = await youtube.search.list({
      q: `${gameTitle} review`,
      maxResults: 8,
      part: "snippet",
    });

    const youtubeSearchResults = youtubeSearchResponse.data.items;

    res.render("deals", {
      title: `${gameTitle} Deals`,
      gameDeals: gameDealsData,
      steamAppDetails: steamAppDetailsData[steamAppID].data, // Extract data for the specific steamAppID
      youtubeReviews: youtubeSearchResults, // Pass the Youtube search results to the template
    });
  } catch (error) {
    res.render("error", {
      games: [],
      error: error,
    });
  }
});

module.exports = router;
