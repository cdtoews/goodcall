const User = require('../model/User');
const bcrypt = require('bcrypt');
const sendEmail = require('../middleware/sendEmail');
const { now } = require('mongoose');

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

const handlePwResetRequest = async (req, res) => {
    try {
        //does user exist    
        if (!req?.body?.user) {
            console.log(`password reset requested for NOBODY`)
        } else {
            const hoursLimit = 1;
            const user = await User.findOne({ username: req.body.user }).exec();
            if (user) {
                const now = new Date();
                const futureDate = new Date(now.getTime() + 60 * 60 * 1000);
                const tempPw = generatePass();
                const hashedPwd = await bcrypt.hash(tempPw, 10);
                console.log(`tempPw: ${tempPw}`);
                user.temp_password = hashedPwd;
                user.pw_reset_timeout = futureDate;
                const result = await user.save();
                //user.save;
                //console.log(`password reset requested for ${req.body.user}`);
                //console.log(user);
                sendEmail.sendPwResetEmail(tempPw, req.body.user);
                return res.status(200).json({ "message": 'SUCCESS' });
            } else {
                console.log(`BAD password reset requested for ${req.body.user}`);
            }


        }
    } catch (err) {
        console.error(err);
        return res.status(400).json({ "message": 'huh?' });
    } 


}

const handlePwResetLink = async (req, res) => {
    try {
        console.log(req.body);
        if (!req?.body?.username) {
            console.log('WEIRD pwResetLink came in with no ID');
            return res.status(400).json({ "message": 'no username' });
        }

        //USER
        const username = req.body.username;
        const newPwd = req.body.pwd;
        const tempPw = req.body.tempPw;
        //console.log(req.body);
        const user = await User.findOne({ username: username }).exec();
        if (!user) {
            console.log(`BAD password reset requested for ${req.body.user}`);
            return res.status(400).json({ "message": 'huh?' });
        }

        //CHECK DATE
        const resetDate = new Date(user.pw_reset_timeout);
        if (!resetDate) {
            console.log(`Expired password reset requested for ${req.body.user}`);
            return res.status(409).json({ "message": 'Expired Reset Request' });
        }

        
        const dateNow = Date.now();
        //console.log(`resetDate: ${resetDate}, nowDate: ${dateNow.toString()}`);
        if (dateNow > resetDate) {
            //console.log("is after");
            console.log(`OLD password reset requested for ${req.body.user}`);
            return res.status(409).json({ "message": 'Old Reset Request' });
        } 

        //CHECK TEMP PW
        const match = await bcrypt.compare(tempPw, user.temp_password);
        if(!match){
            console.log(`Password Request with bad tempPW for: ${req.body.user}`);
            return res.status(400).json({ "message": 'huh?' });
        }

        //now we can set new PW
        const hashedPwd = await bcrypt.hash(newPwd,10);
        user.password = hashedPwd;
        const result = await user.save();
        return res.status(200).json({ "message": 'SUCCESS' });






    } catch (err) {
        console.error(err);
        return res.status(400).json({ "message": 'finally huh?' });
    }


}

module.exports = { handlePwResetRequest, handlePwResetLink };