const sgMail = require('@sendgrid/mail')
require('dotenv').config()

sgMail.setApiKey(process.env.MAIL_API_KEY)

sgMail.send({
    to: 'enmanuelr7@gmail.com',
    from: 'enmanuelr7@gmail.com',
    subject: 'HOLA MONIS',
    text: 'Moni, moni, moni moni moni <3'
})
