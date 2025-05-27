/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import upath from 'upath';
import { synchronizeTranslations } from '@ckeditor/ckeditor5-dev-translations';
import { CKEDITOR5_ROOT_PATH } from '../constants.mjs';
import {
	parseArguments,
	getCKEditor5SourceFiles,
	getCKEditor5PackagePaths
} from './utils.mjs';

main();

function main() {
	const options = parseArguments( process.argv.slice( 2 ) );

	return synchronizeTranslations( {
		// An array containing absolute paths to CKEditor 5 source files.
		sourceFiles: getCKEditor5SourceFiles( options ),

		// Packages to process.
		packagePaths: getCKEditor5PackagePaths( options ),

		// A relative path to the `@ckeditor/ckeditor5-core` package where common translations are located.
		corePackagePath: upath.relative(
			options.cwd,
			upath.join( CKEDITOR5_ROOT_PATH, 'packages', 'ckeditor5-core' )
		),

		// Whether to hide unused context errors from the `@ckeditor/ckeditor5-core` package.
		// Required when only some of the common translations are used.
		ignoreUnusedCorePackageContexts: options.ignoreUnusedCorePackageContexts,

		// Whether to validate the translations contexts against the source messages only. No files will be updated.
		validateOnly: options.validateOnly,

		// Whether to skip adding the license header to newly created translation files.
		skipLicenseHeader: options.skipLicenseHeader
	} );
}
