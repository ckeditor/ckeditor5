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
 * @returns {Stream} Merged stream of processed files.
 */
function execute( execTask, ckeditor5Path, packageJSON, workspaceRoot, parameters ) {
	const workspacePath = path.join( ckeditor5Path, workspaceRoot );
	const devDirectories = getCKE5DevDirectories( workspacePath, packageJSON, ckeditor5Path );
	const shouldRunOnce = parameters[ 'one-repo' ];
	const mergedStream = merge();

	for ( let i = 0, len = devDirectories.length; i < len; i++ ) {
		const devDir = devDirectories[i];

		try {
			log.out( `Executing task on ${ devDir.repositoryURL }...` );
			mergedStream.add( execTask( devDir.repositoryPath, parameters ) );
		} catch ( error ) {
			log.err( error );
		}

		if ( shouldRunOnce ) {
			break;
		}
	}

	return mergedStream;
}

/**
 * Returns array with information about ckeditor5-* directories/repositories.
 *
 * @param {String} workspacePath Absolute path to workspace.
 * @param {Object} packageJSON Contents of ckeditor5 repo package.json file.
 * @param {String} ckeditor5Path Absolute path to ckeditor5 root directory.
 * @returns {Array} Array of objects.
 */
function getCKE5DevDirectories( workspacePath, packageJSON, ckeditor5Path ) {
	const directories = tools.getCKE5Directories( workspacePath );
	const dependencies = tools.getCKEditorDependencies( packageJSON.dependencies );

	let devDirectories = [];

	for ( let dependency in dependencies ) {
		const repositoryURL = dependencies[ dependency ];
		const urlInfo = git.parseRepositoryUrl( repositoryURL );
		const repositoryPath = path.join( ckeditor5Path, 'node_modules', dependency );

		// Check if repository's directory already exists.
		if ( directories.indexOf( urlInfo.name ) > -1 ) {
			devDirectories.push( {
				repositoryPath,
				repositoryURL
			} );
		}
	}

	return devDirectories;
}
