#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const webpack = require( 'webpack' );
const tasks = require( '@ckeditor/ckeditor5-dev-bundler-rollup' );

const config = require( '../build-config' );
const getWebpackEs6Config = require( '../dev/webpackEs6Config' );
const getWebpackConfig = require( '../dev/webpackConfig' );

console.log( 'Creating an entry file...' );

tasks.createEntryFile( '.', {
	plugins: config.plugins,
	moduleName: config.moduleName,
	editor: config.editor,
	config: config.editorConfig,
} );

const webpackEs6Config = getWebpackEs6Config( config.destinationPath, config.moduleName );
const webpackConfig = getWebpackConfig( config.destinationPath, config.moduleName );

Promise.all( [
		runWebpack( webpackEs6Config, 'ES6' ),
		runWebpack( webpackConfig, 'ES5' ),
	] )
	.then( () => {

	} )
	.catch( ( err ) => {
		process.exitCode = -1;

		console.log( err );
	} );

function runWebpack( webpackConfig, label ) {
	console.log( `Creating an ${ label } build...` );

	return new Promise( ( resolve, reject ) => {
		webpack( webpackConfig, ( err ) => {
			if ( err ) {
				return reject( err );
			}

			console.log( `The ${ label } build has been created.` );
			return resolve();
		} );
	} );
}
