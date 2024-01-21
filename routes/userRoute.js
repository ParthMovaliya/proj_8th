const express = require("express");
const { registerUser, loginUser, getUserDetails, forgotPassword, resetPassword, logoutUser, updateAppStatus, homeApps } = require("../controllers/userController");
const router = express.Router();
const { isAuthenticatedUser } = require("../middleware/auth");

router.route("/register").post(registerUser)
router.route("/login").post(loginUser);
router.route("/logout").get(logoutUser);
router.route("/me").get(isAuthenticatedUser, getUserDetails);
// router.route("/me").get(getUserDetails);
router.route("/password/forgot").post(forgotPassword);
router.route("/password/reset/:token").put(resetPassword);
router.route("/updateAppStatus").put(updateAppStatus);
router.route("/homeApps").get(homeApps);

module.exports = router;