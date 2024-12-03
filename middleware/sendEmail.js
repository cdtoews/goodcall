const sgMail = require("@sendgrid/mail");


const sendCallEntryEmail = async () => {

    // using Twilio SendGrid's v3 Node.js Library
    // https://github.com/sendgrid/sendgrid-nodejs
    
    //const sgMail = require('@sendgrid/mail')
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    const msg = {
        to: 'chris.admin@goodingd.com', // Change to your recipient
        from: 'chris.admin@goodingd.com', // Change to your verified sender
        subject: 'Sending with SendGrid is Fun',
        text: 'and easy to do anywhere, even with Node.js',
        html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    }
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