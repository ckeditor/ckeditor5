/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const gulp = require( 'gulp' );
const minimist = require( 'minimist' );

const exec = require( './tasks/exec' );

const log = require( './utils/log' );
const gutil = require( 'gulp-util' );
// const through = require( 'through2' );

module.exports = ( config ) => {
	const ckeditor5Path = process.cwd();
	const packageJSON = require( '../../../package.json' );

	// Configure logging.
	log.configure(
		( msg ) => gutil.log( msg ),
		( msg ) => gutil.log( gutil.colors.red( msg ) )
	);

	const tasks = {
		execOnRepositories() {
			// Omit `gulp exec` part of arguments
			const options = minimist( process.argv.slice( 3 ), {
				alias: { t: 'task' },
				stopEarly: false
			} );

			let execTask;

			try {
				execTask = require( `./functions/${ options.task }` );
			}
			catch ( error ) {
				log.err( error );
			}

			if ( execTask ) {
				return exec( execTask, ckeditor5Path, packageJSON, config.WORKSPACE_DIR, options );
			}
		},

		register() {
			gulp.task( 'exec', tasks.execOnRepositories );
		}
	};

	return tasks;
};
