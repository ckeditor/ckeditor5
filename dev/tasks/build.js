/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* jshint node: true */

'use strict';

module.exports = function( grunt ) {
	grunt.registerTask( 'build', 'Build a release out of the current development code.', function() {
		var done = this.async();
		module.exports.build( done );
	} );
};

// Exports the build method so it can be used from plain node code as well.
module.exports.build = function( done ) {
	var target = 'build';
	var tmp = 'tmp';
	var stepCounter = 0;

	var tasks = [
		[ cleanup, 'Cleaning the "' + target + '" directory...' ],
		[ copyToTmp, 'Copying source files for manipulation...' ],
		[ removeAmdNamespace, 'AMD cleanup...' ],
		[ optimize, 'Creating the optimized code...' ],
		[ cleanupTmp, 'Removing the "' + tmp + '" directory...' ]
	];

	runNext();

	function runNext() {
		var next = tasks.shift();

		if ( next ) {
			stepCounter++;
			console.log( stepCounter + '. ' + next[ 1 ] );
			next[ 0 ]( runNext );
		} else {
			if ( done ) {
				done();
			}
		}
	}

	function cleanup( callback ) {
		var del = require( 'del' );
		del.sync( target );
		del.sync( tmp );

		return callback();
	}

	function copyToTmp( callback ) {
		var ncp = require( 'ncp' ).ncp;
		var path = require( 'path' );
		var fs = require( 'fs' );

		var deps = JSON.parse( fs.readFileSync( 'package.json', 'utf8' ) ).dependencies;

		var toCopy = Object.keys( deps ).filter( function( name ) {
				return name.indexOf( 'ckeditor5-' ) === 0;
			} );

		if ( !fs.existsSync( tmp ) ) {
			fs.mkdirSync( tmp );
		}

		function copy() {
			var module = toCopy.shift();

			if ( !module ) {
				return callback();
			}

			var dest = path.join( tmp + '/', module );

			if ( !fs.existsSync( dest ) ) {
				fs.mkdirSync( dest );
			}

			// Copy the "src" directory only.
			ncp( path.join( 'node_modules', module, 'src' ), path.join( dest, 'src' ), {
				dereference: true
			}, function( err ) {
				if ( err ) {
					throw( err );
				}

				copy();
			} );
		}

		copy();
	}

	function removeAmdNamespace( callback ) {
		var replace = require( 'replace' );

		replace( {
			regex: /^\s*CKEDITOR\.(define|require)/mg,
			replacement: '$1',
			paths: [ 'tmp' ],
			recursive: true,
			silent: true
		} );

		callback();
	}

	function optimize( callback ) {
		var requirejs = require( 'requirejs' );

		var config = {
			out: target + '/ckeditor.js',

			baseUrl: tmp + '/ckeditor5-core/src/',
			paths: {
				'ckeditor': '../../../ckeditor',
				'ckeditor-dev': '../../../src/ckeditor-dev',
				'ckeditor-core': 'ckeditor'
			},

			include: [ 'ckeditor' ],
			stubModules: [ 'ckeditor-dev' ],

//			optimize: 'none',
			optimize: 'uglify2',
			preserveLicenseComments: false,
			wrap: {
				startFile: [ 'dev/tasks/build/start.frag', require.resolve( 'almond' ) ],
				endFile: 'dev/tasks/build/end.frag'
			}
		};

		requirejs.optimize( config, function() {
			callback();
		} );
	}

	function cleanupTmp( callback ) {
		var del = require( 'del' );
		del.sync( tmp );

		return callback();
	}
};
