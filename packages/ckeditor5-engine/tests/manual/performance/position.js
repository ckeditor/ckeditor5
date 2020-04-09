/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document, setTimeout */

document.getElementById( 'run' ).addEventListener( 'click', () => {
	log( 'Running tests...' );

	setTimeout( async () => {
		await runTest( 'concat', testConcat );
		await runTest( 'spread operator', testSpread );
		await runTest( 'for-loop', testForLoop );
		await runTest( 'ultra-loop', testUltraForLoop );

		log( 'done' );
	} );
} );

const output = document.getElementById( 'output' );

function log( line ) {
	const paragraphElement = document.createElement( 'p' );
	paragraphElement.innerText = line;
	output.appendChild( paragraphElement );
}

function runTest( name, callback ) {
	return new Promise( resolve => {
		const start = new Date();

		const repetitions = 10000000;
		const z = Array( repetitions );

		const root = {
			root: 'foo',
			path: [ 0 ]
		};
		const path = [ 0, 2 ];

		for ( let i = 0; i < repetitions; i++ ) {
			const newPath = callback( root, path );
			z[ i ] = [ newPath.length ];
		}

		const end = new Date();

		log( ` > ${ name } took ${ end - start }ms` );

		setTimeout( () => {
			resolve();
		}, 50 );
	} );
}

class PositionConcat {
	constructor( root, path, stickiness = 'left' ) {
		if ( !( path instanceof Array ) || path.length === 0 ) {
			throw new Error( 'model-position-path-incorrect-format' );
		}

		path = root.path.concat( path );
		root = root.root;

		this.root = root;
		this.path = path;
		this.stickiness = stickiness;
	}
}

class PositionSpread {
	constructor( root, path, stickiness = 'left' ) {
		if ( !( path instanceof Array ) || path.length === 0 ) {
			throw new Error( 'model-position-path-incorrect-format' );
		}

		path = [ ...root.path, ...path ];
		root = root.root;

		this.root = root;
		this.path = path;
		this.stickiness = stickiness;
	}
}

class PositionForLoop {
	constructor( root, path, stickiness = 'left' ) {
		if ( !( path instanceof Array ) || path.length === 0 ) {
			throw new Error( 'model-position-path-incorrect-format' );
		}

		path = forLoop( root.path, path );
		root = root.root;

		this.root = root;
		this.path = path;
		this.stickiness = stickiness;
	}
}

class PositionUltraForLoop {
	constructor( root, path, stickiness = 'left' ) {
		if ( !( path instanceof Array ) || path.length === 0 ) {
			throw new Error( 'model-position-path-incorrect-format' );
		}

		path = ultraForLoop( root.path, path );
		root = root.root;

		this.root = root;
		this.path = path;
		this.stickiness = stickiness;
	}
}

function testConcat( root, path ) {
	return new PositionConcat( root, path );
}

function testSpread( root, path ) {
	return new PositionSpread( root, path );
}

function testForLoop( root, path ) {
	return new PositionForLoop( root, path );
}

function testUltraForLoop( root, path ) {
	return new PositionUltraForLoop( root, path );
}

function forLoop( rootPath, path ) {
	const newPath = [];

	for ( let i = 0; i < rootPath.length; i++ ) {
		newPath.push( rootPath[ i ] );
	}

	for ( let i = 0; i < path.length; i++ ) {
		newPath.push( path[ i ] );
	}

	return newPath;
}

function ultraForLoop( rootPath, path ) {
	const fullLength = rootPath.length + path.length;
	const newPath = new Array( fullLength );

	for ( let i = 0; i < rootPath.length; i++ ) {
		newPath[ i ] = rootPath[ i ];
	}

	for ( let i = 0; i < path.length; i++ ) {
		newPath[ rootPath.length + i ] = path[ i ];
	}

	return newPath;
}
