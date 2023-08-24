require("dotenv").config();
const mongoose = require("mongoose");
const mongoURI = process.env.DATABASE_CONNECTION_STRING;

mongoose
  .connect(mongoURI)
  .then(() => console.log("Connected to database successfully."))
  .catch((err) => console.error(err));
