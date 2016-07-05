/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const gutil = require( 'gulp-util' );

module.exports = {

	/**
	 * Executes a shell command.
	 *
	 * @param {String} command The command to be executed.
	 * @param {Boolean} [logOutput] When set to `false` command's output will not be logged. When set to `true`,
	 * stdout and stderr will be logged. Defaults to `true`.
	 * @returns {String} The command output.
	 */
	shExec( command, logOutput ) {
		const sh = require( 'shelljs' );

		sh.config.silent = true;
		logOutput = logOutput !== false;

		const ret = sh.exec( command );
		const logColor = ret.code ? gutil.colors.red : gutil.colors.grey;

		if ( logOutput ) {
			if ( ret.stdout ) {
				console.log( '\n' + logColor( ret.stdout.trim() ) + '\n' );
			}

			if ( ret.stderr ) {
				console.log( '\n' + gutil.colors.grey( ret.stderr.trim() ) + '\n' );
			}
		}

		if ( ret.code ) {
			throw new Error( `Error while executing ${ command }: ${ ret.stderr }` );
		}

		return ret.stdout;
	},

	/**
	 * Links directory located in source path to directory located in destination path.
	 * @param {String} source
	 * @param {String} destination
	 */
	linkDirectories( source, destination ) {
		const fs = require( 'fs' );
		// Remove destination directory if exists.
		if ( this.isSymlink( destination ) ) {
			this.removeSymlink( destination );
		} else if ( this.isDirectory( destination ) ) {
			this.shExec( `rm -rf ${ destination }` );
		}

		fs.symlinkSync( source, destination, 'dir' );
	},

	/**
	 * Returns array with all directories under specified path.
	 *
	 * @param {String} path
	 * @returns {Array}
	 */
	getDirectories( path ) {
		const fs = require( 'fs' );
		const pth = require( 'path' );

		return fs.readdirSync( path ).filter( item => {
			return this.isDirectory( pth.join( path, item ) );
		} );
	},

	/**
	 * Returns true if path points to existing directory.
	 *
	 * @param {String} path
	 * @returns {Boolean}
	 */
	isDirectory( path ) {
		const fs = require( 'fs' );

		try {
			return fs.statSync( path ).isDirectory();
		} catch ( e ) {}

		return false;
	},

	/**
	 * Returns true if path points to existing file.
	 *
	 * @param {String} path
	 * @returns {Boolean}
	 */
	isFile( path ) {
		const fs = require( 'fs' );

		try {
			return fs.statSync( path ).isFile();
		} catch ( e ) {}

		return false;
	},

	/**
	 * Returns true if path points to symbolic link.
	 *
	 * @param {String} path
	 */
	isSymlink( path ) {
		const fs = require( 'fs' );

		try {
			return fs.lstatSync( path ).isSymbolicLink();
		} catch ( e ) {}

		return false;
	},

	/**
	 * Updates JSON file under specified path.
	 * @param {String} path Path to file on disk.
	 * @param {Function} updateFunction Function that will be called with parsed JSON object. It should return
	 * modified JSON object to save.
	 */
	updateJSONFile( path, updateFunction ) {
		const fs = require( 'fs' );

		const contents = fs.readFileSync( path, 'utf-8' );
		let json = JSON.parse( contents );
		json = updateFunction( json );

		fs.writeFileSync( path, JSON.stringify( json, null, 2 ) + '\n', 'utf-8' );
	},

	/**
	 * Reinserts all object's properties in alphabetical order (character's Unicode value).
	 * Used for JSON.stringify method which takes keys in insertion order.
	 *
	 * @param { Object } obj
	 * @returns { Object } Same object with sorted keys.
	 */
	sortObject( obj ) {
		Object.keys( obj ).sort().forEach( key => {
			const val = obj[ key ];
			delete obj[ key ];
			obj[ key ] = val;
		} );

		return obj;
	},

	/**
	 * Returns name of the NPM module located under provided path.
	 *
	 * @param {String} modulePath Path to NPM module.
     */
	readPackageName( modulePath ) {
		const fs = require( 'fs' );
		const path = require( 'path' );
		const packageJSONPath = path.join( modulePath, 'package.json' );

		if ( !this.isFile( packageJSONPath ) ) {
			return null;
		}

		const contents = fs.readFileSync( packageJSONPath, 'utf-8' );
		const json = JSON.parse( contents );

		return json.name || null;
	},

	/**
	 * Calls `npm install` command in specified path.
	 *
	 * @param {String} path
	 */
	npmInstall( path ) {
		this.shExec( `cd ${ path } && npm install` );
	},

	/**
	 * Calls `npm uninstall <name>` command in specified path.
	 *
	 * @param {String} path
	 * @param {String} name
	 */
	npmUninstall( path, name ) {
		this.shExec( `cd ${ path } && npm uninstall ${ name }` );
	},

	/**
	 * Calls `npm update --dev` command in specified path.
	 *
	 * @param {String} path
	 */
	npmUpdate( path ) {
		this.shExec( `cd ${ path } && npm update --dev` );
	},

	/**
	 * Copies source files into destination directory and replaces contents of the file using provided `replace` object.
	 *
	 *		// Each occurrence of `{{appName}}` inside README.md and CHANGES.md will be changed to `ckeditor5`.
	 * 		tools.copyTemplateFiles( [ 'README.md', 'CHANGES.md' ], '/new/path', { '{{AppName}}': 'ckeditor5' } );
	 *
	 * @param {Array} sources Source files.
	 * @param {String} destination Path to destination directory.
	 * @param {Object} [replace] Object with data to fill template. Method will take object's keys and replace their
	 * occurrences with value stored under that key.
	 */
	copyTemplateFiles( sources, destination, replace ) {
		const path = require( 'path' );
		const fs = require( 'fs-extra' );
		replace = replace || {};
		destination = path.resolve( destination );
		const regexps = [];

		for ( let variableName in replace ) {
			regexps.push( variableName );
		}
		const regexp = new RegExp( regexps.join( '|' ), 'g' );
		const replaceFunction = ( matched ) => replace[ matched ];

		fs.ensureDirSync( destination );

		sources.forEach( source => {
			source = path.resolve( source );
			let fileData = fs.readFileSync( source, 'utf8' );
			fileData = fileData.replace( regexp, replaceFunction );
			fs.writeFileSync( path.join( destination, path.basename( source ) ), fileData, 'utf8' );
		} );
	},

	/**
	 * Executes 'npm view' command for provided module name and returns Git url if one is found. Returns null if
	 * module cannot be found.
	 *
	 * @param {String} name Name of the module.
	 * @returns {*}
     */
	getGitUrlFromNpm( name ) {
		try {
			const info = JSON.parse( this.shExec( `npm view ${ name } repository --json`, false ) );

			if ( info && info.type == 'git' ) {
				return info.url;
			}
		} catch ( error ) {
			// Throw error only when different than E404.
			if ( error.message.indexOf( 'npm ERR! code E404' ) == -1 ) {
				throw error;
			}
		}

		return null;
	},

	/**
	 * Unlinks symbolic link under specified path.
	 *
	 * @param {String} path
	 */
	removeSymlink( path ) {
		const fs = require( 'fs' );
		fs.unlinkSync( path );
	}
};
