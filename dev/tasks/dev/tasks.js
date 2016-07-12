/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const gulp = require( 'gulp' );
const minimist = require( 'minimist' );
const statusTask = require( './tasks/status' );
const initTask = require( './tasks/init' );
const installTask = require( './tasks/install' );
const pluginCreateTask = require( './tasks/create-package' );
const updateTask = require( './tasks/update' );
const relinkTask = require( './tasks/relink' );

module.exports = ( config ) => {
	const ckeditor5Path = process.cwd();
	const packageJSON = require( '../../../package.json' );
	const tasks = {
		updateRepositories() {
			const options = minimist( process.argv.slice( 2 ), {
				boolean: [ 'npm-update' ],
				default: {
					'npm-update': false
				}
			} );

			return updateTask( installTask, ckeditor5Path, packageJSON, config.WORKSPACE_DIR, options[ 'npm-update' ] );
		},

		checkStatus() {
			return statusTask( ckeditor5Path, packageJSON, config.WORKSPACE_DIR );
		},

		initRepository() {
			return initTask( installTask, ckeditor5Path, packageJSON, config.WORKSPACE_DIR );
		},

		createPackage( done ) {
			pluginCreateTask( ckeditor5Path, config.WORKSPACE_DIR )
				.then( done )
				.catch( ( error ) => done( error ) );
		},

		relink() {
			return relinkTask( ckeditor5Path, packageJSON, config.WORKSPACE_DIR );
		},

		installPackage() {
			const options = minimist( process.argv.slice( 2 ), {
				string: [ 'package' ],
				default: {
					plugin: ''
				}
			} );

			if ( options.package ) {
				return installTask( ckeditor5Path, config.WORKSPACE_DIR, options.package );
			} else {
				throw new Error( 'Please provide a package to install: gulp dev-install --plugin <path|GitHub URL|name>' );
			}
		},

		register() {
			gulp.task( 'init', tasks.initRepository );
			gulp.task( 'create-package', tasks.createPackage );
			gulp.task( 'update', tasks.updateRepositories );
			gulp.task( 'pull', tasks.updateRepositories );
			gulp.task( 'status', tasks.checkStatus );
			gulp.task( 'st', tasks.checkStatus );
			gulp.task( 'relink', tasks.relink );
			gulp.task( 'install', tasks.installPackage );
		}
	};

	return tasks;
};
