const jwt = require("jsonwebtoken");
const fs = require("fs");
const userModel = require("../models/userModel.js");

const publicKey = fs.readFileSync('./certs/public.pem');

const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt;

    // check json web token exists & is verified
    if (token) {
        jwt.verify(token, publicKey, (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                res.status(400).json("An error occurred while reading the token. Please refresh the page or log in again.");
            } else {
                console.log("Token", decodedToken);
                next();
            }
        });
    } else {
        console.log(err.message);
        res.status(400).json("Please log in before proceeding with this action.");
    }
}

// check current user
const checkUser = (req, res, next) => {
    const token = req.cookies.jwt;

    if (token) {
        jwt.verify(token, publicKey, async (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                res.locals.user = null;
                next();
            } else {
                console.log(decodedToken);
                let user = await userModel.findById(decodedToken.id);
                res.locals.user = user;
                next();
            }
        })
    } else {
        res.locals.user = null;
        next();
    }
}

module.exports = {requireAuth, checkUser};