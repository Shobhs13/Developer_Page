const mongoose = require("mongoose");
const config = require("config");
const { connect } = require("mongoose");
const db = config.get("mongoURI");

const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });

    console.log("Mongo DB connected...");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
    mongoose.connect(db);
  }
};

module.exports = connectDB;
