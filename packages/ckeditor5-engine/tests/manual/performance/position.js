/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document, setTimeout */

document.getElementById( 'run' ).addEventListener( 'click', () => {
	log( 'Running tests...' );

	setTimeout( async () => {
		await runTest( 'concat', concat );
		await runTest( 'spread operator', spread );
		await runTest( 'for-loop', forLoop );
		await runTest( 'ultra-loop', ultraForLoop );

		log( 'done' );
	} );
} );

const output = document.getElementById( 'output' );

function log( line ) {
	const paragraphElement = document.createElement( 'p' );
	paragraphElement.innerText = line;
	output.appendChild( paragraphElement );
}

const roots = [
	[ 1, 2, 3, 4 ],
	[ 1 ],
	[ 1, 2 ],
	[ 1 ],
	[ 7 ],
	[ 8 ],
	[ 7 ],
	[ 4, 2 ],
	[ 0, 2 ],
	[ 1, 2, 3, 4 ]
];

const paths = [
	[ 0 ],
	[ 6 ],

	[ 2 ],
	[ 1 ],
	[ 0, 1 ],
	[ 0, 1 ],
	[ 0, 1 ],
	[ 0, 1, 3 ],
	[ 0, 2, 0 ]
];

function runTest( name, callback ) {
	return new Promise( resolve => {
		const start = new Date();

		for ( let i = 0; i < 500000; i++ ) {
			callback();
		}

		const end = new Date();

		log( ` > ${ name } took ${ end - start }ms` );

		setTimeout( () => {
			resolve();
		}, 50 );
	} );
}

function concat() {
	for ( const rootPath of roots ) {
		for ( const path of paths ) {
			rootPath.concat( path );
		}
	}
}

function spread() {
	for ( const rootPath of roots ) {
		for ( const path of paths ) {
			[ ...rootPath, ...path ];
		}
	}
}

function forLoop() {
	for ( const rootPath of roots ) {
		for ( const path of paths ) {
			const newPath = [];

			for ( let i = 0; i < rootPath.length; i++ ) {
				newPath.push( rootPath[ i ] );
			}

			for ( let i = 0; i < path.length; i++ ) {
				newPath.push( path[ i ] );
			}
		}
	}
}

function ultraForLoop() {
	for ( const rootPath of roots ) {
		for ( const path of paths ) {
			const fullLength = rootPath.length + path.length;
			const newPath = new Array( fullLength );

			for ( let i = 0; i < rootPath.length; i++ ) {
				newPath[ i ] = rootPath[ i ];
			}

			for ( let i = 0; i < path.length; i++ ) {
				newPath[ rootPath.length + i ] = path[ i ];
			}
		}
	}
}
