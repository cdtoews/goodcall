require('dotenv').config();
const User = require('../model/User');
const jwt = require('jsonwebtoken');

const handleRefreshToken = async (req, res) => {
    try {
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
                    // console.log(result);
                }
            )
            return res.sendStatus(403); //Forbidden 
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
            }
        );
    } catch (err) {
        console.error(err);
    }
}

module.exports = { handleRefreshToken }