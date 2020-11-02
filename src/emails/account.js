const sgMail = require('@sendgrid/mail')
require('dotenv').config()

sgMail.setApiKey(process.env.MAIL_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'enmanuelr7@gmail.com',
        subject: 'WELCOME',
        text: `Hello ${name}, thanks for joining!`
    })
}

module.exports = {
    sendWelcomeEmail
}