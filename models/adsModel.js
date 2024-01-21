const mongoose = require("mongoose");
const { Schema } = mongoose;

const adsSchema = mongoose.Schema({
    adsName: {
        type: String,
    },
    adsDataType: {
        type: String,
        enum: ['string', 'int', 'boolean'],
    },
    adsValue: {
        type: Schema.Types.Mixed,
    }
});

adsSchema.path('adsValue').set(function (newValue) {
    const adsDataType = this.adsDataType;

    switch (adsDataType) {
        case 'string':
            return String(newValue);
        case 'int':
            return Number(newValue);
        case 'boolean':
            return Number(newValue);
        // return Boolean(newValue);
        default:
            return newValue;
    }
});

const Ads = mongoose.model.Ads || mongoose.model("Ads", adsSchema);
module.exports = Ads;