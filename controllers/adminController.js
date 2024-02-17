const catchAsyncError = require("../middleware/catchAsyncError");
const Ads = require("../models/adsModel");
const User = require("../models/userModel");
const getLoginHistory = require("../models/loginHistoryModel");
const AllApps = require("../models/allAppsModel");
const Users = require("../models/userModel");
const ErrorHandler = require("../utils/errorHandler");
const axios = require("axios")
const fs = require("fs");
const path = require("path");

//========================Ads section===========================
//add ad
exports.addNewAds = catchAsyncError(async (req, res, next) => {
    const { adsDataType, adsName, adsValue } = req.body;
    const isPresent = await Ads.findOne({ adsName, adsDataType });
    if (isPresent) {
        return next(new ErrorHandler(`ad '${adsName}' is already present`, 404));
    }
    const ad = await Ads.create({
        adsName,
        adsDataType,
        adsValue,
    });
    res.status(200).json({
        success: true,
        message: `'${adsName}' added`,
        ad
    });
});

//get all ads
exports.getAllAds = catchAsyncError(async (req, res, next) => {
    const allAds = await Ads.find();
    res.status(200).json({
        success: true,
        message: '',
        ads: allAds
    });
});

//update ad
exports.updateOneAd = catchAsyncError(async (req, res, next) => {
    // console.log(req.body)
    const newAd = await Ads.findOneAndUpdate({ _id: req.body._id }, { $set: { adsName: req.body.adsName, adsValue: req.body.adsValue } }, { new: true });
    res.status(200).json({
        success: true,
        message: `'${req.body.adsName}' updated`,
        newAd
    });
});

//delete ad
exports.deleteOneAd = catchAsyncError(async (req, res, next) => {
    try {
        const result = await Ads.deleteOne({ _id: req.params.id });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Ad not found.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Ad deleted successfully.'
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while deleting the ad.'
        });
    }
});

//========================Users section===========================
//register user by admin
exports.registerUserByAdmin = catchAsyncError(async (req, res, next) => {
    const { email, name, password, role } = req.body;
    const user = await User.create({
        name,
        email,
        password,
        role
    });
    res.status(201).json({
        success: true,
        message: `'${name}' added as '${role}'!`,
        user
    });
    // sendToken(user, 201, res);
});

//get all users create by user
exports.getAllUsers = catchAsyncError(async (req, res, next) => {
    const allUsers = await User.find();
    // const allUsers = await User.find({ role: { $ne: 'admin' } });
    res.status(200).json({
        success: true,
        message: '',
        users: allUsers
    });
});

//update User
exports.updateOneUser = catchAsyncError(async (req, res, next) => {
    // console.log(req.body)
    const newUser = await User.findOneAndUpdate({ _id: req.body._id }, { $set: { name: req.body.name, role: req.body.role, email: req.body.email } }, { new: true });
    res.status(200).json({
        success: true,
        message: `'${req.body.name}' updated`,
        newUser
    });
});

//delete User
exports.deleteOneUser = catchAsyncError(async (req, res, next) => {
    try {
        const result = await User.deleteOne({ _id: req.params.id });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'User deleted successfully.'
        });
    } catch (err) {
        // console.error(err);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while deleting the User.'
        });
    }
});

//========================Apps section===========================
//checkPackage available
exports.checkPackage = catchAsyncError(async (req, res, next) => {
    // console.log(req.body)
    const isAvail = await AllApps.findOne({ packageName: req.params.packageName });
    if (isAvail) {
        res.status(200).json({
            success: false,
            message: `'${req.params.packageName}' is not available`,
            // newUser
        });
    } else {
        res.status(200).json({
            success: true,
            message: `'${req.params.packageName}' is available`,
            // newUser
        });
    }
});

