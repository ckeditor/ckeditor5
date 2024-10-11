/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

import upath from 'upath';
import fs from 'fs';
import minimist from 'minimist';
import { globSync } from 'glob';

export const TRANSLATION_DIRECTORY_PATH = 'build/.transifex';

/**
 * Parses CLI arguments and prepares configuration for the crawler.
 *
 * @param {Array.<String>} args CLI arguments and options.
 * @returns {TranslationOptions} options
 */
export function parseArguments( args ) {
	const config = {
		string: [
			'cwd',
			'packages',
			'ignore'
		],

		boolean: [
			'include-external-directory',
			'ignore-unused-core-package-contexts',
			'validate-only'
		],

		default: {
			cwd: process.cwd(),
			packages: [],
			ignore: [],
			'include-external-directory': false,
			'ignore-unused-core-package-contexts': false,
			'validate-only': false
		}
	};

	const options = minimist( args, config );

	// Convert to camelCase.
	replaceKebabCaseWithCamelCase( options, [
		'include-external-directory',
		'ignore-unused-core-package-contexts',
		'validate-only'
	] );

	// Normalize the current work directory path.
	options.cwd = upath.resolve( options.cwd );

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
 * Returns absolute paths to CKEditor 5 sources. Files located in the `src/lib/` directory and TypeScript declaration files are excluded.
 *
 * @param {TranslationOptions} options
 * @returns {Array.<String>}
 */
export function getCKEditor5SourceFiles( { cwd, includeExternalDirectory } ) {
	const patterns = [
		'packages/*/src/**/*.[jt]s'
	];

	if ( includeExternalDirectory ) {
		patterns.push( 'external/*/packages/*/src/**/*.[jt]s' );
	}

	const globOptions = { cwd, absolute: true };

	return patterns
		.map( item => globSync( item, globOptions ) )
		.flat()
		.map( srcPath => upath.normalize( srcPath ) )
		.filter( srcPath => !srcPath.match( /packages\/[^/]+\/src\/lib\// ) )
		.filter( srcPath => !srcPath.endsWith( '.d.ts' ) );
}

/**
 * Returns relative paths to CKEditor 5 packages. By default the function does not check the `external/` directory.
 *
 * @param {TranslationOptions} options
 * @returns {Array.<String>}
 */
export function getCKEditor5PackagePaths( { cwd, includeExternalDirectory } ) {
	const patterns = [
		'packages/*'
	];

	if ( includeExternalDirectory ) {
		patterns.push( 'external/*/packages/*' );
	}

	return patterns
		.map( item => globSync( item, { cwd } ) )
		.flat()
		.map( srcPath => upath.normalize( srcPath ) );
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
export function getCKEditor5PackageNames( transifexProcess, { cwd, packages, ignore } ) {
	const packagesPath = upath.join( cwd, 'packages' );

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
				absolutePath = upath.join( cwd, TRANSLATION_DIRECTORY_PATH, packageName );
			} else if ( transifexProcess === 'download' ) {
				absolutePath = upath.join( cwd, 'packages', packageName );
			}

			const relativePath = upath.relative( cwd, absolutePath );

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
export function normalizePath( ...values ) {
	return values.join( '/' ).split( /[\\/]/g ).join( '/' );
}

/**
 * Replaces all kebab-case keys in the `options` object with camelCase entries.
 * Kebab-case keys will be removed.
 *
 * @param {object} options
 * @param {Array.<string>} keys Kebab-case keys in `options` object.
 */
function replaceKebabCaseWithCamelCase( options, keys ) {
	for ( const key of keys ) {
		const camelCaseKey = toCamelCase( key );

		options[ camelCaseKey ] = options[ key ];
		delete options[ key ];
	}
}

/**
 * Returns a camelCase value for specified kebab-case `value`.
 *
 * @param {string} value Kebab-case string.
 * @returns {string}
 */
function toCamelCase( value ) {
	return value.split( '-' )
		.map( ( item, index ) => {
			if ( index == 0 ) {
				return item.toLowerCase();
			}

			return item.charAt( 0 ).toUpperCase() + item.slice( 1 ).toLowerCase();
		} )
		.join( '' );
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
 *
 * @property {Boolean} ignoreUnusedCorePackageContexts Whether to allow having unused contexts by the `ckeditor5-core` package.
 */

/**
 * @typedef {[String, String]} CKEditor5Entry
 *
 * The first element of the array represents a package (resource) name in the Transifex service.
 * The second element of the array represents a relative path where to look for translations source.
 */
