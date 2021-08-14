const NodeGeocoder = require("node-geocoder");

//trying myself
const dotenv = require("dotenv");
//Load env vars
dotenv.config({ path: "./config/config.env" });
//------------------Great this worked for seeder.js file functionality

const options = {
  provider: process.env.GEOCODER_PROVIDER,
  httpAdapter: "https",
  apiKey: process.env.GEOCODER_API_KEY, // for Mapquest, OpenCage, Google Premier
  formatter: null, // 'gpx', 'string', ...
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder;
