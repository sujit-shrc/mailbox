const fs = require("fs");
const { google } = require("googleapis");
const readline = require("readline");
const dotenv = require("dotenv");
dotenv.config();

const SCOPES = ["https://www.googleapis.com/auth/gmail.modify"];
const TOKEN_PATH = "token.json";
// code for setting up the google Oauth2 client
// Setup for authentication through google Oauth2

async function authorize() {
  const oAuth2Client = getOAuthClient();

  let token;
  try {
    token = fs.readFileSync(TOKEN_PATH);
    oAuth2Client.setCredentials(JSON.parse(token));
  } catch (err) {
    token = await getNewToken(oAuth2Client);
  }

  return oAuth2Client;
}

function getOAuthClient() {
  const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = process.env;

  const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI,
  );

  return oAuth2Client;
}

async function getNewToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });

  console.log(`Authorize this app by visiting this URL: ${authUrl}`);
  console.log("Enter the code from that page here: ");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const code = await new Promise((resolve) => {
    rl.question("Enter the code: ", (code) => {
      rl.close();
      resolve(code);
    });
  });

  const { tokens } = await oAuth2Client.getToken({ code, prompt: "consent" });
  oAuth2Client.setCredentials(tokens);

  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
  console.log("Token stored to", TOKEN_PATH);

  return tokens;
}

module.exports = { authorize };
