/* jshint node: true, esnext: true */

'use strict';

const gulp = require( 'gulp' );
const minimist = require( 'minimist' );
const statusTask = require( './tasks/dev-status' );
const initTask = require( './tasks/dev-init' );
const installTask = require( './tasks/dev-install' );
const pluginCreateTask = require( './tasks/dev-package-create' );
const updateTask = require( './tasks/dev-update' );
const relinkTask = require( './tasks/dev-relink' );

module.exports = ( config ) => {
	const ckeditor5Path = process.cwd();
	const packageJSON = require( '../../../package.json' );

	gulp.task( 'dev-init', () => {
		initTask( installTask, ckeditor5Path, packageJSON, config.WORKSPACE_DIR, console.log );
	} );

	gulp.task( 'dev-package-create', ( done ) => {
		pluginCreateTask( ckeditor5Path, config.WORKSPACE_DIR, console.log )
			.then( done )
			.catch( ( error )  => done( error ) );
	} );

	gulp.task( 'dev-update', () => {
		const options = minimist( process.argv.slice( 2 ), {
			boolean: [ 'npm-update' ],
			default: {
				'npm-update': false
			}
		} );

		updateTask( ckeditor5Path, packageJSON, config.WORKSPACE_DIR, console.log, options[ 'npm-update' ] );
	} );

	gulp.task( 'dev-status', () => {
		statusTask( ckeditor5Path, packageJSON, config.WORKSPACE_DIR, console.log, console.error );
	} );

	gulp.task( 'dev-relink', () => {
		relinkTask( ckeditor5Path, packageJSON, config.WORKSPACE_DIR, console.log, console.error );
	} );

	gulp.task( 'dev-install', () => {
		const options = minimist( process.argv.slice( 2 ), {
			string: [ 'package' ],
			default: {
				plugin: ''
			}
		} );

		if ( options.package ) {
			installTask( ckeditor5Path, config.WORKSPACE_DIR, options.package, console.log );
		} else {
			throw new Error( 'Please provide a package to install: gulp dev-install --plugin <path|GitHub URL|name>' );
		}
	} );
};
