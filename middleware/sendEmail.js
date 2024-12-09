const sgMail = require("@sendgrid/mail");
const Contact = require('../model/Contact');
const companyController = require('../controllers/companyController');
const branchController = require('../controllers/branchController');
const userController = require('../controllers/usersController');

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

    const users = await userController.getAllEmailUsers();
    //console.log(users);
    const emails = users.map(user => user.username)

    const fromEmail = process.env.EMAIL_FROM;

    const msg = {
        to: emails, // Change to your recipient
        from: fromEmail,
        templateId: 'd-7be70042e8774b83acfe70fcd559fd23',
        dynamicTemplateData: {
            email_subject: msgSubject,
            username: req.user,
            customer_name: companyName,
            branch_name: branchName,
            contact_name: contact_name,
            call_flag: req.body.call_flag,
            call_type: req.body.call_type,
            call_notes: msgNotes,
            webapp_url: webAppURL
        },
        hideWarnings: true
    };




    sgMail
        .send(msg)
        .then(() => {
            console.log('Email sent')
        })
        .catch((error) => {
            console.error(error)
        })


}

const sendPwResetEmail = (tempPw, username) => {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    const fromEmail = process.env.EMAIL_FROM;
    var webAppURL = process.env.WEB_APP_URL;
    const pw_reset_link  = `${webAppURL}/pwreset/?user=${username}/pw=${tempPw}` ;
    const msgSubject = "Password Reset Request";

    const msg = {
        to: username, 
        from: fromEmail,
        templateId: 'd-aadc5ca0791d4a4db6c24028369d5261',
        dynamicTemplateData: {
            email: msgSubject,
            username: username,
            pw_reset_link: pw_reset_link,
            webapp_url: webAppURL
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

const sendMonthlyEmail = (req, res, next) => {
    logEvents(`${req.method}\t${req.headers.origin}\t${req.url}`, 'reqLog.txt');
    console.log(`method=${req.method} path=${req.path} remote_ip=${req.ip}`);
    next();
}

module.exports = { sendCallEntryEmail, sendMonthlyEmail, sendPwResetEmail };