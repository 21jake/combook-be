const nodemailer = require('nodemailer');
const pug = require('pug');
const { htmlToText } = require('html-to-text');

const {
  EMAIL_USERNAME,
  EMAIL_PASSWORD,
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_FROM,
} = process.env;

class Email {
  constructor(user, url) {
    const { name, email } = user;
    this.to = email;
    this.firstName = name.split(' ')[0];
    this.from = `Communication Book ${EMAIL_FROM}`;
    this.url = url;
  }
  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Sendgrid
      throw 'Sending emails for production env is not yet implemented';
    } else {
      return nodemailer.createTransport({
        host: EMAIL_HOST,
        port: EMAIL_PORT,
        auth: {
          user: EMAIL_USERNAME,
          pass: EMAIL_PASSWORD,
        },
        // Activate in gmail "less secure app" option
      });
    }
  }

  async send(template, subject) {
    // Send the email
    // 1. Render HTML based on pug template
    const html = pug.renderFile(`${__dirname}/../pugs-template/emails/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
      passwordConfirm: this.passwordConfirm,
    });

    // 2. Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html),
    };

    // 3.Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to E-Communication Book!');
  }
  async sendPasswordReset() {
    await this.send('passwordReset', 'Your password token (valid for  10 minutes)!');
  }
}

module.exports = Email;
