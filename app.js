const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { connectMongoDB } = require("./config/connectMongoDB.js")
const authRoutes = require("./routes/authRoutes.js");
const { checkUser } = require("./middleware/authMiddleWare.js");

const app = express();
const port = 3000;

// middleware
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());

// database connection
connectMongoDB();

// routes
app.get('*', checkUser);
app.use(authRoutes);

app.listen(port, () => {
    console.log(`Listening on port ${3000}`);
});
