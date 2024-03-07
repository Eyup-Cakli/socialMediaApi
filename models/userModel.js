const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Please enter an email address."],
        unique: [true, "Email address already in use."],
        lowercase: [true],
        validate: {
            validator: function (value) {
                return validator.isEmail(value);
            },
            message: "Please enter a valid email address."
        }
    },
    password: {
        type: String,
        require: [true, "Please enter an password."],
        minlength: [6, "Minimum password length 6 characters."]
    },
    userName: {
        type: String,
        required: [true, "Please enter a username"],
        unique: [true, "User name already in use."]
    },
    profilePicture: {
        type: String,
        default: ""
    },
    followers: {
        type: Array,
        default: []
    },
    following: {
        type: Array,
        default: []
    },
    likedPosts: {
        type: Array,
        default: []
    },
    likedComments: {
        type: Array,
        default: []
    },
    comments: {
        type: Array,
        default: []
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    description: {
        type: String,
        maxLength: 250
    },
    city: {
        type: String,
        maxLength: 25
    },

},{timestamps: true});

// fire a function before doc savet to mongodb
userSchema.pre('save', async function (next){
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// static method  to login user
userSchema.statics.login = async function(email, password) {
    const user = await this.findOne({email});
    if (user) {
        const auth = await bcrypt.compare(password, user.password);
        if (auth) {
            return user
        }
        throw Error("İncorrect email or password.");
    }
    throw Error("İncorrect email or password.");
}

const userModel = mongoose.model("user", userSchema);
module.exports = userModel;