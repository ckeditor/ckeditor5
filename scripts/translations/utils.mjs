/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import upath from 'upath';
import minimist from 'minimist';
import { globSync } from 'glob';
import replaceKebabCaseWithCamelCase from '../utils/replacekebabcasewithcamelcase.mjs';

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
			'ignore',
			'config'
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
			config: '',
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
export function getCKEditor5SourceFiles( { cwd, includeExternalDirectory, packages } ) {
	const patterns = [
		`packages/${ getGlobPatternForRequestedPackages( packages ) }/src/**/*.ts`
	];

	if ( includeExternalDirectory ) {
		patterns.push( `external/*/packages/${ getGlobPatternForRequestedPackages( packages ) }/src/**/*.ts` );
	}

	const globOptions = { cwd, absolute: true };

	return globSync( patterns, globOptions )
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
export function getCKEditor5PackagePaths( { cwd, includeExternalDirectory, packages } ) {
	const patterns = [
		`packages/${ getGlobPatternForRequestedPackages( packages ) }`
	];

	if ( includeExternalDirectory ) {
		patterns.push( `external/*/packages/${ getGlobPatternForRequestedPackages( packages ) }` );
	}

	return globSync( patterns, { cwd } )
		.flat()
		.map( srcPath => upath.normalize( srcPath ) );
}

/**
 * Creates glob pattern to match all requested packages. If no packages have been provided, the "*" wildcard is used to match all packages.
 * It supports full package name (e.g. "ckeditor5-table") or the name without the "ckeditor5-" prefix (e.g. "table").
 *
 * @param {Array.<String>} packages
 * @returns {String}
 */
function getGlobPatternForRequestedPackages( packages ) {
	if ( !packages.length ) {
		return '*';
	}

	const packageNames = packages
		.map( packageName => packageName.split( 'ckeditor5-' ).pop() )
		.join( '|' );

	return 'ckeditor5-@(' + packageNames + ')';
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
