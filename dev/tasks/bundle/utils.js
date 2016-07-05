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
	 * When module path is not relative then treat this path as a path to the one of the ckeditor5 default module
	 * (relative to ./bundle/exnext/ckedotir5) and add prefix `./build/esnext/ckeditor5/` to this path.
	 *
	 * @param {String} modulePath Path the ckeditor5 module.
	 */
	getFullPath( modulePath ) {
		// If path is not a relative path (no leading ./ or ../).
		if ( modulePath.charAt( 0 ) != '.' ) {
			return `./${ path.join( 'build/esnext/ckeditor5', modulePath ) }`;
		}

		return modulePath;
	},

	/**
	 * Resolves a simplified plugin name to a real path if only name is passed.
	 * E.g. 'delete' will be transformed to './build/esnext/ckeditor5/delete/delete.js'.
	 *
	 * @param {String} name
	 * @returns {String} Path to the module.
	 */
	getPluginPath( name ) {
		if ( name.indexOf( '/' ) >= 0 ) {
			return utils.getFullPath( name );
		}

		return utils.getFullPath( `${ name }/${ name }.js` );
	},

	/**
	 * Transform first letter of passed string to the upper case.
	 *
	 * @params {String} string String that will be transformed.
	 * @returns {String} Transformed string.
	 */
	capitalize( string ) {
		return string.charAt( 0 ).toUpperCase() + string.slice( 1 );
	},

	/**
	 * Render content for entry file which needs to be passed as main file to the Rollup.
	 *
	 * @param {String} dir Path to the entryfile directory. Import paths need to be relative to this directory.
	 * @param {Object} data Configuration object.
	 * @param {String} [data.moduleName] Name of the editor class exposed as global variable by bundle. e.g. MyCKEditor.
	 * @param {String} [data.editor] Path to the editor version e.g. `classic-editor/classic.js`.
	 * @param {Array.<String>} [data.features] List of paths or names to features which need to be included in bundle.
	 * @returns {string}
	 */
	renderEntryFileContent( dir, data ) {
		const creatorName = utils.capitalize( path.basename( data.editor, '.js' ) );
		const creatorPath = path.relative( dir, utils.getFullPath( data.editor ) );
		let featureNames = [];

		function renderPluginImports( features = [] ) {
			let templateFragment = '';

			for ( let feature of features ) {
				feature = utils.getPluginPath( feature );

				const featurePath = path.relative( dir, feature );

				// Generate unique feature name.
				// In case of two ore more features will have the same name but different path
				// 		'typing', 'path/to/other/plugin/typing'
				let featureName = utils.capitalize( path.basename( feature, '.js' ) );
				let i = 0;

				while ( featureNames.indexOf( featureName ) >= 0 ) {
					featureName = utils.capitalize( path.basename( feature, `.js` ) ) + ( ++i ).toString();
				}

				templateFragment += `import ${ featureName } from '${ featurePath }';\n`;
				featureNames.push( featureName );
			}

			return templateFragment;
		}

		return `
'use strict';

// Babel helpers.
import '${ path.relative( dir, 'node_modules/regenerator-runtime/runtime.js' ) }';

import ${ creatorName } from '${ creatorPath }';
${ renderPluginImports( data.features ) }

export default class ${ data.moduleName } extends ${ creatorName } {
	static create( element, config = {} ) {
		if ( !config.features ) {
			config.features = [];
		}

		config.features = [ ...config.features, ${ featureNames.join( ', ' ) } ];

		return ${ creatorName }.create( element, config );
	}
}
`;
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
	 * @param {Array.<String>} files
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
	 * @param {Array.<Object>} filesStats
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
