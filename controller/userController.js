const jwt = require("jsonwebtoken");
const fs = require("fs");
const userModel = require("../models/userModel.js");
const publicKey = fs.readFileSync("./certs/public.pem");

// update user
const updateUser_post = async (req, res) => {
    try {
        const token = req.cookies.jwt;

        if (token) {
            jwt.verify(token, publicKey, async (err, decodedToken) => {
                if (err) {
                    console.log(err.message);
                    res.locals.user = null;
                    res.status(401).json({error: "Your transaction could not be completed. Please log in first."});
                } else {
                    console.log("Token : ", decodedToken);

                    const {email, password} = req.body;
                    const userId = decodedToken.id;

                    const user = await userModel.findById(userId);

                    if (!user) {
                        return res.status(404).json({error: "User not found."});
                    }

                    if(email) {
                        user.email = email;
                    }
                    
                    if (password) {
                        user.password = password;
                    }

                    await user.save();
                    res.locals.user = user();
                    res.status(200).json({user: user.email});
                }
            })
        } else {
            res.locals.user = null;
            res.status(401).json({error: "Unauthorized transaction."});
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: "An error occurred while updating the user." })
    }
}

// delete user
const deleteUser_delete = async (req, res) => {
    try {
        const token = req.cookies.jwt;
        const userId = decodedToken.id;

        if (token) {
            jwt.verify(token, publicKey, async (err, decodedToken) => {
                if (err) {
                    console.log(err.message);
                    res.locals.user = null;
                    res.status(401).json({error: "Your transaction could not be completed. Please log in first."});
                } else {
                    console.log(decodedToken);
                    let user = await userModel.findByIdAndDelete(userId);
                    res.locals.user = user;
                    res.status(200).json({success: "user deleted successfully."});
                }
            })
        } else {
            res.locals.user = null;
            res.status(401).json({error: "Unauthorized transaction."});
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: "An error occured while deleting user." });
    }
}

// get a user
const getUser_get = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await userModel.findById(userId);
        const { password, updatedAt, _id, isAdmin, __v, ...other } = user._doc;
        res.status(200).json(other);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: "An error occured while getting user." });
    }
}

// follow a user
const followAUser_put = async (req, res) => {
    try {
        const token = jwt.cookies.jwt;
        if (!token) {
            res.locals.user = null;
            return res.status(401).json({ error: "Unauthorized transaction. Please login first." });
        }

        const decodedToken = jwt.verify(token, publicKey);
        const userIdInToken = decodedToken.id;
        const userIdInParams = req.params.id;
        if (userIdInToken === userIdInParams) {
            return res.status(500).json({ error: "You can't follow yourself." })
        }

        const user = await userModel.findById(userIdInParams);
        const currentUser = await userModel.findById(userIdInToken);

        if (!user.followers.includes(userIdInToken)) {
            await Promise.all([
                user.updateOne({ $push: { followers: userIdInToken } }),
                currentUser.updateOne({ $push: { following: userIdInParams } }),
            ]);
            return res.status(200).json("User has been followed.");
        } else {
            return res.status(403).json("You already follow this user.");
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: "An error occured while following user." });
    }
}

// unfollow a user
const unfollowAUser_put = async (req, res) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            res.locals.user = null;
            return res.status(401).json({error: "Unauthorized transaction. Please login first." });
        }

        const decodedToken = jwt.verify(token, publicKey);
        const userIdInToken = decodedToken.id;
        const userIdInParams = req.params.id;
        if (decodedToken.id === req.params.id) {
            return res.status(500).json("You can't unfollow yourself.");
        }

        const user = await userModel.findById(userIdInParams);
        const currentUser = await userModel.findById(userIdInToken);

        if (user.followers.includes(userIdInToken)) {
            await Promise.all([
                user.updateOne({ $pull: { followers: userIdInToken } }),
                currentUser.updateOne({ $pull: { following: userIdInParams } }),
            ]);
            return res.status(200).json("User has been unfollowed.")
        } else {
            return res.status(403).json("You are already not following this user.");
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: "An error occured while unfollowing user." });
    }
}

const getProfilePictureByUser_get = async (req, res) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            res.locals.user = null;
            return res.status(401).json({ error: "Unauthorized transaction. Please login first." })
        }

        const userId = req.params.id;
        const user = await userModel.findById(userId);
        const profilePicturePath = user.profilePicture;
        res.status(200).sendFile(profilePicturePath);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: "An error occured while unfollowing user." });
    }
}

module.exports = {updateUser_post, deleteUser_delete, getUser_get, unfollowAUser_put, getProfilePictureByUser_get}