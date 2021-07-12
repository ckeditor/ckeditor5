/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

'use strict';

/* eslint-env node */

const { builds } = require( '@ckeditor/ckeditor5-dev-utils' );

module.exports = builds.getDllPluginWebpackConfig( {
	themePath: require.resolve( '@ckeditor/ckeditor5-theme-lark' ),
	packagePath: __dirname,
	manifestPath: require.resolve( 'ckeditor5/build/ckeditor5-dll.manifest.json' ),
	isDevelopmentMode: process.argv.includes( '--dev' )
} );
