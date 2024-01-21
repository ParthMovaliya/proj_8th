const ErrorHandler = require("../utils/errorHandler");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const catchAsyncError = require("./catchAsyncError");

exports.isAuthenticatedUser = catchAsyncError(async (req, res, next) => {
    const { tetapose_token } = req.cookies;
    if (!tetapose_token) {
        return next(new ErrorHandler("Please Login to access this resource", 401));
    }

    const decodedData = jwt.verify(tetapose_token, process.env.JWT_SECRET);
    req.user = await User.findById(decodedData.id);

    next();
});

exports.authorizeRoles = (roles) => {
    // console.log(req.user.roles)
    // console.log(roles)
    // return (req, res, next) => {
    //     if (!roles.includes(req.user.roles)) {
    //         return next(new ErrorHandler(`Role: ${req.user.role} is not allowed to access the Resourse`, 403))
    //     }
    next();
    // }
}
