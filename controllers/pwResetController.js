const User = require('../model/User');
const bcrypt = require('bcrypt');
const sendEmail = require('../middleware/sendEmail');

function generatePass() {
    let pwLength = 40;
    let pass = '';
    let str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
        'abcdefghijklmnopqrstuvwxyz0123456789@#$';

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
                console.log(`password reset requested for ${req.body.user}`);
                console.log(user);
                sendEmail.sendPwResetEmail(tempPw, req.body.user);
            } else {
                console.log(`BAD password reset requested for ${req.body.user}`);
            }


        }
    } catch (err) {
        console.error(err);
    } finally {
        return res.status(400).json({ "message": 'huh?' });
    }



}

const handlePwResetLink = async (req, res) => {
    try {
        if (!req?.params?.id){
            console.log('WEIRD pwResetLink came in with no ID');
        }else{
            console.log("hprl");
        }



    } catch (err) {
        console.error(err);
    } finally {
        return res.status(400).json({ "message": 'huh?' });
    }


}

module.exports = { handlePwResetRequest, handlePwResetLink };