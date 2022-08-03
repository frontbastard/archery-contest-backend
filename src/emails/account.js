const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
  sgMail
    .send({
      to: email,
      from: 'pavelxsokolov@gmail.com',
      subject: 'Thanks for joining in!',
      text: `Welcome to the app, ${name}. Let me know how you get along with the app.`,
    })
    .then(() => {
      // eslint-disable-next-line no-console
      console.log('Email sent');
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error(error);
    });
};

const sendCancelEmail = (email, name) => {
  sgMail
    .send({
      to: email,
      from: 'pavelxsokolov@gmail.com',
      subject: 'Sorry to see you go.',
      text: `Goodbye, ${name}. I hope to see you back sometime soon.`,
    })
    .then(() => {
      // eslint-disable-next-line no-console
      console.log('Email sent');
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error(error);
    });
};

module.exports = {
  sendWelcomeEmail,
  sendCancelEmail,
};