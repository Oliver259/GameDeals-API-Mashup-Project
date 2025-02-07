# GameDeals Mashup Project

## Overview

This project is a web application mashup that utilizes public data and service APIs to provide users with information about their Steam wishlist and game deals. The application is built using Node.js and Express, and it is deployed using Docker on an AWS EC2 instance.

## Features

- **Steam Wishlist**: Users can enter their Steam ID to view their wishlist.
- **Game Deals**: The application fetches game deals from the CheapShark API.
- **YouTube Reviews**: The application fetches YouTube reviews for the games using the YouTube Data API.
- **Page Visit Counter**: The application tracks the number of page visits using AWS S3 for persistence.

## System Requirements

- **Node.js**: The server is built using Node.js.
- **Docker**: The application is containerized using Docker.
- **AWS EC2**: The application is deployed on an AWS EC2 instance running Ubuntu 22.04 or later.
- **AWS S3**: Used for storing the page visit counter.

## APIs Used

- **Steam API**: Fetches the user's wishlist.
- **CheapShark API**: Fetches game deals.
- **YouTube Data API**: Fetches YouTube reviews for the games.

## Installation

1. **Clone the repository**:
   ```sh
   git clone https://github.com/yourusername/mashup-project.git
   cd mashup-project
   ```

2. **Install dependencies:**
    ```sh
    npm install
    ```
3. **Setup environment variables:** Create a `.env` file in the root directory and add your API keys:
    ```
    AWS_ACCESS_KEY_ID=your_aws_access_key_id
    AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
    AWS_SESSION_TOKEN=your_aws_session_token
    Youtube_API_KEY=your_youtube_api_key
    ```
4. **Run the application:**
    ```sh
    npm start
    ```
5. **Build and run the Docker container**
    ```sh
    docker build -t mashup-project .
    docker run -p 3000:3000 mashup-project
    ```

## Usage
1. **Access the application:** Open your browser and go to `http://localhost:3000`
2. **Enter your Steam ID:** Enter your Steam ID to view your wishlist and game deals.

## Note
**This project no longer works as intended because Steam has changed their API, which now goes to the Steam home page instead of displaying wishlist data in json format.** As a result, the application is unable to fetch the user's wishlist from Steam.

## Deployment
The application is deployed on an AWS EC2 instance using Docker. Follow these steps to deploy the application:

1. **Create an EC2 instance:**
    - Launch an EC2 instance running Ubuntu 22.04 or later.
    - Configure security groups to allow inbound traffic on port 3000.
2. **Install Docker on the EC2 instance:**
    ```sh
    sudo apt update
    sudo apt install docker.io
    sudo systemctl start docker
    sudo systemctl enable docker
    ```
3. **Pull the Docker image and run the container:**
    ```sh
    docker pull yourdockerhubusername/mashup-project
    docker run -p 3000:3000 yourdockerhubusername/mashup-project
    ```

## Acknowledgements
- [Steam](https://store.steampowered.com/)
- [CheapShark](https://www.cheapshark.com/)
- [YouTube Data API](https://developers.google.com/youtube/v3)
- [AWS S3](https://aws.amazon.com/s3/)