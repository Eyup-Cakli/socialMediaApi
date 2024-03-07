const jwt = require("jsonwebtoken");
const fs = require("fs");
const userModel = require("../models/userModel.js");

const privateKey = fs.readFileSync('./certs/private.pem');

//handle errors
const handleErrors= (err) => {
    console.log(err.message, err.code);
    let errors = {email: '', password: '', userName: ''};

    //incorrect password
    if (err.message === 'incorrect password') {
        errors.password = 'That password is incorrect.';
        return errors;
    }

    //duplicate error code => email and username
    if (err.code === 11000) {
        if (err.keyPattern && err.keyPattern.email) {
            errors.email = 'That email is already registered.';
        }
        if (err.keyPattern && err.keyPattern.userName) {
            errors.userName = 'That user name already registered.';
        }
        return errors;
    }

    //validation errors
    if (err.message.includes('user validation failed.')) {
        Object.values(err.errors).forEach(({properties}) => {
            errors[properties.path] = properties.message;
        });
    }
    return errors;
}

//generete token
const maxAge= 3 * 24 * 60 * 60;
const createToken = (id) => {
    return jwt.sign({ id }, privateKey, {
        expiresIn: maxAge, algorithm: 'RS256'
    });
}

//register operation
const signup_post = async (req, res) => {
    const {email, password, userName} = req.body;

    try {
        const user = await userModel.create({ email, password, userName })
        const token = createToken(user._id);
        res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge *1000});
        res.status(200).json({userId: user._id, userName: user.userName});
    } catch (err) {
        const errors = handleErrors("signup error. ", err);
        res.status(400).json({errors});
    }
}

//login operation
const login_post = async (req, res) => {
    const {email, password} = req.body;
    try {
        const user = await userModel.login(email,password);
        const token = createToken(user._id);
        res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge * 1000});
        res.status(200).json({ user: user._id, token: token });
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
}

// logout operation & end session
const logout_get =(req, res) => {
    res.cookie('jwt', '', {maxAge: 1});
    res.status(200).json("exited.");
}

module.exports = {signup_post, login_post, logout_get}