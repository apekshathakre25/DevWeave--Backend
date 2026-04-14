const { SendEmailCommand } = require("@aws-sdk/client-ses");
const { sesClient } = require("./sesClient");

const createSendEmailCommand = ({ to, from, subject, text, html }) => {
  const body = {};

  if (html) {
    body.Html = {
      Charset: "UTF-8",
      Data: html,
    };
  }

  if (text) {
    body.Text = {
      Charset: "UTF-8",
      Data: text,
    };
  }

  return new SendEmailCommand({
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Body: body,
      Subject: {
        Charset: "UTF-8",
        Data: subject,
      },
    },
    Source: from,
  });
};

const sendEmail = async ({ to, subject, text, html }) => {
  const from =
    process.env.SES_FROM_EMAIL ||
    process.env.AWS_SES_FROM_EMAIL ||
    process.env.FROM_EMAIL;

  if (!from) {
    throw new Error("SES sender email is not configured. Set SES_FROM_EMAIL.");
  }

  if (!to) {
    throw new Error("Email recipient is required.");
  }

  if (!subject) {
    throw new Error("Email subject is required.");
  }

  if (!text && !html) {
    throw new Error("Email text or html body is required.");
  }

  const command = createSendEmailCommand({ to, from, subject, text, html });
  return sesClient.send(command);
};

module.exports = { sendEmail };
