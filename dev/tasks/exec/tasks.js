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
 * Run task over ckeditor5 repositories.
 *
 * Example:

 *		gulp exec --task task-name
 *
 * Example of running task just for one repository:

 *		gulp exec --task task-name --repository ckeditor5-utils
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
			const parameters = minimist( process.argv.slice( 3 ), {
				stopEarly: false,
			} );
			let task;

			try {
				if ( parameters.task ) {
					task = require( `./functions/${ parameters.task }` );
				} else {
					throw new Error( 'Missing task parameter: --task task-name' );
				}
			} catch ( error ) {
				log.err( error );
			}

			return execute( task, ckeditor5Path, packageJSON, config.WORKSPACE_DIR, parameters );
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
 * @param {Object} packageJSON Parsed package.json file from CKEditor5 repository.
 * @param {String} workspaceRoot Relative path to workspace root.
 * @param {Object} parameters Parameters provided to the task via command-line.
 * @returns {Stream} Merged stream of processed files.
 */
function execute( execTask, ckeditor5Path, packageJSON, workspaceRoot, parameters ) {
	const workspacePath = path.join( ckeditor5Path, workspaceRoot );
	const mergedStream = merge();
	const specificRepository = parameters.repository;

	let devDirectories = ckeditor5Dirs.getDevDirectories( workspacePath, packageJSON, ckeditor5Path );

	if ( specificRepository ) {
		devDirectories = devDirectories.filter( ( dir ) => {
			return dir.repositoryURL === `ckeditor/${ specificRepository }`;
		} );
	}

	for ( let dir of devDirectories ) {
		try {
			log.out( `Executing task on ${ dir.repositoryURL }...` );
			mergedStream.add( execTask( dir.repositoryPath, parameters ) );
		} catch ( error ) {
			log.err( error );
		}
	}

	return mergedStream;
}
