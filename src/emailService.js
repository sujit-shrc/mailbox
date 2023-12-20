// const fs = require("fs");
// const dotenv = require("dotenv");
// dotenv.config();
//
// async function processEmails(gmailService) {
//   const gmail = await gmailService.authorize();
//   const messages = await getNewEmails(gmail);
//
//   for (const message of messages) {
//     const threadId = message.threadId;
//     const hasReplied = await hasRepliedToThread(gmail, threadId);
//
//     if (!hasReplied) {
//       const label = await createLabel(gmail, "VacationReply");
//       await sendReply(gmail, message.id, label.id);
//     }
//   }
// }
//
// async function getNewEmails(gmail) {
//   const response = await gmail.users.messages.list({
//     userId: process.env.GMAIL_USER,
//     q: "is:inbox -label:VacationReply", // Exclude already processed emails
//   });
//
//   return response.data.messages || [];
// }
//
// async function hasRepliedToThread(gmail, threadId) {
//   const response = await gmail.users.messages.list({
//     userId: process.env.GMAIL_USER,
//     q: `in:inbox thread:${threadId} from:me`,
//   });
//
//   return response.data.messages.length > 0;
// }
//
// async function sendReply(gmail, messageId, labelId) {
//   const message = await gmail.users.messages.get({
//     userId: process.env.GMAIL_USER,
//     id: messageId,
//   });
//
//   const reply = `Thank you for your email! I'm currently out of the office and will get back to you soon.`;
//
//   await gmail.users.messages.send({
//     userId: process.env.GMAIL_USER,
//     requestBody: {
//       threadId: message.data.threadId,
//       labelIds: [labelId],
//       raw: Buffer.from(
//         createMimeMessage(
//           process.env.GMAIL_USER,
//           message.data.payload.headers[0].value,
//           reply,
//         ),
//       ).toString("base64"),
//     },
//   });
// }
//
// async function createLabel(gmail, labelName) {
//   const labels = await gmail.users.labels.list({
//     userId: process.env.GMAIL_USER,
//   });
//
//   const existingLabel = labels.data.labels.find(
//     (label) => label.name === labelName,
//   );
//
//   if (existingLabel) {
//     return existingLabel;
//   } else {
//     const response = await gmail.users.labels.create({
//       userId: process.env.GMAIL_USER,
//       requestBody: {
//         name: labelName,
//       },
//     });
//
//     return response.data;
//   }
// }
//
// function createMimeMessage(sender, to, body) {
//   const messageParts = [
//     `From: ${sender}`,
//     `To: ${to}`,
//     "Content-Type: text/plain; charset=UTF-8",
//     "",
//     body,
//   ];
//
//   return messageParts.join("\n");
// }
//
// module.exports = { processEmails };
//

// emailService.js

const { google } = require('googleapis');
const { authorize } = require('./gmail');

async function processEmails() {
  try {
    const auth = await authorize();
    const gmail = google.gmail({ version: 'v1', auth });

    const response = await gmail.users.messages.list({
      userId: 'me',
      labelIds: ['INBOX'], // Adjust the label if needed
    });

    if (!response || !response.data || !response.data.messages) {
      console.error('Error fetching messages. Response structure is invalid.');
      return [];
    }

    const messages = response.data.messages;

    for (const message of messages) {
      try {
        const messageDetails = await getMessageDetails(gmail, message.id);

        if (!messageDetails || !messageDetails.payload) {
          console.error('Invalid message details. Cannot send reply.');
          continue; // Skip to the next message
        }

        // Check if a reply has been sent
        if (!messageDetails.payload.headers.some(header => header.name === 'In-Reply-To')) {
          // Send a sample reply
          const replyContent = 'Thank you for your email. I am currently out of the Internet Access and will respond as soon as possible.';
          await sendReply(gmail, messageDetails.threadId, replyContent, messageDetails);
        }
      } catch (error) {
        console.error('Error processing message:', error.message);
      }
    }

    return messages;
  } catch (error) {
    console.error('Error fetching messages:', error.message);
    return [];
  }
}

async function getMessageDetails(gmail, messageId) {
  const message = await gmail.users.messages.get({
    userId: 'me',
    id: messageId,
  });

  return message.data;
}

async function sendReply(gmail, threadId, replyContent, messageDetails) {
  if (!messageDetails || !messageDetails.payload) {
    console.error('Invalid message details. Cannot send reply.');
    return;
  }

  const fromHeader = messageDetails.payload.headers.find(header => header.name === 'From');
  const subjectHeader = messageDetails.payload.headers.find(header => header.name === 'Subject');

  if (!fromHeader || !subjectHeader) {
    console.error('Required headers not found. Cannot send reply.');
    return;
  }

  const raw = Buffer.from(
    `To: ${fromHeader.value}\r\n` +
    `Subject: Re: ${subjectHeader.value}\r\n` +
    '\r\n' +
    `${replyContent}\r\n`
  ).toString('base64');

  // Send the reply
  try {
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw,
        threadId,
      },
    });

    console.log('Reply sent successfully.');
  } catch (error) {
    console.error('Error sending reply:', error.message);
  }
}


module.exports = { processEmails };