//add new app
exports.addNewApp = catchAsyncError(async (req, res, next) => {
    const isAvail = await AllApps.findOne({ packageName: req.body.packageName });
    if (isAvail) {
        res.status(200).json({
            success: false,
            message: `'${req.body.packageName}' is not available`,
        });
    } else {
        try {
            try {
                const { data: playData, status: playStatus } = await axios.get(process.env.PLAYSTORE_API + req.body.packageName);
                const neededData = {
                    icon: playData.icon,
                    headerImage: playData.headerImage,
                    headerImage: playData.headerImage,
                    appName: playData.title,
                    packageName: req.body.packageName,
                    version: playData.androidVersion,
                    appAds: { appName: playData.title },
                    workLog: req.body.workLog,
                    appAdsStatus: req.body.appAdsStatus,
                    developer: {
                        devId: playData.developer.devId,
                    },
                    install: playData.installs,
                    maxInstall: playData.maxInstalls,
                    appStatus: req.body.appStatus
                }
                neededData.employeeIds = [req.body.userId];
                const newApp = await AllApps.create(neededData);
                const appId = newApp._id;
                const user = await User.findOne({ _id: req.body.userId });
                if (!user) {
                    return res.status(404).json({
                        success: false,
                        message: 'User not found.'
                    });
                }
                if (user.appIds.includes(appId)) {
                    return res.status(400).json({
                        success: false,
                        message: 'User already has this app.'
                    });
                }
                user.appIds.push(appId);
                await user.save();
                await newApp.populate({ path: 'employeeIds', select: 'name' });
                res.status(200).json({
                    success: true,
                    message: `'${req.body.packageName}' is available`,
                    newApp: newApp
                });
            } catch (err) {
                const neededData = {
                    appName: req.body.appName,
                    packageName: req.body.packageName,
                    workLog: req.body.workLog,
                    appAdsStatus: req.body.appAdsStatus,
                    appStatus: req.body.appStatus,
                }
                neededData.employeeIds = [req.body.userId];
                const newApp = await AllApps.create(neededData);
                const appId = newApp._id;
                const user = await User.findOne({ _id: req.body.userId });
                if (!user) {
                    return res.status(404).json({
                        success: false,
                        message: 'User not found.'
                    });
                }
                if (user.appIds.includes(appId)) {
                    return res.status(400).json({
                        success: false,
                        message: 'User already has this app.'
                    });
                }
                user.appIds.push(appId);
                await user.save();
                await newApp.populate({ path: 'employeeIds', select: 'name' });
                res.status(200).json({
                    success: true,
                    message: `'${req.body.packageName}' is available`,
                    newApp: newApp
                });
            }
        } catch (error) {
            console.error("Error while making the Play Store API request:", error);
            res.status(500).json({
                success: false,
                message: `Error while making the Play Store API request`
            });
        }
    }
});

//refresh app
exports.refreshApp = catchAsyncError(async (req, res, next) => {
    const oldApp = await AllApps.findOne({ packageName: req.body.pkgName });
    if (!oldApp) {
        res.status(200).json({
            success: false,
            message: `'${req.body.pkgName}' is not available`,
        });
    } else {
        try {
            try {
                const { data: playData, status: playStatus } = await axios.get(process.env.PLAYSTORE_API + req.body.pkgName);
                const neededData = {
                    icon: playData.icon,
                    headerImage: playData.headerImage,
                    headerImage: playData.headerImage,
                    appName: playData.title,
                    version: playData.androidVersion,
                    appAds: { appName: playData.title },
                    developer: {
                        devId: playData.developer.devId,
                    },
                    install: playData.installs,
                    maxInstall: playData.maxInstalls,
                }
                const newApp = await AllApps.findOneAndUpdate({ packageName: req.body.pkgName }, { $set: neededData }, { new: true });
                await newApp.populate({ path: 'employeeIds', select: 'name' });
                res.status(200).json({
                    success: true,
                    message: `'${req.body.pkgName}' is Updated!`,
                    newApp: newApp
                });
            } catch (err) {
                // console.log('-=-=-=-=-=-=', err)
                res.status(200).json({
                    success: true,
                    message: `'${req.body.pkgName}' is upto date`,
                });
            }
        } catch (error) {
            // console.error("Error while making the Play Store API request:", error);
            res.status(500).json({
                success: false,
                message: `Error while making the Play Store API request`
            });
        }
    }
});

//get all users create by admin
exports.getAllApps = catchAsyncError(async (req, res, next) => {
    const allApps = (await AllApps.find().populate({ path: 'employeeIds', select: 'name' })).reverse();
    // const allUsers = await User.find({ role: { $ne: 'admin' } });
    res.status(200).json({
        allApps: allApps
    });
});

//update App Ads
exports.updateAppAds = catchAsyncError(async (req, res, next) => {
    const { _id, packageName, dirPath, newValue } = req.body;
    // console.log(_id, packageName, dirPath)
    // console.log(newValue)
    const app = await AllApps.findOneAndUpdate({ _id: _id }, { $set: { appAds: newValue, dirPath } }, { new: true })
    // // const allUsers = await User.find({ role: { $ne: 'admin' } });

    //make folder here
    // const savePath = path.join(__dirname, '..', process.env.DIR_PATH, dirPath);
    // if (!fs.existsSync(savePath)) {
    //     fs.mkdirSync(savePath, { recursive: true });
    // }

    //-- let saveName = packageName.replace(/\./g, '_');
    // const filteredValue = Object.keys(newValue)
    //     .filter(key => newValue[key] !== null && newValue[key] !== "")
    //     .reduce((obj, key) => {
    //         obj[key] = newValue[key];
    //         return obj;
    //     }, {});
    //-- const data = JSON.stringify(newValue);
    //-- const filePath = path.join(savePath, `${saveName}.json`);
    //--* fs.writeFile(filePath, data, function (err) {
    //     if (err) {
    //         // console.log(err)
    //         res.status(500).json({
    //             message: `Error at making '${saveName}' folder!`,
    //         });
    //     } else {
    //         res.status(200).json({
    //             message: "All Ads saved!",
    //             newApp: app
    //         });
    //     }
    // *--});
});

