const mongoose = require("mongoose");

const loginHistorySchema = mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    loginAt: {
        type: Date,
        default: Date.now,
    }
});

const LoginHistory = mongoose.model.Ads || mongoose.model("LoginHistory", loginHistorySchema);
module.exports = LoginHistory;