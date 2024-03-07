const mongoose = require("mongoose");

const dbURI =
  "mongodb+srv://eyupcakli98:atlas123@socialmediaapi.lakexov.mongodb.net/?retryWrites=true&w=majority&appName=socialMediaApi";

module.exports.connectMongoDB = () => {
  mongoose
    .connect(dbURI)
    .then(() => console.log("Database connected."))
    .catch((err) => console.error("Database connection error: ", err));
};
