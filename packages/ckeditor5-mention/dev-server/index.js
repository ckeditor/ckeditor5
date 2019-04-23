/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

const http = require( 'http' );

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer( function( req, res ) {
	readEntries( getTimeout() ).then( entries => {
		res.statusCode = 200;
		res.setHeader( 'Content-Type', 'application/json' );
		res.end( JSON.stringify( entries ) );
	} );

	setTimeout( () => {
	}, 600 );
} );

server.listen( port, hostname, () => {
	console.log( `server running at http://${ hostname }:${ port }/` );
} );

function readEntries( timeOut ) {
	return new Promise( resolve => {
		setTimeout( () => {
			resolve( [
				{ id: 123, username: 'jodator', name: 'Maciej Gołaszewski' }
			] );
		}, timeOut );
	} );
}

function getTimeout() {
	const type = parseInt( Math.random() * 10 );

	// 80% of requests completes in 100-300ms range (10ms resolution).
	if ( type < 8 ) {
		return parseInt( 10 + Math.random() * 20 ) * 10;
	}

	// 20% of requests completes in 600-1000ms range (10ms resolution).
	return parseInt( 60 + Math.random() * 40 ) * 10;
}
