const sgMail = require("@sendgrid/mail");
const Contact = require('../model/Contact');
const companyController = require('../controllers/companyController');
const branchController = require('../controllers/branchController');

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

    //const sgMail = require('@sendgrid/mail')
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    // var msgBody =
    //     "Contact:   " + req.body.contact_id + "\n" +
    //     "Flag:      " + req.body.call_flag + "\n" +
    //     "Call Type: " + req.body.call_type + "\n" +
    //     "Notes:\n" + req.body.notes + "\n";


    var msgSubject = "New Call Report Entered by " + req.user;

    var msgNotes = req.body.notes.split('\n').join('<br>');

    var webAppURL = process.env.WEB_APP_URL;

    var contact = await getContact(req.body.contact_id);

    var contact_name = contact.firstname + " " + contact.lastname;
    var branch = await branchController.getBranchObject(contact.branch_id);
    var branchName = branch.label;

    var companyName = await companyController.getCompanyName(branch.company_id);

    //TODO: get all the data for this:
    const msg = {
        to: 'chris.admin@goodingd.com', // Change to your recipient
        from: 'chris.admin@goodingd.com', // Change to your verified sender
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


const sendMonthlyEmail = (req, res, next) => {
    logEvents(`${req.method}\t${req.headers.origin}\t${req.url}`, 'reqLog.txt');
    console.log(`method=${req.method} path=${req.path} remote_ip=${req.ip}`);
    next();
}

module.exports = { sendCallEntryEmail, sendMonthlyEmail };