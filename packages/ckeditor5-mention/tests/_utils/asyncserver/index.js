/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

const http = require( 'http' );
const fs = require( 'fs' );
const querystring = require( 'querystring' );
const url = require( 'url' );
const { upperFirst } = require( 'es-toolkit/compat' );

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer( function( req, res ) {
	res.statusCode = 200;
	res.setHeader( 'Content-Type', 'application/json' );

	const { search } = querystring.parse( url.parse( req.url ).query.toLowerCase() );

	readEntries( getTimeout() )
		.then( entries => entries
			.map( ( { picture, name, login } ) => ( {
				id: `@${ login.username }`,
				username: login.username,
				fullName: `${ upperFirst( name.first ) } ${ upperFirst( name.last ) }`,
				thumbnail: picture.thumbnail
			} ) )
			.sort( ( a, b ) => a.username.localeCompare( b.username ) )
			.filter( entry => entry.fullName.toLowerCase().includes( search ) || entry.username.toLowerCase().includes( search ) )
			.slice( 0, 10 )
		)
		.then( entries => {
			res.setHeader( 'Access-Control-Allow-Origin', '*' );
			res.setHeader( 'Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept' );

			res.end( JSON.stringify( entries ) + '\n' );
		} );
} );

server.listen( port, hostname, () => {
	console.log( `server running at http://${ hostname }:${ port }/` );
} );

function readEntries( timeOut ) {
	return new Promise( ( resolve, reject ) => {
		fs.readFile( './data/db.json', ( err, data ) => {
			if ( err ) {
				reject( err );
			}

			const entries = JSON.parse( data );

			setTimeout( () => {
				resolve( entries );
			}, timeOut );
		} );
	} );
}

function getTimeout() {
	const type = parseInt( Math.random() * 10 );

	// 60% of requests completes in 150ms.
	if ( type < 6 ) {
		return 150;
	}

	// 40% of requests completes in 400ms, 1s, 2s or 4s.
	return [ 400, 1000, 2000, 4000 ][ ( Math.random() * 3 ).toFixed( 0 ) ];
}
