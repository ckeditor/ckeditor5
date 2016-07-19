/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const gulp = require( 'gulp' );
const minimist = require( 'minimist' );
const path = require( 'path' );
const merge = require( 'merge-stream' );
const log = require( '../../utils/log' );
const ckeditor5Dirs = require( '../../utils/ckeditor5-dirs' );

/**
 * Run task over `ckeditor5-*` repositories.
 *
 * Example:
 *
 *		gulp exec --task task-name
 *
 * Example of running task just for one repository:
 *
 *		gulp exec --task task-name --repository ckeditor5-utils
 *
 * Example of running task including root `ckeditor5` package
 *
 *		gulp exec --task task-name --include-root
 *
 * @param {Object} config Task runner configuration.
 * @returns {Stream} Stream with processed files.
 */
module.exports = ( config ) => {
	const ckeditor5Path = process.cwd();
	const packageJSON = require( '../../../package.json' );

	const tasks = {
		execOnRepositories() {
			// Omit `gulp exec` part of arguments
			const params = minimist( process.argv.slice( 3 ), {
				stopEarly: false,
			} );
			let task;

			try {
				if ( params.task ) {
					task = require( `./functions/${ params.task }` );
				} else {
					throw new Error( 'Missing task parameter: --task task-name' );
				}
			} catch ( err ) {
				log.err( err );

				return;
			}

			return execute( task, ckeditor5Path, packageJSON, config.WORKSPACE_DIR, params );
		},

		register() {
			gulp.task( 'exec', tasks.execOnRepositories );
		}
	};

	return tasks;
};

/**
 * Execute given task with provided options and command-line parameters.
 *
 * @param {Function} execTask Task to use on each dependency.
 * @param {String} ckeditor5Path Path to main CKEditor5 repository.
 * @param {Object} packageJSON Parsed `package.json` file from CKEditor 5 repository.
 * @param {String} workspaceRoot Relative path to workspace root.
 * @param {Object} params Parameters provided to the task via command-line.
 * @returns {Stream} Merged stream of processed files.
 */
function execute( execTask, ckeditor5Path, packageJSON, workspaceRoot, params ) {
	const workspacePath = path.join( ckeditor5Path, workspaceRoot );
	const mergedStream = merge();
	const specificRepository = params.repository;
	const includeRoot = !!params[ 'include-root' ];

	let devDirectories = ckeditor5Dirs.getDevDirectories( workspacePath, packageJSON, ckeditor5Path, includeRoot );

	if ( specificRepository ) {
		devDirectories = devDirectories.filter( ( dir ) => {
			return dir.repositoryURL === `ckeditor/${ specificRepository }`;
		} );
	}

	for ( const dir of devDirectories ) {
		try {
			log.out( `Executing task on ${ dir.repositoryURL }...` );

			const result = execTask( dir.repositoryPath, params );

			if ( result ) {
				mergedStream.add( result );
			}
		} catch ( err ) {
			log.err( err );
		}
	}

	return mergedStream;
}
