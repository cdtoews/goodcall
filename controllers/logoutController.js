require('dotenv').config();
const User = require('../model/User');
const logger = require('../middleware/logger');

const handleLogout = async (req, res) => {
    // TODO: On client, also delete the accessToken
    try {
        logger.trace("handleLogout");
        const cookies = req.cookies;
        if (!cookies?.jwt) return res.sendStatus(204); //No content
        const refreshToken = cookies.jwt;

        // Is refreshToken in db?
        const foundUser = await User.findOne({ refreshToken }).exec();
        const cookieSecurity = process.env.COOKIE_SECURE || true;
        if (!foundUser) {
            logger.warn(`handleLogout for unknown user req: ${req}`);
            res.clearCookie('jwt', { httpOnly: true, secure: cookieSecurity, sameSite: 'None' });
            return res.sendStatus(204);
        }

        //console.log("lc");
        // Delete refreshToken in db
        //foundUser.refreshToken = foundUser.refreshToken.filter(rt  => rt !== refreshToken);
        foundUser.refreshToken = [];
        const result = await foundUser.save();




        res.clearCookie('jwt', { httpOnly: true, secure: cookieSecurity, sameSite: 'None' });
        res.sendStatus(204);
    } catch (err) {
        logger.error(err, "handleLogout");
    }
}

module.exports = { handleLogout }