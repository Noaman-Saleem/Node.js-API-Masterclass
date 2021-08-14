const mongoose=require("mongoose");

const connectDB = async () => {
    const conn = await mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true});
    // mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true})
    // .then((conn)=>{
    //     console.log("MongoDB Connected: " + conn.connection.host);
    // })
    // .catch((err)=>{
    //     console.log(`Error: ${err.message}`);
    //     process.exit(1)
    // })
    console.log(("MongoDB Connected: " + conn.connection.host).cyan.underline.bold);
}

module.exports = connectDB;