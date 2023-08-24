require("./database/connection");
const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");

const port = 80 || process.env.PORT;

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/note", require("./routes/note"));

app.listen(port, () => {
  console.log("Server is listening on port:", port);
});
