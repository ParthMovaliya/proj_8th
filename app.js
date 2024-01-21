const express = require("express");
const cookieParser = require("cookie-parser");
var cors = require('cors')
const bodyParser = require("body-parser");
const user = require("./routes/userRoute")
const admin = require("./routes/adminRoute")
const errorMiddleware = require("./middleware/error");
const path = require("path");

const app = express();

app.use(express.static(path.join(__dirname, "./client/build")));

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: "*" }));

app.use(bodyParser.urlencoded({ defer: true, extended: true }));

app.use("/api/v1", user);
app.use("/api/v1", admin);

app.use('*', function (req, res) {
    res.sendFile(path.join(__dirname, "./client/build/index.html"));
});

app.use(errorMiddleware);

module.exports = app;