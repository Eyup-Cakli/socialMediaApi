const Router = require("express");
const { login_post, signup_post, logout_get } = require("../controller/authController.js");

const router = Router();

router.post('/signup', signup_post);
router.post('/login', login_post);
router.get('/logout', logout_get);

module.exports = router;