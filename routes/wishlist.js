const express = require("express");
const router = express.Router();

router.get("/:steamID", async function (req, res, next) {
  try {
    const STEAM_ID = req.params.steamID; // Extract the steamID from the request parameters
    const wishlistedGames = [];

    // Fetch the wishlist items
    const wishlistResponse = await fetch(
      `https://api.steampowered.com/IWishlistService/GetWishlist/v1?steamid=${STEAM_ID}`
    );
    console.log(wishlistResponse)

    const wishlistData = await wishlistResponse.json();

    // Check if the Steam ID was not found
    if (!wishlistData.response || !wishlistData.response.items) {
      throw new Error("Steam ID is not found or wishlist is empty");
    }

    // Fetch details for each game in the wishlist
    for (const item of wishlistData.response.items) {
      const appid = item.appid;
      const gameDetailsResponse = await fetch(
        `https://store.steampowered.com/api/appdetails?appids=${appid}`
      );

      const gameDetailsData = await gameDetailsResponse.json();
      console.log(gameDetailsData)

      if (gameDetailsData[appid].success) {
        wishlistedGames.push(gameDetailsData[appid].data);
      }
    }

    // Render the wishlist template
    res.render("wishlist", {
      title: "Wishlist",
      games: wishlistedGames,
    });
  } catch (error) {
    // Render the error page
    res.render("error", {
      title: "Error",
      games: [],
      error: error,
    });
  }
});

module.exports = router;