/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

'use strict';

/* eslint-env node */

const { builds } = require( '@ckeditor/ckeditor5-dev-utils' );
const webpack = require( 'webpack' );

module.exports = builds.getDllPluginWebpackConfig( webpack, {
	themePath: require.resolve( '@ckeditor/ckeditor5-theme-lark' ),
	packagePath: __dirname,
	dependencies: [
		'@ckeditor/ckeditor5-core',
		'@ckeditor/ckeditor5-ui',
		'@ckeditor/ckeditor5-utils'
	],
	isDevelopmentMode: process.argv.includes( '--mode=development' ),
	tsconfigPath: require.resolve( 'ckeditor5/tsconfig.dll.json' )
} );
