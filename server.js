require("dotenv").config({ path: "./.env" });
require("./config/database");
const chalk = require("chalk");
const server = require("./app");
const cloudinary = require("cloudinary");
const MESSAGES = require("./constants/messages");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const PORT = process.env.PORT || 3000;

if (!process.env.AI_GRADING_SERVICE_URL) {
  throw new Error(MESSAGES.AI_GRADING_SERVICE_URL_NOT_PROVIDED);
}

server.listen(PORT, () => {
  console.log(chalk.bgGreenBright(`Server running on ${PORT}`));
});
