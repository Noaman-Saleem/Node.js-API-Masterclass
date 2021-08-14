const express = require("express");
const dotenv = require("dotenv");
const colors = require("colors");
const errorHandler = require("./middleware/error");

const app = express();
const PORT = process.env.PORT || 5000;

//Load ENV vars
dotenv.config({ path: "./config/config.env" });
//Load MongoDB Connection
const connectDB = require("./config/db");
//Route Files
const bootcamps = require("./routes/bootcamps");

//Connect to MongoDB
connectDB();

//Body Parser
app.use(express.json());

//Mount Routers
app.use("/api/v1/bootcamps", bootcamps);

//This middleware must have to be after Mount Router otherwise it will not work
app.use(errorHandler);

// app.use(express.urlencoded({ extended: true }))
// create application/json parser
// var jsonParser = bodyParser.json()

const server = app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  );
});

//handle unhandle promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red.bold);
  //Close server & exit process
  server.close(() => process.exit(1));
});
