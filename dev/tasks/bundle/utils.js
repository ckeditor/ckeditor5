/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const fs = require( 'fs' );
const path = require( 'path' );
const gulp = require( 'gulp' );
const gulpRename = require( 'gulp-rename' );
const gutil = require( 'gulp-util' );
const prettyBytes = require( 'pretty-bytes' );
const gzipSize = require( 'gzip-size' );
const mainUtils = require( '../utils' );
const minimist = require( 'minimist' );

const utils = {
	/**
	 * Parses command line arguments and returns them as a user-friendly hash.
	 *
	 * @returns {Object} options
	 * @returns {String} [options.config] Path to the bundle configuration file.
	 */
	parseArguments() {
		const options = minimist( process.argv.slice( 2 ), {
			string: [
				'config'
			]
		} );

		return options;
	},

	/**
	 * Render content for entry file which needs to be passed as main file to Rollup.
	 *
	 * @param {Object} data
	 * @param {String} [data.moduleName] Name of the editor class exposed in bundle. e.g. MyCKEditor.
	 * @param {String} [data.creator] Path to the editor creator as ClassicEditor, StandardEditor etc.
	 * @param {Array<String>} [data.features] List of paths or names to features which need to be included in bundle.
	 * @returns {string}
	 */
	renderEntryFileContent( data ) {
		const creatorName = path.basename( data.creator, '.js' );
		const creatorPath = path.relative( './tmp', data.creator );
		let featureNames = [];
		let template = `'use strict';\n\n`;

		// Imports babel helpers.
		template += `import '../node_modules/regenerator-runtime/runtime.js';\n`;

		// Imports editor creator
		template += `import ${ creatorName } from '${ creatorPath }';\n`;

		// Imports editor features.
		for ( let feature of data.features ) {
			const featureName = path.basename( feature, '.js' );
			const featurePath = path.relative( './tmp', feature );

			template += `import ${ featureName } from '${ featurePath }';\n`;
			featureNames.push( featureName );
		}

		// Class definition.
		template += `\nexport default class ${ data.moduleName } extends ${ creatorName } {
	static create( element, config = {} ) {
		if ( !config.features ) {
			config.features = [];
		}

		config.features = [ ...config.features, ${ featureNames.join( ', ' ) } ];

		return ${ creatorName }.create( element, config );
	}
}
`;

		return template;
	},

	/**
	 * Save files from stream in specific destination and add `.min` suffix to the name.
	 *
	 * @param {Stream} stream
	 * @param {String} destination path
	 * @returns {Stream}
	 */
	saveFileFromStreamAsMinified( stream, destination ) {
		return stream
			.pipe( gulpRename( {
				suffix: '.min'
			} ) )
			.pipe( gulp.dest( destination ) );
	},

	/**
	 * Copy specified file to specified destination.
	 *
	 * @param {String} from file path
	 * @param {String} to copied file destination
	 * @returns {Promise}
	 */
	copyFile( from, to ) {
		return new Promise( ( resolve ) => {
			gulp.src( from )
				.pipe( gulp.dest( to ) )
				.on( 'finish', resolve );
		} );
	},

	/**
	 * Get size of the file.
	 *
	 * @param {String} path path to the file
	 * @returns {Number} size size in bytes
	 */
	getFileSize( path ) {
		return fs.statSync( path ).size;
	},

	/**
	 * Get human readable gzipped size of the file.
	 *
	 * @param {String} path path to the file
	 * @returns {Number} size size in bytes
	 */
	getGzippedFileSize( path ) {
		return gzipSize.sync( fs.readFileSync( path ) );
	},

	/**
	 * Get normal and gzipped size of every passed file in specified directory.
	 *
	 * @param {Array<String>} files
	 * @param {String} [rootDir='']
	 * @returns {Array<Object>} List with file size data
	 */
	getFilesSizeStats( files, rootDir = '' ) {
		return files.map( ( file ) => {
			const filePath = path.join( rootDir, file );

			return {
				name: path.basename( filePath ),
				size: utils.getFileSize( filePath ),
				gzippedSize: utils.getGzippedFileSize( filePath )
			};
		} );
	},

	/**
	 * Print on console list of files with their size stats.
	 *
	 *        Title:
	 *        file.js: 1 MB (gzipped: 400 kB)
	 *        file.css 500 kB (gzipped: 100 kB)
	 *
	 * @param {String} title
	 * @param {Array<Object>} filesStats
	 */
	showFilesSummary( title, filesStats ) {
		const label = gutil.colors.underline( title );
		const filesSummary = filesStats.map( ( file ) => {
			return `${ file.name }: ${ prettyBytes( file.size ) } (gzipped: ${ prettyBytes( file.gzippedSize ) })`;
		} ).join( '\n' );

		gutil.log( gutil.colors.green( `\n${ label }:\n${ filesSummary }` ) );
	}
};

// Assign properties from top level utils.
module.exports = Object.assign( utils, mainUtils );
