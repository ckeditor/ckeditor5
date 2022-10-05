/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

const path = require( 'path' );
const fs = require( 'fs' );
const minimist = require( 'minimist' );
const glob = require( 'glob' );

const TRANSLATION_DIRECTORY_PATH = 'build/.transifex';

module.exports = {
	TRANSLATION_DIRECTORY_PATH,
	parseArguments,
	getCKEditor5SourceFiles,
	getCKEditor5PackagePaths,
	getCKEditor5PackageNames,
	normalizePath
};

/**
 * Parses CLI arguments and prepares configuration for the crawler.
 *
 * @param {Array.<String>} args CLI arguments and options.
 * @returns {TranslationOptions} options
 */
function parseArguments( args ) {
	const config = {
		string: [
			'cwd',
			'packages',
			'ignore'
		],

		boolean: [
			'include-external-directory'
		],

		default: {
			cwd: process.cwd(),
			packages: [],
			ignore: [],
			'include-external-directory': false
		}
	};

	const options = minimist( args, config );

	// Convert to camelCase.
	options.includeExternalDirectory = options[ 'include-external-directory' ];
	delete options[ 'include-external-directory' ];

	// Normalize the current work directory path.
	options.cwd = normalizePath( path.resolve( options.cwd ) );

	// Convert packages to an array.
	if ( typeof options.packages === 'string' ) {
		options.packages = options.packages.split( ',' );
	}

	// Convert packages to skip to an array.
	if ( typeof options.ignore === 'string' ) {
		options.ignore = options.ignore.split( ',' );
	}

	return options;
}

/**
 * Returns absolute paths to CKEditor 5 sources. Files located in the `src/lib/` directory are excluded.
 *
 * @param {TranslationOptions} options
 * @returns {Array.<String>}
 */
function getCKEditor5SourceFiles( { cwd, includeExternalDirectory } ) {
	const patterns = [
		'packages/*/src/**/*.[jt]s'
	];

	if ( includeExternalDirectory ) {
		patterns.push( 'external/*/packages/*/src/**/*.[jt]s' );
	}

	const globOptions = { cwd, absolute: true };

	return patterns.map( item => glob.sync( item, globOptions ) )
		.flat()
		.filter( srcPath => !srcPath.match( /packages\/[^/]+\/src\/lib\// ) );
}

/**
 * Returns relative paths to CKEditor 5 packages. By default the function does not check the `external/` directory.
 *
 * @param {TranslationOptions} options
 * @returns {Array.<String>}
 */
function getCKEditor5PackagePaths( { cwd, includeExternalDirectory } ) {
	const patterns = [
		'packages/*'
	];

	if ( includeExternalDirectory ) {
		patterns.push( 'external/*/packages/*' );
	}

	return patterns.map( item => glob.sync( item, { cwd } ) ).flat();
}

/**
 * Returns an array of entries containing the package's name (resource) used on the Transifex service and a relative path
 * to the package on a file system. The relative path depends on the `transifexProcess` argument.
 *
 * When uploading translations, returned path points to a directory containing translation sources.
 * For the download process, it points to a directory containing the source code.
 *
 * @param {'upload'|'download'} transifexProcess A control flag.
 * @param {TranslationOptions} options
 * @return {Array.<CKEditor5Entry>}
 */
function getCKEditor5PackageNames( transifexProcess, { cwd, packages, ignore } ) {
	const packagesPath = normalizePath( cwd, 'packages' );

	return fs.readdirSync( packagesPath )
		.filter( item => item.startsWith( 'ckeditor5-' ) )
		.filter( item => {
			// If no packages to process have been specified, handle all found.
			if ( packages.length === 0 ) {
				return true;
			}

			// Otherwise, process only specified packages.
			return packages.includes( item );
		} )
		.map( packageName => {
			let resourceName = packageName;

			if ( packageName === 'ckeditor5-letters' ) {
				resourceName = 'letters';
			}

			let absolutePath;

			if ( transifexProcess === 'upload' ) {
				absolutePath = normalizePath( cwd, TRANSLATION_DIRECTORY_PATH, packageName );
			} else if ( transifexProcess === 'download' ) {
				absolutePath = normalizePath( cwd, 'packages', packageName );
			}

			const relativePath = path.posix.relative( cwd, absolutePath );

			return [ resourceName, relativePath ];
		} )
		.filter( ( [ packageName ] ) => {
			if ( ignore.includes( packageName ) ) {
				return false;
			}

			return true;
		} );
}

/**
 * Returns a path that always uses the UNIX separator for directories.
 *
 * @param {Array.<String>} values
 * @returns {String}
 */
function normalizePath( ...values ) {
	return values.join( '/' ).split( /[\\/]/g ).join( '/' );
}

/**
 * @typedef {Object} TranslationOptions
 *
 * @property {String} cwd An absolute path to the root directory from which a command is called.
 *
 * @property {Array.<String>} packages Package names to be processed. If empty, all found packages will be processed.
 *
 * @property {Array.<String>} [ignore] Name of packages that should be skipped while processing then.
 *
 * @property {Boolean} includeExternalDirectory Whether to look for packages located in the `external/` directory.
 */

/**
 * @typedef {[String, String]} CKEditor5Entry
 *
 * The first element of the array represents a package (resource) name in the Transifex service.
 * The second element of the array represents a relative path where to look for translations source.
 */
