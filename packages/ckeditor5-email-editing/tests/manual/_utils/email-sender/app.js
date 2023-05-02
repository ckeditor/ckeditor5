/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, require */

const express = require( 'express' );

const nodemailer = require( 'nodemailer' );
const bodyParser = require( 'body-parser' );
const cors = require( 'cors' );

const app = express();
const port = 3000;

app.use( cors() );
app.use( bodyParser.json() ); // to support JSON-encoded bodies
app.use( bodyParser.urlencoded( { // to support URL-encoded bodies
	extended: true
} ) );

const transporter = nodemailer.createTransport( {
	host: 'your-smtp-host',
	port: 465,
	secure: true, // upgrade later with STARTTLS
	auth: {
		user: 'your-smtp-user',
		pass: 'your-smtp-password'
	}
} );

transporter.verify( error => {
	if ( error ) {
		console.log( error );
	} else {
		console.log( 'Server is ready to take our messages' );
	}
} );

app.post( '/send', ( req, res ) => {
	const { html, to, subject } = req.body;

	const message = {
		from: 'ckeditor-email-test@ckeditor.com',
		to,
		subject,
		html
	};

	transporter.sendMail( message, ( err, info ) => {
		if ( err ) {
			console.log( err );
		}

		console.log( info );
	} );

	res.send( { message: 'Message sent.' } );
} );

app.listen( port, () => {
	console.log( `E-mail sender app listening on port ${ port }` );
} );
