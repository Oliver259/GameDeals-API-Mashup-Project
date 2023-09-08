var express = require("express");
var router = express.Router();
const { google } = require("googleapis");
const AWS = require("aws-sdk");
require("dotenv").config();

const Youtube_API_KEY = process.env.Youtube_API_KEY;

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken: process.env.AWS_SESSION_TOKEN,
  region: "ap-southeast-2",
});

console.log("Access Key ID: " + process.env.AWS_ACCESS_KEY_ID);
console.log("Secret Access Key: " + process.env.AWS_SECRET_ACCESS_KEY);
console.log("Session Token: " + process.env.AWS_SESSION_TOKEN)
// Create an S3 client
const s3 = new AWS.S3();

// Specify the bucket and object key
const bucketName = "cab432-n11243244-page-counter";
const objectKey = "counter.json";

// Define a function to create the S3 buckert if it doesn't exist
async function createS3Bucket() {
  try {
    await s3.createBucket({ Bucket: bucketName }).promise();
    console.log(`Created bucket: ${bucketName}`);
  } catch (err) {
    if (err.statusCode === 409) {
      console.log(`Bucket already exists: ${bucketName}`);
    } else {
      console.log(`Error creating bucket: ${err}`);
    }
  }
}

// Define a function to increment the page counter
async function incrementPageCounter() {
  try {
    // Retrieve the current counter from S3
    const params = {
      Bucket: bucketName,
      Key: objectKey,
    };

    const data = await s3.getObject(params).promise();
    const parsedData = JSON.parse(data.Body.toString("utf-8"));

    // Increment the counter by 1
    parsedData.count++;

    // Upload the updated counter back to S3
    const updateParams = {
      Bucket: bucketName,
      Key: objectKey,
      Body: JSON.stringify(parsedData), // Convert JSON to string
      ContentType: "application/json", // Set content type
    };

    try {
      await s3.putObject(updateParams).promise();
      console.log("JSON file uploaded successfully.");
    } catch (err) {
      console.error("Error uploading JSON file:", err);
    }
  } catch (err) {
    console.error("Error incrementing page counter:", err);
  }
}

/* GET home page. */
router.get("/", async (req, res) => {
  // Check for AWS configuration
  // Check for AWS configuration
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.error("AWS Access Key ID and Secret Access Key are required.");
    return res.render("index", { title: "Steam ID Input" }); // Render the home page without the counter
  }

  await createS3Bucket();
  await incrementPageCounter();

  const params = {
    Bucket: bucketName,
    Key: objectKey,
  };

  try {
    const data = await s3.getObject(params).promise();
    const parsedData = JSON.parse(data.Body.toString("utf-8"));

    // Render the home page with the counter
    res.render("index", {
      title: "Steam ID Input",
      pageCount: parsedData.count,
    });
  } catch (err) {
    console.error("Error fetching page counter;", err);
    // Render the home page without the coutner if an error occurs
    res.render("index", { title: "Steam ID Input" });
  }
});

router.post("/wishlist", function (req, res) {
  const steamID = req.body.steamID;
  res.redirect(`/wishlist/${steamID}`);
});

router.get("/wishlist/:steamID", async function (req, res, next) {
  try {
    const STEAM_ID = req.params.steamID;
    const totalPages = 10;
    const wishlistedGames = [];

    for (let page = 0; page < totalPages; page++) {
      const steamWishlistResponse = await fetch(
        `https://store.steampowered.com/wishlist/profiles/${STEAM_ID}/wishlistdata/?p=${page}`
      );

      const steamWishlistData = await steamWishlistResponse.json();

      // Check if the Steam ID was not found
      if (steamWishlistData.success !== 1) {
        throw new Error("Steam ID is not found");
      }

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
