/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { fileURLToPath } from 'url';
import webpack from 'webpack';
import { builds } from '@ckeditor/ckeditor5-dev-utils';

export default builds.getDllPluginWebpackConfig( webpack, {
	themePath: fileURLToPath( import.meta.resolve( '@ckeditor/ckeditor5-theme-lark' ) ),
	packagePath: import.meta.dirname,
	manifestPath: fileURLToPath( import.meta.resolve( 'ckeditor5/build/ckeditor5-dll.manifest.json' ) ),
	isDevelopmentMode: process.argv.includes( '--mode=development' ),
	tsconfigPath: fileURLToPath( import.meta.resolve( 'ckeditor5/tsconfig.dll.json' ) )
} );
