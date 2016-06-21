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
			const options = minimist( process.argv.slice( 2 ), {
				boolean: [ 'dry-run' ],
				default: {
					'dry-run': true
				}
			} );

			const installTask = () => {};

			return exec( installTask, ckeditor5Path, packageJSON, config.WORKSPACE_DIR, options[ 'dry-run' ] );
		},

		register() {
			gulp.task( 'exec', tasks.execOnRepositories );
		}
	};

	return tasks;
};
