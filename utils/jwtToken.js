const sendToken = (user, statusCode, res) => {
    const token = user.getJWTToken();
    const options = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        // sameSite: 'None', // Set to 'None' for cross-origin requests
    };
    res.status(statusCode).cookie("tetapose_token", token, options).json({
        success: true,
        user,
        token
    });
};

module.exports = sendToken;