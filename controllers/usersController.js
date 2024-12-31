const User = require('../model/User');
const bcrypt = require('bcrypt');
const sendEmail = require('../middleware/sendEmail');
const logger = require('../middleware/logger');

function stripPWFromUsers(users) {
    for (const thisUser of users) {
        stripPWFromUser(thisUser);
    }
}

function stripPWFromUser(thisUser) {

    thisUser.password = "";
    thisUser.refreshToken = [];
    thisUser.pw_reset_timeout = "";
    thisUser.temp_password = "";

}

const getAllUsers = async (req, res) => {
    try {
        logger.trace("getAllUsers");
        const users = await User.find().sort({ username: 1 });
        if (!users) return res.status(204).json({ 'message': 'No users found' });

        stripPWFromUsers(users);
        //console.log(users);
        res.json(users);
    } catch (err) {
        logger.error(err, "getAllUsers");
    }

}

const getUserList = async (req, res) => {
    try {
        logger.trace("getUserList");
        const users = await User.find({ active: true });
        if (!users) return res.status(204).json({ 'message': 'No users found' });

        for (const thisUser of users) {
            thisUser.roles = [];
            thisUser.password = null;
            thisUser.temp_password = null;
            thisUser.refreshToken = [];
            thisUser.active = null;
            thisUser.admin = null;
            thisUser.receive_emails = null;
            thisUser.pw_reset_timeout = null;
        }

        res.json(users);
    } catch (err) {
        logger.error(err, "getUserList");
    }

}


//receive_emails

// const deleteUser = async (req, res) => {
//     if (!req?.body?.id) return res.status(400).json({ "message": 'User ID required' });
//     const user = await User.findOne({ _id: req.body.id }).exec();
//     if (!user) {
//         return res.status(204).json({ 'message': `User ID ${req.body.id} not found` });
//     }
//     const result = await user.deleteOne({ _id: req.body.id });
//     res.json(result);
// }

const getUser = async (req, res) => {
    try {
        logger.trace("getUser");
        if (!req?.params?.id) return res.status(400).json({ "message": 'User ID required' });
        const user = await User.findOne({ _id: req.params.id }).exec();
        stripPWFromUser(user);
        if (!user) {
            return res.status(204).json({ 'message': `User ID ${req.params.id} not found` });
        }
        res.json(user);
    } catch (err) {
        logger.error(err, "getUser");
        return res.status(400).json({ 'message': 'huh?' });
    }

}

const getMyUser = async (req, res) => {

    try {
        logger.trace("getMyUser");
        const thisUser = await User.findOne({ username: req.user }).lean().exec();
        // const myUserId = thisUser._id;

        if (!thisUser) {
            return res.status(204).json({ 'message': `User ID not found` });
        }
        stripPWFromUser(thisUser);

        // res.end(JSON.stringify(thisUser));
        res.json(thisUser);
    } catch (err) {
        logger.error(err, "getMyUser");
        return res.status(400).json({ 'message': 'huh?' });
    }

}

//TOTEST:
const updateUser = async (req, res) => {
    //console.log(req.body);
    try {
        logger.trace("updateUser");
        if (!req?.body?.id) {
            return res.status(400).json({ 'message': 'ID parameter is required.' });
        }
        const user = await User.findOne({ _id: req.body.id }).exec();
        if (!user) {
            return res.status(204).json({ "message": `No user matches ID ${req.body.id}.` });
        }
        // id: thisID,
        // admin: isAdmin,
        // getEmail: getEmail,
        // active: isActive

        if (req.body.admin) {
            user.roles.Admin = 5150;
        } else {
            user.roles.Admin = 0;
        }

        user.receive_emails = req.body.getEmail;
        user.active = req.body.active;

        const result = await user.save();
        stripPWFromUser(result);
        //res.json(result);
        res.status(200).json({ 'success': `User Updated` });
    } catch (err) {
        logger.error(err, "updateUser");
        return res.status(400).json({ 'message': 'huh?' });
    }
}

function generatePass() {
    let pwLength = 40;
    let pass = '';
    let str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
        'abcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 1; i <= pwLength; i++) {
        let char = Math.floor(Math.random()
            * str.length + 1);

        pass += str.charAt(char)
    }

    return pass;
}

const createNewUser = async (req, res) => {
    try {
        logger.trace("createNewUser");

        var { username } = req.body;
        if (!username) return res.status(400).json({ 'message': 'Username required.' });
        username = username.toLowerCase();
        // check for duplicate usernames in the db
        const duplicate = await User.findOne({ username: username }).exec();
        if (duplicate) return res.sendStatus(409); //Conflict 

        const isAdmin = req?.body?.admin ? req.body.admin : false;
        const getEmail = req?.body?.getEmail ? req.body.getEmail : false;

        const now = new Date();
        const futureDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const tempPw = generatePass();
        const hashedTempPw = await bcrypt.hash(tempPw, 10);
        const pw = generatePass();
        const hashedPwd = await bcrypt.hash(pw, 10);

        const newUser = new User();
        newUser.username = username;
        newUser.password = hashedPwd;
        newUser.temp_password = hashedTempPw;
        newUser.pw_reset_timeout = futureDate;
        newUser.receive_emails = getEmail;

        if (isAdmin) {
            //console.log("IS ADMIN");
            // newUser.roles.User = 2001;
            // newUser.roles.Admin = 5150
            newUser.set('roles.Admin', 5150);
            newUser.set('roles.user', 2001);
        }

        const result = newUser.save();
        logger.info(`New User Created: ${username}`);

        const duration_text = "1 day";
        sendEmail.sendNewUserEmail(tempPw, username, duration_text);
        logger.info(`New User Email Sent for ${username}`);

        res.status(201).json({ 'success': `New user ${username} created!` });
    } catch (err) {
        logger.error(err, "createNewUser");
        res.status(500).json({ 'message': err.message });
    }
}

module.exports = {
    getAllUsers,
    getUserList,
    getUser,
    getMyUser,
    updateUser,
    createNewUser
}