require('dotenv').config();
const sgMail = require("@sendgrid/mail");
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
        console.log(err);
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
        console.log(err);
    }

}

const sendCallEntryEmail = async (req) => {

    // using Twilio SendGrid's v3 Node.js Library
    // https://github.com/sendgrid/sendgrid-nodejs

    sgMail.setApiKey(process.env.SENDGRID_API_KEY)

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
        "To": "chris.admin@goodingd.com, chris@yourtechguys.info"


    }, function (error, success) {
        if (error) {
            console.log("ERROR");
            console.log(error);
        } else {
            console.log("Email sent successfully");
            // console.log(success);
        }
    });


    // const msg = {
    //     to: emails, // Change to your recipient
    //     from: fromEmail,
    //     templateId: 'd-bea76cea2738493eacadd23f97a1c82c',
    //     dynamicTemplateData: {
    //         email_subject: msgSubject,
    //         username: req.user,
    //         customer_name: companyName,
    //         branch_name: branchName,
    //         contact_name: contact_name,
    //         call_flag: req.body.call_flag,
    //         call_type: req.body.call_type,
    //         call_notes: msgNotes,
    //         webapp_url: webAppURL
    //     },
    //     hideWarnings: true
    // };




    // sgMail
    //     .send(msg)
    //     .then(() => {
    //         console.log('Email sent')
    //     })
    //     .catch((error) => {
    //         console.error(error)
    //     })


}

const testFunc = () => {
    console.log("inside testfunc");
}

const sendPwResetEmail = (tempPw, username, duration_text) => {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    const fromEmail = process.env.EMAIL_FROM;
    var webAppURL = process.env.WEB_APP_URL;
    const pw_reset_link = `${webAppURL}/pwreset/?user=${username}&pw=${tempPw}`;
    const msgSubject = "Password Reset Request";

    const msg = {
        to: username,
        from: fromEmail,
        templateId: 'd-e48ee1b55a624347881e954658e5f22b',
        dynamicTemplateData: {
            email: msgSubject,
            username: username,
            pw_reset_link: pw_reset_link,
            webapp_url: webAppURL,
            duration: duration_text
        },
        hideWarnings: true
    };

    sgMail
        .send(msg)
        .then(() => {
            console.log('PW Reset Email sent')
        })
        .catch((error) => {
            console.error(error)
        })
    //email , pw_reset_link 

}

const sendNewUserEmail = (tempPw, username, duration_text) => {
    console.log("inside SNUE");
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    const fromEmail = process.env.EMAIL_FROM;
    var webAppURL = process.env.WEB_APP_URL;
    const pw_reset_link = `${webAppURL}/pwreset/?user=${username}&pw=${tempPw}`;
    const msgSubject = "You have been added to Call Reports";

    const msg = {
        to: username,
        from: fromEmail,
        templateId: 'd-06bccbd95b3a4991b1035b9e93527e8b',
        dynamicTemplateData: {
            username: username,
            pw_reset_link: pw_reset_link,
            webapp_url: webAppURL,
            duration: duration_text
        }
        ,
        hideWarnings: true
    };

    sgMail
        .send(msg)
        .then(() => {
            console.log('New User Email sent')
        })
        .catch((error) => {
            console.error(error)
        })
    //email , pw_reset_link 

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