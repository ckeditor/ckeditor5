#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const path = require( 'path' );
const webpack = require( 'webpack' );
const { logger, bundler } = require( '@ckeditor/ckeditor5-dev-utils' );
const webpackUtils = require( '@ckeditor/ckeditor5-dev-webpack-utils' );
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

const packageRoot = path.join( __dirname, '..' );
const ckeditor5Root = path.join( packageRoot, '..', '..' );
const webpackParams = {
	cwd: ckeditor5Root,
	moduleName: buildConfig.moduleName,
	entryPoint: path.join( packageRoot, entryPoint ),
	destinationPath: path.join( packageRoot, buildConfig.destinationPath )
};
const webpackES6Config = webpackUtils.getWebpackES6Config( webpackParams );
const webpackConfig = webpackUtils.getWebpackConfig( webpackParams );

log.info( `Creating the "ES5" and "ES6" builds...` );

Promise.all( [
		runWebpack( webpackES6Config ).then( () => log.info( 'The "ES6" build has been created.' ) ),
		runWebpack( webpackConfig ).then( () => log.info( 'The "ES5" build has been created.' ) )
	] )
	.then( () => {
		log.info( 'Finished.' );
	} )
	.catch( ( err ) => {
		process.exitCode = -1;

		log.error( err );
	} );

function runWebpack( config ) {
	return new Promise( ( resolve, reject ) => {
		webpack( config, ( err ) => {
			if ( err ) {
				return reject( err );
			}

			return resolve();
		} );
	} );
}
