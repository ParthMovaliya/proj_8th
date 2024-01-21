const express = require("express");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const { addNewAds, getAllAds, updateOneAd, deleteOneAd, registerUserByAdmin, getAllUsers, updateOneUser, deleteOneUser, checkPackage, addNewApp, getAllApps, updateAppAds, updateOneApp, getAllFolder, deleteOneFolder, deleteOneApp, deleteTrashApp, getLoginHistory, deleteLoginHistory, refreshApp } = require("../controllers/adminController");
const router = express.Router();

//users section
router.route("/allUsers").get(isAuthenticatedUser, getAllUsers);
router.route("/users/updateUser").put(isAuthenticatedUser, updateOneUser);
router.route("/register-by-admin").post(isAuthenticatedUser, registerUserByAdmin);
router.route("/user/deleteUser/:id").delete(isAuthenticatedUser, deleteOneUser);

//ads section
router.route("/ad/new-ad").post(isAuthenticatedUser, addNewAds);
router.route("/all-ad").get(isAuthenticatedUser, getAllAds);
router.route("/ad/updateAd").put(isAuthenticatedUser, updateOneAd);
router.route("/ad/deleteAd/:id").delete(isAuthenticatedUser, deleteOneAd);

//app section
router.route("/checkPackage/:packageName").get(isAuthenticatedUser, checkPackage);
router.route("/addNewApp").post(isAuthenticatedUser, addNewApp);
router.route("/allApps").get(isAuthenticatedUser, getAllApps);
router.route("/refreshApp").put(isAuthenticatedUser, refreshApp);
router.route("/updateAppAds").put(isAuthenticatedUser, updateAppAds);
router.route("/app/updateApp").put(isAuthenticatedUser, updateOneApp);
router.route("/app/deleteApp/:id").delete(isAuthenticatedUser, deleteOneApp);
router.route("/app/trashDeleteApp/:id").delete(isAuthenticatedUser, deleteTrashApp);

//folder section
router.route("/allFolder").get(isAuthenticatedUser, getAllFolder);
router.route("/deleteFolder").post(isAuthenticatedUser, deleteOneFolder);

//login section
router.route("/getLoginHistory").get(isAuthenticatedUser, getLoginHistory);
router.route("/deleteLoginHistory").delete(isAuthenticatedUser, deleteLoginHistory);

// //users section
// router.route("/allUsers").get(getAllUsers);
// router.route("/users/updateUser").put(updateOneUser);
// router.route("/register-by-admin").post(registerUserByAdmin);
// router.route("/user/deleteUser/:id").delete(deleteOneUser);

// //ads section
// router.route("/ad/new-ad").post(addNewAds);
// router.route("/all-ad").get(getAllAds);
// router.route("/ad/updateAd").put(updateOneAd);
// router.route("/ad/deleteAd/:id").delete(deleteOneAd);

// //app section
// router.route("/checkPackage/:packageName").get(checkPackage);
// router.route("/addNewApp").post(addNewApp);
// router.route("/allApps").get(getAllApps);
// router.route("/refreshApp").put(refreshApp);
// router.route("/updateAppAds").put(updateAppAds);
// router.route("/app/updateApp").put(updateOneApp);
// router.route("/app/deleteApp/:id").delete(deleteOneApp);
// router.route("/app/trashDeleteApp/:id").delete(deleteTrashApp);

// //folder section
// router.route("/allFolder").get(getAllFolder);
// router.route("/deleteFolder").post(deleteOneFolder);

// //login section
// router.route("/getLoginHistory").get(getLoginHistory);
// router.route("/deleteLoginHistory").delete(deleteLoginHistory);

module.exports = router;