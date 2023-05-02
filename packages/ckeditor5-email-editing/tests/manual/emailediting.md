# E-mail editing PoC manual test

## Sending real e-mails

In order to send real e-mails, you can use the sample application that handles delivering messages. You can find it in `ckeditor5-email-editing/tests/manual/_utils/email-sender`.

How to setup the mail sender:
1. Install packages.
1. Open `app.js` in your code editor.
1. Add your SMTP server host in #L17.
1. Add your SMTP username in #L21.
1. Add your SMTP password in #L22.
1. Add your e-mail address to the `from` header in #L38.
1. Run the application: `node app.js`.

The application will listen on port `3000`. The sample is configured to send requests to `http://localhost:3000/send` with the e-mail data.

**Note**: It might be possible that your e-mails will be filtered out or marked as spam, so it might be a good idea to add your e-mail address to the whitelist.

The example sends the e-mail using the following template:

```html
<div style="background-color:#eaf0f6;padding: 25px 0;" bgColor="#eaf0f6">
	<div style="background-color:#ffffff; margin: auto; max-width:${ editorWidth }px" bgColor="#ffffff">
		<!-- Data from CKEditor 5 -->
	</div>
</div>
```

## Testing with raw HTML

If you don't want to send e-mails, you can try pasting the HTML returned by CKEditor 5 directly to the e-mail client message window.

1. Copy the processed HTML using the "Copy HTML" button above the editor.
1. Open any e-mail client and compose an e-mail.
1. Paste the content to the editable.
1. Send the e-mail.

