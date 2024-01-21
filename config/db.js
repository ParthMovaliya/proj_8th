const mongoose = require("mongoose")

exports.connectToDb = () => {
    mongoose.connect(process.env.DB_URI).then((data) => {
        // console.log(`DB connect with ${mongoose.connection.host}`);
    })
}