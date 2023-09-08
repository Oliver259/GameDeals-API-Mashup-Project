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

console.log("Access Key ID: " + process.env.AWS_ACCESS_KEY_ID);
console.log("Secret Access Key: " + process.env.AWS_SECRET_ACCESS_KEY);
console.log("Session Token: " + process.env.AWS_SESSION_TOKEN);

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
  if (
    !process.env.AWS_ACCESS_KEY_ID ||
    !process.env.AWS_SECRET_ACCESS_KEY ||
    !process.env.AWS_SESSION_TOKEN
  ) {
    console.error(
      "AWS Access Key ID, Secret Access Key and Session Token are required."
    );
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

module.exports = router;
