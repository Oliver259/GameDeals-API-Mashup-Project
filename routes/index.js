var express = require("express");
var router = express.Router();
const { google } = require("googleapis");
const AWS = require("aws-sdk");
require("dotenv").config();

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken: process.env.AWS_SESSION_TOKEN,
  region: "ap-southeast-2",
});

// Create an S3 client
const s3 = new AWS.S3();

// Specify the bucket and object key
const bucketName = "cab432-n11243244-page-counter";
const objectKey = "counter.json";

// Define a function to create the S3 bucket if it doesn't exist
async function createS3Bucket() {
  try {
    await s3.createBucket({ Bucket: bucketName }).promise(); // Create the bucket
  } catch (err) {
    if (err.statusCode === 409) { // If Bucket already exists
    } else { // Error creating bucket
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
    } catch (err) {
    }
  } catch (err) {
  }
}

/* GET home page. */
router.get("/", async (req, res) => {

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
      title: "GameDeals",
      pageCount: parsedData.count,
    });
  } catch (err) { // Error fetching page counter
    // Render the home page without the coutner if an error occurs
    res.render("index", { title: "GameDeals" });
  }
});

router.post("/wishlist", function (req, res) {
  const steamID = req.body.steamID;
  res.redirect(`/wishlist/${steamID}`);
});

module.exports = router;
