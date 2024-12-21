require('dotenv').config();
const Contact = require('../model/Contact');
const companyController = require('../controllers/companyController');
const branchController = require('../controllers/branchController');
const User = require('../model/User');

const postmark = require("postmark");
const client = new postmark.ServerClient(process.env.POSTMARK_API_KEY);

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

const getAllEmailUsers = async (req, res) => {
    try {
        const users = await User.find({ receive_emails: true });
        if (!users) return [];
        stripPWFromUsers(users);
        return users;
    } catch (err) {
        console.error(err);
        return [];
    }

}

function getContact(contact_id) {
    try {

        const contact = Contact.findOne({ _id: contact_id }).lean().exec();
        if (!contact) {
            console.log("no contact found for contact._id: " + contact_id);
            return null;
        }
        return contact;
    } catch (err) {
        console.error(err);
    }

}

//#region New Call
const sendCallEntryEmail = async (req) => {


    var msgSubject = "New Call Report Entered by " + req.user;

    var msgNotes = req.body.notes.split('\n').join('<br>');

    var webAppURL = process.env.WEB_APP_URL;

    var contact = await getContact(req.body.contact_id);

    var contact_name = contact.firstname + " " + contact.lastname;
    var branch = await branchController.getBranchObject(contact.branch_id);
    var branchName = branch.label;

    var companyName = await companyController.getCompanyName(branch.company_id);

    const emailUsers = await getAllEmailUsers();
    //console.log(users);
    const emails = emailUsers.map(user => user.username)
    const emailList = emails.join(", ");
    const fromEmail = process.env.EMAIL_FROM;


    client.sendEmailWithTemplate({
        "TemplateModel": {
            "customer_name": companyName,
            "username": req.user,
            "customer_name": companyName,
            "branch_name": branchName,
            "email_subject": msgSubject,
            "contact_name": contact_name,
            "call_flag": req.body.call_flag,
            "call_type": req.body.call_type,
            "call_notes": msgNotes,
            "webapp_url": webAppURL

        },
        "TemplateId": 38383380,
        "From": fromEmail,
        "To": emailList


    }, function (error, success) {
        if (error) {
            console.log("ERROR on New Call Email");
            console.log(error);
        } else {
            console.log("New Call Email sent successfully");
            // console.log(success);
        }
    });


}

const testFunc = () => {
    console.log("inside testfunc");
}


//#region PW Reset
const sendPwResetEmail = (tempPw, username, duration_text) => {
    const fromEmail = process.env.EMAIL_FROM;
    var webAppURL = process.env.WEB_APP_URL;
    const pw_reset_link = `${webAppURL}/pwreset/?user=${username}&pw=${tempPw}`;
    const msgSubject = "Password Reset Request";


    client.sendEmailWithTemplate({
        "TemplateModel": {
            "username": username,
            "pw_reset_link": pw_reset_link,
           "email_subject": msgSubject,
            "email": msgSubject,
            "duration": duration_text,
            "webapp_url": webAppURL

        },
        "TemplateId": 38396447,
        "From": fromEmail,
        "To": username


    }, function (error, success) {
        if (error) {
            console.log("ERROR on PW Reset email");
            console.log(error);
        } else {
            console.log("PW Reset Email sent successfully");
            // console.log(success);
        }
    });

}

//#region New User
const sendNewUserEmail = (tempPw, username, duration_text) => {
    //console.log("inside SNUE");
   const fromEmail = process.env.EMAIL_FROM;
    var webAppURL = process.env.WEB_APP_URL;
    const pw_reset_link = `${webAppURL}/pwreset/?user=${username}&pw=${tempPw}`;
    

    client.sendEmailWithTemplate({
        "TemplateModel": {
            "username": username,
            "pw_reset_link": pw_reset_link,
            "duration": duration_text,
            "webapp_url": webAppURL

        },
        "TemplateId": 38396651,
        "From": fromEmail,
        "To": username


    }, function (error, success) {
        if (error) {
            console.log("ERROR on New User Reset email");
            console.log(error);
        } else {
            console.log("New User Email sent successfully");
            // console.log(success);
        }
    });


}

const sendMonthlyEmail = (req, res, next) => {
    logEvents(`${req.method}\t${req.headers.origin}\t${req.url}`, 'reqLog.txt');
    console.log(`method=${req.method} path=${req.path} remote_ip=${req.ip}`);
    next();
}

module.exports = {
    sendCallEntryEmail,
    sendMonthlyEmail,
    sendPwResetEmail,
    sendNewUserEmail,
    testFunc
};