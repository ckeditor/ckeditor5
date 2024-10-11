/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

import upath from 'upath';
import minimist from 'minimist';
import { globSync } from 'glob';

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
			'validate-only',
			'skip-license-header'
		],

		default: {
			cwd: process.cwd(),
			packages: [],
			ignore: [],
			'include-external-directory': false,
			'ignore-unused-core-package-contexts': false,
			'validate-only': false,
			'skip-license-header': false
		}
	};

	const options = minimist( args, config );

	// Convert to camelCase.
	replaceKebabCaseWithCamelCase( options, [
		'include-external-directory',
		'ignore-unused-core-package-contexts',
		'validate-only',
		'skip-license-header'
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
 * @property {Array.<String>} ignore Name of packages that should be skipped while processing then.
 *
 * @property {Boolean} includeExternalDirectory Whether to look for packages located in the `external/` directory.
 *
 * @property {Boolean} ignoreUnusedCorePackageContexts Whether to allow having unused contexts by the `ckeditor5-core` package.
 *
 * @property {Boolean} validateOnly Whether to validate the translation contexts against the source messages only. No files will be updated.
 *
 * @property {Boolean} skipLicenseHeader Whether to skip adding the license header to newly created translation files.
 */
