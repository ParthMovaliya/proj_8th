const mongoose = require('mongoose');
const Users = require("../models/userModel");

// Define a Mongoose schema for your table
const allAppsSchema = new mongoose.Schema({
    icon: {
        type: String,
        default: "https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
    },
    headerImage: {
        type: String,
        default: "https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
    },
    appName: {
        type: String,
    },
    packageName: {
        type: String,
    },
    version: {
        type: String,
        default: '1'
    },
    employeeIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        default: []
    }],
    developer: {
        devId: {
            type: String,
            default: "Play Store"
        }
    },
    install: {
        type: String,
        default: '0'
    },
    maxInstall: {
        type: Number,
        default: 0
    },
    appAds: {
        type: mongoose.Schema.Types.Mixed,
    },
    appStatus: {
        type: String,
        enum: ["inDevelopment", "live", "updating", "notPublished"],
    },
    workLog: {
        type: String,
        enum: ["workDone", "workPending"],
        default: 'workPending'
    },
    dirPath: {
        type: String,
        default: "/"
    },
    appAdsStatus: {
        type: String,
        enum: ["on", "off"],
        default: 'off'
    },
    trash: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const AllApps = mongoose.models.allAppsSchema || mongoose.model("AllApps", allAppsSchema);
module.exports = AllApps