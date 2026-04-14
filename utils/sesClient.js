const { SESClient } = require("@aws-sdk/client-ses");

const REGION = process.env.AWS_REGION || "ap-southeast-2";

const clientConfig = { region: REGION };

if (process.env.AWS_ACCESS_KEY && process.env.AWS_SECRET_KEY) {
  clientConfig.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  };
}

const sesClient = new SESClient(clientConfig);

module.exports = { sesClient };
