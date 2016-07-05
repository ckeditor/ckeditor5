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
const tools = require( '../../utils/tools' );
const git = require( '../../utils/git' );

/**
 * Run task over ckeditor5 repositories.
 * Example:
 *	 gulp exec --task task-name
 * Example of running task just for one repository:
 *   gulp exec --task task-name --one-repo
 *
 * @param {Object} config Task runner configuration.
 * @returns {Stream} Stream with processed files.
 */
module.exports = function tasks( config ) {
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

			if ( task ) {
				return execute( task, ckeditor5Path, packageJSON, config.WORKSPACE_DIR, parameters );
			}
		},

		register() {
			gulp.task( 'exec', tasks.execOnRepositories );
		}
	};

	return tasks;
};

/**
 * @param {Function} execTask Task to use on each dependency.
 * @param {String} ckeditor5Path Path to main CKEditor5 repository.
 * @param {Object} packageJSON Parsed package.json file from CKEditor5 repository.
 * @param {String} workspaceRoot Relative path to workspace root.
 * @param {Object} parameters Parameters provided to the task via command-line.
 */
function execute( execTask, ckeditor5Path, packageJSON, workspaceRoot, parameters ) {
	const workspaceAbsolutePath = path.join( ckeditor5Path, workspaceRoot );
	const oneRepository = parameters[ 'one-repo' ];
	// Get all CKEditor dependencies from package.json.
	const dependencies = tools.getCKEditorDependencies( packageJSON.dependencies );
	const mergedStream = merge();

	if ( dependencies ) {
		const directories = tools.getCKE5Directories( workspaceAbsolutePath );

		if ( directories.length ) {
			for ( let dependency in dependencies ) {
				const repositoryURL = dependencies[ dependency ];
				const urlInfo = git.parseRepositoryUrl( repositoryURL );
				const repositoryAbsolutePath = path.join( ckeditor5Path, 'node_modules', dependency );

				// Check if repository's directory already exists.
				if ( directories.indexOf( urlInfo.name ) > -1 ) {
					try {
						log.out( `Executing task on ${ repositoryURL }...` );

						mergedStream.add( execTask( repositoryAbsolutePath, parameters ) );
					} catch ( error ) {
						log.err( error );
					}
				}

				if ( oneRepository ) {
					return;
				}
			}
		} else {
			log.out( 'No CKEditor5 plugins in development mode.' );
		}
	} else {
		log.out( 'No CKEditor5 dependencies found in package.json file.' );
	}

	return mergedStream;
}
