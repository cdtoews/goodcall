require('dotenv').config();
const User = require('../model/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const handleLogin = async (req, res) => {
    try {
        const cookies = req.cookies;
        const { user, pwd } = req.body;
        if (!user || !pwd) return res.status(400).json({ 'message': 'Username and password are required.' });

        const foundUser = await User.findOne({ username: user }).exec();
        if (!foundUser) return res.sendStatus(401); //Unauthorized 
        if (!foundUser.active) {
            return res.status(400).json({ 'message': 'Inactive User' });
        }

        // evaluate password 
        const match = await bcrypt.compare(pwd, foundUser.password);
        if (match) {
            const roles = Object.values(foundUser.roles).filter(Boolean);
            // create JWTs
            const accessToken = jwt.sign(
                {
                    "UserInfo": {
                        "username": foundUser.username,
                        "roles": roles
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '1h' }
            );
            const newRefreshToken = jwt.sign(
                { "username": foundUser.username },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: '1d' }
            );

            const newRefreshTokenArray =
                !cookies?.jwt
                    ? foundUser.refreshToken
                    : foundUser.refreshToken.filter(rt => rt !== cookies.jwt);

            const cookieSecurity = process.env.COOKIE_SECURE || true;
            //console.log(cookieSecurity);
            if (cookies?.jwt) res.clearCookie('jwt', { httpOnly: true, secure: cookieSecurity, sameSite: 'None' });


            // Saving refreshToken with current user
            foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
            const result = await foundUser.save();
            // console.log(result);
            // console.log(roles);

            // Creates Secure Cookie with refresh token
            res.cookie('jwt', newRefreshToken, { httpOnly: true, secure: cookieSecurity, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 });

            // Send authorization roles and access token to user
            res.json({ roles, accessToken });

        } else {
            res.sendStatus(401);
        }
    } catch (err) {
        console.error(err);
        res.sendStatus(401);
    }
}

module.exports = { handleLogin };