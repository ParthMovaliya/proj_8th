const catchAsyncError = require("../middleware/catchAsyncError")
const User = require("../models/userModel");
const ErrorHandler = require("../utils/errorHandler");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const LoginHistory = require("../models/loginHistoryModel");
const crypto = require("crypto");
const AllApps = require("../models/allAppsModel");

//register user
exports.registerUser = catchAsyncError(async (req, res, next) => {
    const { name, email, password } = req.body;
    const user = await User.create({
        name,
        email,
        password,
    });
    sendToken(user, 201, res);
});

//login user
exports.loginUser = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;
    // console.log(req.cookie.token)
    if (!email || !password) {
        return next(new ErrorHandler("Please Provide Email and Password", 400));
    }
    const user = await User.findOne({ email }).select("+password");
    const { name, email: useremail, ...other } = user;
    if (!user) {
        return next(new ErrorHandler("User not found", 401));
    }
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
        return next(new ErrorHandler("Invalid Email and Password", 401));
    }
    await LoginHistory.create({
        name,
        email: useremail
    });
    await user.populate({ path: 'appIds' });
    sendToken(user, 200, res);
});

//logout user
exports.logoutUser = catchAsyncError(async (req, res, next) => {
    res.cookie("tetapose_token", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    });
    res.status(200).json({
        success: true,
        message: "Loged Out!",
    });
});

//get user details - Me
exports.getUserDetails = catchAsyncError(async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        await user.populate({ path: 'appIds' })
        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        // console.log(error)
    }
});

//forget password
exports.forgotPassword = catchAsyncError(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new ErrorHandler("User not Found", 404));
    }
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    // const resetPasswordURL = `${req.protocol}://${req.get("host")}http://localhost:4000/api/v1/password/reset/${resetToken}`;
    const resetPasswordURL = `${process.env.FRONTEND_URI}/password/reset/${resetToken}`;
    const message1 = `Your password reset token is:- \n\n ${resetPasswordURL} \n\n If ypu not Requested this email then Please ignore it`;
    try {
        await sendEmail({
            email: user.email,
            subject: `Clone Password Recovery`,
            message: message1,
        });
        res.status(200).json({
            success: true,
            Message: `email sent to ${user.email} successfully`,
        })
    } catch (err) {
        // console.log("error forgotPassword", err);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new ErrorHandler(err.message, 500));
    }
});

//reset password
exports.resetPassword = catchAsyncError(async (req, res, next) => {
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user || user.resetPasswordExpire < Date.now()) {
        return next(new ErrorHandler("Reset password token is invalid or has been expired", 404));
    } else if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password and confirm password dosen't match", 404));
    } else {
        user.password = req.body.password;
        try {
            await user.save();
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save()
        } catch (error) {
            res.status(400).json({
                message,
                success: false,
            })
        }
        sendToken(user, 200, res);
    }
});

//update App Status
exports.updateAppStatus = catchAsyncError(async (req, res, next) => {
    const { workLog, ...other } = req.body;

    try {
        await AllApps.findOneAndUpdate({ _id: req.body._id }, { $set: { workLog } }, { new: true });
        const user = await User.findOne({ _id: req.body.userId }).populate({ path: 'appIds' });
        // console.log(user);
        // await user.populate({ path: 'appIds' });
        res.status(200).json({
            user,
            message: "WorkLog Updated!"
        });
    } catch (error) {
        // console.log(error);
        res.status(400).json({
            message: "Error at updating Status"
        });
    }
});

//update App Status
exports.homeApps = catchAsyncError(async (req, res, next) => {
    try {
        const allApps = await AllApps.find({}, { icon: 1, headerImage: 1, appName: 1, version: 1, developer: 1, appStatus: 1, trash: 1 });
        res.status(200).json({
            allApps,
        });
    } catch (error) {
        // console.log(error);
        res.status(400).json({
            message: "Error at Getting Apps Details"
        });
    }
})