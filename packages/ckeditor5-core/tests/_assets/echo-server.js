/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* eslint-env node */

/**
 * Simple HTTP server which parses POST requests and returns it in JSON format.
 */
const http = require( 'http' );
const queryString = require( 'querystring' );
const port = 3030;

const server = http.createServer( ( req, res ) => {
	const methodName = req.method;
	let content = '';

	console.info( `Incoming ${ methodName } request.` );

	if ( methodName == 'POST' ) {
		res.writeHead( 200, { 'Content-Type': 'application/json' } );

		req.on( 'data', data => ( content += data ) );
		req.on( 'end', () => res.end( JSON.stringify( queryString.parse( content ) ) ) );

		return;
	}

	res.writeHead( 200, { 'Content-Type': 'text' } );
	res.end( 'Please make a POST request to get an echo response.' );
} );

console.info( `Starting server on port ${ port }.` );
server.listen( port );
