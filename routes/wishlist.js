const express = require("express");
const router = express.Router();

router.get("/:steamID", async function (req, res, next) {
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
      if (steamWishlistData.success === 2) {
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

module.exports = router;
