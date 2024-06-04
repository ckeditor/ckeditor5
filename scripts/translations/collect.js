/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

const upath = require( 'upath' );
const { createPotFiles } = require( '@ckeditor/ckeditor5-dev-transifex' );
const {
	TRANSLATION_DIRECTORY_PATH,
	parseArguments,
	getCKEditor5SourceFiles,
	getCKEditor5PackagePaths,
	normalizePath
} = require( './utils' );

const CKEDITOR5_ROOT_PATH = upath.join( __dirname, '..', '..' );

main();

function main() {
	const options = parseArguments( process.argv.slice( 2 ) );

	return createPotFiles( {
		// An array containing absolute paths to CKEditor 5 source files.
		sourceFiles: getCKEditor5SourceFiles( options ),

		// Packages to process.
		packagePaths: getCKEditor5PackagePaths( options ),

		// A relative path to the `@ckeditor/ckeditor5-core` package where common translations are located.
		corePackagePath: upath.relative(
			options.cwd,
			upath.join( CKEDITOR5_ROOT_PATH, 'packages', 'ckeditor5-core' )
		),

		// Where to save translation files.
		translationsDirectory: normalizePath( options.cwd, TRANSLATION_DIRECTORY_PATH ),

		// Whether to hide unused context errors from the `@ckeditor/ckeditor5-core` package.
		// Required when only some of the common translations are used.
		ignoreUnusedCorePackageContexts: options.ignoreUnusedCorePackageContexts
	} );
}
