const express = require("express");
const https = require("https");
const router = express.Router();

const items_per_page = 50;

/**
 * Function to fetch data with retries and exponential backoff
 * @param {string} url - The URL to fetch
 * @param {number} retries - Number of retry attempts (default is 3)
 * @param {number} backoff - Initial delay before retrying, increases exponentially (default is 300ms)
 * @returns {Promise} - A promise that resolves with the fetched data or rejects with an error
 */

function fetchWithRetry(url, retries = 3, backoff = 300) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";

        // Collect data chunks as they arrive
        res.on("data", (chunk) => {
          data += chunk;
        });

        // When all chunks are gathered process the complete response
        res.on("end", () => {
          if (res.statusCode === 429 && retries > 0) {
            // Too Many Requests, wait and retry
            setTimeout(() => {
              fetchWithRetry(url, retries - 1, backoff * 2)
                .then(resolve)
                .catch(reject);
            }, backoff);
          } else if (res.statusCode >= 200 && res.statusCode < 300) {
            // Success, resolve the promise with the parsed JSON data
            resolve(JSON.parse(data));
          } else {
            // Other status codes, reject the promise with an error
            reject(
              new Error(
                `Error fetching data: ${res.statusCode} ${res.statusMessage}`
              )
            );
          }
        });
      })
      .on("error", (err) => {
        if (retries > 0) {
          // Retry on error with exponential backoff
          setTimeout(() => {
            fetchWithRetry(url, retries - 1, backoff * 2)
              .then(resolve)
              .catch(reject);
          }, backoff);
        } else {
          // No retries left, reject the promise with the error
          reject(err);
        }
      });
  });
}

/**
 * Route handler for fetching and displaying the wishlist
 * @param {string} steamID - The Steam ID of the user
 * @param {number} page - The page number to display (optional, defaults to 1)
 */
router.get("/:steamID/:page?", async function (req, res, next) {
  try {
    const STEAM_ID = req.params.steamID; // Extract the steamID from the request parameters
    const page = parseInt(req.params.page) || 1; // Parse the page number, default to 1 if not provided
    const wishlistedGames = []; // Array to store the fetched game details

    // Fetch the wishlist items
    const wishlistData = await fetchWithRetry(
      `https://api.steampowered.com/IWishlistService/GetWishlist/v1?steamid=${STEAM_ID}`
    );

    // Check if the Steam ID was not found or the wishlist is empty
    if (!wishlistData.response || !wishlistData.response.items) {
      throw new Error("Steam ID is not found or wishlist is empty");
    }

    // Calculate the total number of pages
    const totalItems = wishlistData.response.items.length;
    const totalPages = Math.ceil(totalItems / items_per_page);

    // Check if the requested page number is valid
    if (page > totalPages) {
      throw new Error("Page not found");
    }

    // Calculate the start and end indices for the current page
    const startIndex = (page - 1) * items_per_page;
    const endIndex = startIndex + items_per_page;
    const itemsForPage = wishlistData.response.items.slice(
      startIndex,
      endIndex
    );

    // Fetch details for each game in the current page
    for (const item of itemsForPage) {
      const appid = item.appid;
      const gameDetailsData = await fetchWithRetry(
        `https://store.steampowered.com/api/appdetails?appids=${appid}`
      );

      // Check if the game details were successfully applied
      if (gameDetailsData[appid].success) {
        wishlistedGames.push(gameDetailsData[appid].data);
      }
    }

    // Render the wishlist template with the fetched data
    res.render("wishlist", {
      title: "Wishlist",
      games: wishlistedGames,
      currentPage: page,
      totalPages: totalPages,
      hasNextPage: endIndex < wishlistData.response.items.length,
      steamID: STEAM_ID,
    });
  } catch (error) {
    // Render the error page if an error occurs
    res.render("error", {
      title: "Error",
      games: [],
      error: error,
    });
  }
});

module.exports = router;
