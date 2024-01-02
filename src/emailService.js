const { google } = require("googleapis");
const { authorize } = require("./gmail");

// code for reading all unread emails which contains ['inbox'] tags that they will sure messages are unread
async function processEmails() {
  try {
    const auth = await authorize();
    const gmail = google.gmail({ version: "v1", auth });

    const response = await gmail.users.messages.list({
      userId: "me",
      labelIds: ["INBOX"],
    });

    if (!response || !response.data || !response.data.messages) {
      console.error("Error fetching messages. Response structure is invalid.");
      return [];
    }

    const messages = response.data.messages;

    for (const message of messages) {
      try {
        const messageDetails = await getMessageDetails(gmail, message.id);

        if (!messageDetails || !messageDetails.payload) {
          console.error("Invalid message details. Cannot send reply.");
          continue; // Skiping to the next message
        }
        console.log(messageDetails);
        // Checking if a reply has been sent
        if (
          !messageDetails.payload.headers.some(
            (header) => header.name === "In-Reply-To",
          )
        ) {
          // Sending a sample reply
          const replyContent =
            "Hi there, I am currently out of the Space and will respond as soon as possible.";
          await sendReply(
            gmail,
            messageDetails.threadId,
            replyContent,
            messageDetails,
          );
        }
      } catch (error) {
        console.error("Error processing message:", error.message);
      }
    }

    return messages;
  } catch (error) {
    console.error("Error fetching messages:", error.message);
    return [];
  }
}

async function getMessageDetails(gmail, messageId) {
  const message = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
  });

  return message.data;
}

async function sendReply(gmail, threadId, replyContent, messageDetails) {
  try {
    if (
      !messageDetails ||
      !messageDetails.payload ||
      !messageDetails.payload.headers
    ) {
      console.error("Invalid message details. Cannot send reply.");
      return;
    }

    const fromHeader = messageDetails.payload.headers.find(
      (header) => header.name === "From",
    );
    const subjectHeader = messageDetails.payload.headers.find(
      (header) => header.name === "Subject",
    );

    if (!fromHeader || !subjectHeader) {
      console.error("Required headers not found. Cannot send reply.");
      return;
    }

    // Checking if a reply has been sent
    const replySentHeader = messageDetails.payload.headers.find(
      (header) => header.name === "X-Auto-Reply-Sent",
    );
    if (replySentHeader && replySentHeader.value === "true") {
      console.log("Auto-reply already sent. Skipping.");
      return;
    }

    // Marking the message as replied to avoid repeated replies
    await markMessageAsReplied(gmail, messageDetails.id);
    // this template will helps to sends well customized messageDetails including colors
    // Html template for the reply
    const htmlContent = `
    <html>
      <head>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            background-color: #f5f5f5;
            color: #333;
            padding: 20px;
          }
          .reply-container {
            background-color: #fff;
            border-radius: 8px;
            padding: 15px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          h2 {
            color: #007bff;
          }
          p {
            color: #333;
          }
          .polite-message {
            color: #28a745;
            font-weight: bold;
          }
          .details-container {
            margin-top: 20px;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 8px;
            background-color: #f9f9f9;
          }
        </style>
      </head>
      <body>
        <div class="reply-container">
          <h2>I'm Extremely Sorry for the Inconvenience</h2>
          <p>${replyContent}</p>
          <p class="polite-message">Thank you for your email. I sincerely appreciate your message.</p>
          <div class="details-container">
            <p><strong>If it's emergency, please reach out to me through [+91-9305083852].</strong></p>
            <ul>
              <li>I apologize for any delay in my response.</li>
              <li>Your understanding is highly appreciated.</li>
              <li>Please feel free to reach out for any further assistance.</li>
            </ul>
          </div>
        </div>
      </body>
    </html>
  `;
    console.log(fromHeader.value);
    const raw = Buffer.from(
      `To: ${fromHeader.value}\r\n` +
        `Subject: Re[Bot]: ${subjectHeader.value}\r\n` +
        'Content-Type: text/html; charset="UTF-8"\r\n' +
        "\r\n" +
        `${htmlContent}\r\n`,
    ).toString("base64");

    // Sending the reply
    try {
      await gmail.users.messages.send({
        userId: "me",
        requestBody: {
          raw,
          threadId,
        },
      });

      console.log("Reply sent successfully.");
    } catch (error) {
      console.error("Error sending reply:", error.message);
    }
  } catch (error) {
    console.error("Error processing message details:", error.message);
  }
}

async function markMessageAsReplied(gmail, messageId) {
  // Add a custom header to mark the message as replied
  await gmail.users.messages.modify({
    userId: "me",
    id: messageId,
    requestBody: {
      addLabelIds: ["INBOX"], // You can adjust the label if needed
      removeLabelIds: ["UNREAD"], // Remove the unread label to mark it as read
      headers: {
        "X-Auto-Reply-Sent": "true",
      },
    },
  });
}

module.exports = { processEmails };
