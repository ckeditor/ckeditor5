/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* eslint-env node */

import path from 'path';
import { fileURLToPath } from 'url';
import module from 'module';
import { builds } from '@ckeditor/ckeditor5-dev-utils';
import webpack from 'webpack';

const require = module.createRequire( import.meta.url );
const __filename = fileURLToPath( import.meta.url );
const __dirname = path.dirname( __filename );

export default builds.getDllPluginWebpackConfig( webpack, {
	themePath: require.resolve( '@ckeditor/ckeditor5-theme-lark' ),
	packagePath: __dirname,
	manifestPath: require.resolve( 'ckeditor5/build/ckeditor5-dll.manifest.json' ),
	isDevelopmentMode: process.argv.includes( '--mode=development' ),
	tsconfigPath: require.resolve( 'ckeditor5/tsconfig.dll.json' )
} );
