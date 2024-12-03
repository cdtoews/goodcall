require('dotenv').config();
const User = require('../model/User');

const handleLogout = async (req, res) => {
    // TODO: On client, also delete the accessToken

    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204); //No content
    const refreshToken = cookies.jwt;

    // Is refreshToken in db?
    const foundUser = await User.findOne({ refreshToken }).exec();
    const cookieSecurity = process.env.COOKIE_SECURE || true;
    if (!foundUser) {
        res.clearCookie('jwt', { httpOnly: true, secure: cookieSecurity, sameSite: 'None'});
        return res.sendStatus(204);
    }

    console.log("lc");
    // Delete refreshToken in db
    //foundUser.refreshToken = foundUser.refreshToken.filter(rt  => rt !== refreshToken);
    foundUser.refreshToken = [];
    const result = await foundUser.save();
    //console.log(result);



    res.clearCookie('jwt', { httpOnly: true, secure: cookieSecurity, sameSite: 'None'});
    res.sendStatus(204);
}

module.exports = { handleLogout }