//update One App
exports.updateOneApp = catchAsyncError(async (req, res, next) => {
    const { _id, appName, packageName, version, workLog, appAdsStatus, appStatus, userId, oldUserId } = req.body;
    try {
        // const app = await AllApps.findOneAndUpdate({ _id }, { $set: { appName, version, workLog, appAdsStatus, appStatus } }, { new: true }).populate({ path: 'employeeIds', select: 'name' });

        // Remove oldUserId from employeeIds
        await AllApps.updateOne(
            { _id },
            { $pull: { employeeIds: oldUserId } }
        );
        await Users.updateOne(
            { _id: oldUserId },
            { $pull: { appIds: _id } }
        );
        await Users.findOneAndUpdate(
            { _id: userId },
            { $addToSet: { appIds: _id } }
        )
        // Add userId to employeeIds
        const app = await AllApps.findOneAndUpdate(
            { _id },
            {
                $set: { appName, version, workLog, appAdsStatus, appStatus },
                $addToSet: { employeeIds: userId }
            },
            { new: true }
        ).populate({ path: 'employeeIds', select: 'name' });

        res.status(200).json({
            message: `'${appName}' Updated!`,
            newApp: app
        });
    } catch (error) {
        // console.log(error)
        res.status(500).json({
            message: `Error at update App!`,
        });
    }
});

//delete app
exports.deleteOneApp = catchAsyncError(async (req, res, next) => {
    try {
        const appIdToDelete = req.params.id;
        const deletedApp = await AllApps.findOneAndUpdate({ _id: req.params.id }, { $set: { trash: true } }, { new: true }).populate({ path: 'employeeIds', select: 'name' });
        if (!deletedApp) {
            return res.status(404).json({
                success: false,
                message: 'App not found.'
            });
        }
        const users = await User.find({ appIds: appIdToDelete });
        if (users.length > 0) {
            for (const user of users) {
                const indexToRemove = user.appIds.indexOf(appIdToDelete);
                if (indexToRemove !== -1) {
                    user.appIds.splice(indexToRemove, 1);
                    await user.save();
                }
            }
        }
        // const app = await AllApps.findOne({ _id: req.params.id });
        res.status(200).json({
            success: true,
            message: 'App deleted successfully.',
            app: deletedApp
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while deleting the ad.'
        });
    }
});

//delete trash app
exports.deleteTrashApp = catchAsyncError(async (req, res, next) => {
    try {
        const appIdToDelete = req.params.id;
        const deletedApp = await AllApps.findOneAndDelete({ _id: appIdToDelete });
        if (!deletedApp) {
            return res.status(404).json({
                success: false,
                message: 'App not found.'
            });
        }
        res.status(200).json({
            success: true,
            message: 'App deleted successfully.'
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while deleting the ad.'
        });
    }
});

//========================Folder section===========================
//get all folder path and name
exports.getAllFolder = catchAsyncError(async (req, res, next) => {
    try {
        const directoryPath = path.join(__dirname, '..', process.env.DIR_PATH);
        fs.readdir(directoryPath, (err, files) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal Server Error' });
                return;
            }
            function getRelativeFiles(dir) {
                const files = fs.readdirSync(dir);
                let relativeFiles = [];
                for (const file of files) {
                    const filePath = path.join(dir, file);
                    if (fs.statSync(filePath).isDirectory()) {
                        relativeFiles = relativeFiles.concat(getRelativeFiles(filePath));
                    } else {
                        const relativePath = path.relative(directoryPath, filePath);
                        relativeFiles.push({ path: relativePath, file });
                    }
                }
                return relativeFiles;
            }

            const allRelativeFiles = getRelativeFiles(directoryPath);
            res.status(200).json({
                files: allRelativeFiles
            });
        });
    } catch (error) {

    }
});

//delete one folder
exports.deleteOneFolder = catchAsyncError(async (req, res, next) => {
    const { path: reqPath, file } = req.body;
    try {
        const directoryPath = path.join(__dirname, '..', process.env.DIR_PATH);
        const filePath = path.join(directoryPath, reqPath);
        fs.unlink(filePath, (err) => {
            if (err) {
                res.status(500).json({ error: 'Error deleting file' });
                return;
            }
            res.status(201).json({
                message: `File '${file}' deleted successfully.`
            });
        });
    } catch (error) {
        // console.log(error)
    }
});

//========================Login section===========================
//get all folder path and name
exports.getLoginHistory = catchAsyncError(async (req, res, next) => {
    try {
        const history = await getLoginHistory.find().sort({ _id: -1 });
        res.status(200).json({
            history: history
        });
    } catch (error) {
        res.status(500).json({
            message: "Error at get loginHistory"
        });
    }
});

exports.deleteLoginHistory = catchAsyncError(async (req, res, next) => {
    try {
        const history = await getLoginHistory.deleteMany();
        res.status(200).json({
            message: "All history removed!"
        });
    } catch (error) {
        res.status(500).json({
            message: "Error at delete loginHistory"
        });
    }
});