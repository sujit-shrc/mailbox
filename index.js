const fs = require("fs");
const { authorize } = require("./src/gmail.js");
const { processEmails } = require("./src/emailService.js");

// This mail file will helps to start script
// main function to start script
async function main() {
  setInterval(async () => {
    const gmailService = { authorize }; // Pass an object with the necessary method
    await processEmails(gmailService);
  }, getRandomInterval());
}

function getRandomInterval() {
  return Math.floor(Math.random() * (120000 - 45000 + 1) + 45000); // Random interval between 45 to 120 seconds
}

main();
