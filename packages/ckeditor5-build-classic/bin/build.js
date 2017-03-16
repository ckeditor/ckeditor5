#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const path = require( 'path' );
const tasks = require( '@ckeditor/ckeditor5-dev-bundler-webpack' );
const { logger, bundler } = require( '@ckeditor/ckeditor5-dev-utils' );
const getWebpackConfig = require( '@ckeditor/ckeditor5-dev-bundler-webpack/lib/utils/getwebpackconfig' );
const getWebpackEs6Config = require( '@ckeditor/ckeditor5-dev-bundler-webpack/lib/utils/getwebpackes6config' );
const buildConfig = require( '../build-config' );
const log = logger();
const entryPoint = 'ckeditor.js';

log.info( 'Creating an entry file...' );

bundler.createEntryFile( entryPoint, {
	plugins: buildConfig.plugins,
	moduleName: buildConfig.moduleName,
	editor: buildConfig.editor,
	config: buildConfig.editorConfig,
} );

const cwd = path.join( __dirname, '..' );
const webpackParams = {
	cwd,
	moduleName: buildConfig.moduleName,
	entryPoint: path.join( cwd, entryPoint ),
	destinationPath: path.join( cwd, buildConfig.destinationPath )
};
const webpackEs6Config = getWebpackEs6Config( webpackParams );
const webpackConfig = getWebpackConfig( webpackParams );

log.info( `Creating the "ES5" and "ES6" builds...` );

Promise.all( [
		tasks.runWebpack( webpackEs6Config ).then( () => log.info( 'The "ES6" build has been created.' ) ),
		tasks.runWebpack( webpackConfig ).then( () => log.info( 'The "ES5" build has been created.' ) )
	] )
	.then( () => {
		log.info( 'Finished.' );
	} )
	.catch( ( err ) => {
		process.exitCode = -1;

		log.error( err );
	} );
