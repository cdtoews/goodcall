require('dotenv').config();
const User = require('../model/User');
const jwt = require('jsonwebtoken');
const logger = require('../middleware/logger');

const handleRefreshToken = async (req, res) => {
    try {
        logger.trace("handleRefreshToken");
        const cookies = req.cookies;
        if (!cookies?.jwt) return res.sendStatus(401);
        const refreshToken = cookies.jwt;
        const cookieSecurity = process.env.COOKIE_SECURE || true;

        res.clearCookie('jwt', { httpOnly: true, secure: cookieSecurity, sameSite: 'None' });

        const foundUser = await User.findOne({ refreshToken }).exec();

        //Detected refresh token reuse
        if (!foundUser) {
            jwt.verify(
                refreshToken,
                process.env.REFRESH_TOKEN_SECRET,
                async (err, decoded) => {
                    if (err) return res.sendStatus(403);
                    const hackedUser = await User.findOne({ username: decoded.username }).exec();
                    hackedUser.refreshToken = [];
                    const result = await hackedUser.save();
                    logger.warn(`BAD REFRESH TOKEN, REQ: ${req}`);
                }
            )
            return res.sendStatus(403); //Forbidden 
        } else {
            logger.debug(`found user: ${foundUser.username}`)
        }

        const newRefreshTokenArray = foundUser.refreshToken.filter(rt => rt !== refreshToken);

        // evaluate jwt 
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            async (err, decoded) => {
                if (err) {
                    foundUser.refreshToken = [...newRefreshTokenArray];
                    const result = await foundUser.save();
                }
                if (err || foundUser.username !== decoded.username) return res.sendStatus(403);

                //refresh token still good
                const roles = Object.values(foundUser.roles);
                const accessToken = jwt.sign(
                    {
                        "UserInfo": {
                            "username": decoded.username,
                            "roles": roles
                        }
                    },
                    process.env.ACCESS_TOKEN_SECRET,
                    { expiresIn: '2h' }
                );

                const newRefreshToken = jwt.sign(
                    { "username": foundUser.username },
                    process.env.REFRESH_TOKEN_SECRET,
                    { expiresIn: '1d' }
                );
                // Saving refreshToken with current user
                foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
                const result = await foundUser.save();

                // Creates Secure Cookie with refresh token
                res.cookie('jwt', newRefreshToken, { httpOnly: true, secure: cookieSecurity, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 });


                res.json({ roles, accessToken })
                logger.debug(`refresh token successfully granted user: ${foundUser.username}`);
            }
        );
    } catch (err) {
        logger.error(err, "handleRefreshToken");
    }
}

module.exports = { handleRefreshToken }