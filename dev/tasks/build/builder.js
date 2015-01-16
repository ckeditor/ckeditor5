/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* jshint node: true */

'use strict';

var Builder;

/**
 * A CKEditor 5 release builder.
 *
 * @class Builder
 */
module.exports = Builder = function( target ) {
	/**
	 * The target directory where to create the build.
	 *
	 * **Warning**: if existing, this directory will be deleted before processing.
	 *
	 * @type {string}
	 */
	this.target = target || 'build';

	/**
	 * The temporary directory to use for build processing.
	 *
	 * **Warning**: if existing, this directory will be deleted before processing.
	 *
	 * @type {string}
	 */
	this.tmp = 'tmp';

	/**
	 * The list of tasks to be executed by the `build()` method. Each entry is an Array containing the name of the
	 * method inside `tasks` to execute and the message to show to the end user when executing it.
	 *
	 * @type {Array}
	 */
	this.taskList = [
		[ 'cleanup', 'Cleaning the "' + target + '" directory...' ],
		[ 'copyToTmp', 'Copying source files for manipulation...' ],
		[ 'removeAmdNamespace', 'AMD cleanup...' ],
		[ 'optimize', 'Creating the optimized code...' ],
		[ 'cleanupTmp', 'Removing the "' + this.tmp + '" directory...' ]
	];
};

Builder.prototype = {
	/**
	 * Builds a CKEditor release based on the current development code.
	 *
	 * @param {Function} [callback] Function to be called when build finishes.
	 */
	build: function( callback ) {
		var that = this;
		var stepCounter = 0;

		runNext();

		function runNext() {
			var next = that.taskList.shift();

			if ( next ) {
				stepCounter++;
				console.log( stepCounter + '. ' + next[ 1 ] );
				that.tasks[ next[ 0 ] ].call( that, runNext );
			} else {
				if ( callback ) {
					callback();
				}
			}
		}
	},

	/**
	 * Holds individual methods for each task executed by the builder.
	 *
	 * All methods here MUST be called in the builder context by using
	 * `builder.tasks.someMethod.call( builder, callback )`.
	 */
	tasks: {
		/**
		 * Deletes the `target` and `tmp` directories.
		 *
		 * @param {Function} callback Function to be called when the task is done.
		 * @returns {Object} The callback returned valued.
		 */
		cleanup: function( callback ) {
			var del = require( 'del' );
			del.sync( this.target );
			del.sync( this.tmp );

			return callback();
		},

		/**
		 * Copy the local source code of CKEditor and its dependencies to the `tmp` directory for processing.
		 *
		 * @param {Function} callback Function to be called when the task is done.
		 * @returns {Object} The callback returned valued.
		 */
		copyToTmp: function( callback ) {
			var ncp = require( 'ncp' ).ncp;
			var path = require( 'path' );
			var fs = require( 'fs' );
			var tmp = this.tmp;

			var deps = require( '../../../package.json' ).dependencies;

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
		},

		/**
		 * Removes the `CKEDITOR` namespace from AMD calls in the `tmp` copy of the source code.
		 *
		 * @param {Function} callback Function to be called when the task is done.
		 * @returns {Object} The callback returned valued.
		 */
		removeAmdNamespace: function( callback ) {
			var replace = require( 'replace' );

			replace( {
				regex: /^\s*CKEDITOR\.(define|require)/mg,
				replacement: '$1',
				paths: [ this.tmp ],
				recursive: true,
				silent: true
			} );

			callback();
		},

		/**
		 * Creates the optimized release version of `ckeditor.js` in the `target` directory out of the `tmp` copy of the
		 * source code.
		 *
		 * @param {Function} callback Function to be called when the task is done.
		 * @returns {Object} The callback returned valued.
		 */
		optimize: function( callback ) {
			var requirejs = require( 'requirejs' );

			var config = {
				out: this.target + '/ckeditor.js',

				baseUrl: this.tmp + '/ckeditor5-core/src/',
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

			requirejs.optimize( config, callback );
		},

		/**
		 * Deletes `tmp` directory.
		 *
		 * @param {Function} callback Function to be called when the task is done.
		 * @returns {Object} The callback returned valued.
		 */
		cleanupTmp: function( callback ) {
			var del = require( 'del' );
			del.sync( this.tmp );

			return callback();
		}
	}
};
