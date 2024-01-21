const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const AllApps = require("../models/allAppsModel");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        require: [true, "Please enter your name"],
        maxLength: [30, "Your name cannot exceed 30 character"],
        minLength: [4, "Your name should have more than 4 character"],
    },
    email: {
        type: String,
        require: [true, "Please enter your Email"],
        unique: true,
        validate: [validator.isEmail, "Please enter a valid email"]
    },
    password: {
        type: String,
        required: [true, "Please Enter Your Password"],
        minLength: [8, "Password should be grater than 8 character"],
        select: false
    },
    role: {
        type: String,
        default: "employee"
    },
    appIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AllApps', // Reference the correct model name
        default: []
    }],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
});

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
});


userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

userSchema.methods.getJWTToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

userSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString("hex");
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    return resetToken;
};

const Users = mongoose.models.Users || mongoose.model("Users", userSchema);
module.exports = Users;