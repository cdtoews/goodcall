const sgMail = require("@sendgrid/mail");


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

    var msgNotes = "<br>" + req.body.notes.split('\n').join('<br>');
    

//TODO: get all the data for this:
    const msg = {
        to: 'chris.admin@goodingd.com', // Change to your recipient
        from: 'chris.admin@goodingd.com', // Change to your verified sender
        // subject: msgSubject,
        // text: msgBody,
        // html: '<strong>and weird to do anywhere, even with Node.js</strong>',
            templateId: 'd-7be70042e8774b83acfe70fcd559fd23',
            dynamicTemplateData: {
                email_subject: msgSubject,
                unique_name: req.user,
                first_name: req.body.contact_id,
                address_line_1: msgNotes
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