const app = require("./app")
const dotenv = require("dotenv");
const { connectToDb } = require("./config/db");

dotenv.config();

connectToDb();

const server = app.listen(process.env.PORT, () => {
    // console.log(`server run at port ${process.env.PORT}`);
});

process.on("unhandledRejection", (err) => {
    // console.log(`error ${err.message}`);
    console.log("ShutDown the server Due to Unhandeled Promise Rejection");
    server.close(() => {
        process.exit(1);
    })
})