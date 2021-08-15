const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const colors = require("colors");

//Load models
const Bootcamp = require("./models/Bootcamp");
const Course = require("./models/Course");

//Load env vars
dotenv.config({ path: "./config/config.env" });

//Connect to DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true})
// .then((conn)=>{
//     console.log("MongoDB Connected: " + conn.connection.host);
// })
// .catch((err)=>{
//     console.log(`Error: ${err.message}`);
//     process.exit(1)
// })
console.log("MongoDB Connected: ".cyan.underline.bold);

//Read JSON files
const bootcamps = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/bootcamps.json`, "utf-8")
);
const courses = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/courses.json`, "utf-8")
);

//Import into DB
const importData = async () => {
  try {
    console.log("Starting");
    await Bootcamp.create(bootcamps);
    // await Course.create(courses);
    console.log("Data imported ....".green.inverse);
    process.exit();
  } catch (error) {
    console.error(error);
  }
};

//Delete into DB
const deletetData = async () => {
  try {
    console.log("Starting Deleting");
    await Bootcamp.deleteMany();
    await Course.deleteMany();
    console.log("Data deleted ....".red.inverse);
    process.exit();
  } catch (error) {
    console.error(error);
  }
};

if (process.argv[2] === "-i") {
  importData();
} else if (process.argv[2] === "-d") {
  deletetData();
}
