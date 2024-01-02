
# Gmail Auto-Reply Node.js App

This Node.js application automates the process of sending polite and colorful auto-replies to incoming emails in your Gmail mailbox. It uses the Gmail API to check for new emails, identifies first-time threads, sends a customized auto-reply, and adds a label to the email.

## Features

- **Auto-Replies:** Sends aesthetically pleasing and polite replies to incoming emails.

- **Avoids Duplicate Replies:** Ensures that an auto-reply is sent only once for each email thread.

- **Labeling:** Adds a label to the email for easy organization.

## Technical Details

- **Built with Node.js:** The application is developed using Node.js to harness its asynchronous and event-driven nature.

- **Gmail API:** Utilizes the Gmail API to interact with your Gmail mailbox. Ensure that you have the necessary API credentials.

- **Promises and Async/Await:** Embraces modern JavaScript standards to write clean and readable code.

- **HTML Email Template:** Customizable HTML templates for creating stylish and colorful email replies.

  ## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/mnamesujit/mailbox.git
   ```

2. Install dependencies:

   ```bash
   cd mailox
   npm install
   ```

3. Set up API credentials:

   - Follow the instructions in the [Google Gmail API documentation](https://developers.google.com/gmail/api/guides) to obtain API credentials.
   - Save the credentials as `credentials.json` in the project root.

4. Create a `.env` file:

   - Create a `.env` file in the project root.
   - Add the following environment variables:

     ```env
     CLIENT_ID=your-client-id
     CLIENT_SECRET=your-client-secret
     REDIRECT_URI=your-redirect-uri
     ```

     Replace the placeholders with your actual credentials.

5. Run the application:

   ```bash
   npm start
   ```

   The app will prompt you to authenticate and grant permission to access your Gmail account.

6. The application will start checking for new emails, sending auto-replies, and adding labels at random intervals.

## Customization

- **Auto-Reply Message:** Customize the content of the auto-reply in the `sendReply` function of `emailService.js`.

- **HTML Styling:** Modify the HTML styles in the `sendReply` function to change the appearance of the auto-reply.

## Notes

- Ensure that your Gmail account allows access by enabling "Less secure app access" in your account settings.

- The app runs at random intervals between 45 to 120 seconds to simulate a real-world scenario.

## Areas for Improvement

- Implement error handling and logging to enhance the robustness of the application.

- Explore further customization options for HTML email content.

- Enhance the application to handle more complex scenarios and edge cases.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Feel free to customize this README based on your specific application details and requirements.
