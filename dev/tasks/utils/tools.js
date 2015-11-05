'use strict';

var dirtyFiles,
	ignoreList;

var repositoryRegExp = /^(ckeditor\/[^#]+)(?:#)?(.*)/;
var directoryRegExp = /^ckeditor5/;

module.exports = {
	/**
	 * Check if a task (including its optional target) is in the queue of tasks to be executed by Grunt.
	 *
	 * @param grunt {Object} The Grunt object.
	 * @param task {String} The task name. May optionally include the target (e.g. 'task:target').
	 * @returns {Boolean} "true" if the task is in the queue.
	 */
	checkTaskInQueue: function( grunt, task ) {
		var cliTasks = grunt.cli.tasks;

		// Check if the task has been called directly.
		var isDirectCall = ( cliTasks.indexOf( task ) > -1 );
		// Check if this is a "default" call and that the task is inside "default".
		var isDefaultTask = ( cliTasks.indexOf( 'default' ) > -1 ) || !cliTasks.length;
		// Hacking Grunt hard.
		var isTaskInDefault = isDefaultTask && ( grunt.task._tasks.default.info.indexOf( '"' + task + '"' ) > -1 );

		return isDirectCall || isTaskInDefault;
	},

	/**
	 * Configures a multi-task and defines targets that are queued to be run by Grunt.
	 *
	 * @param grunt {Object} The Grunt object.
	 * @param options {Object} A list of options for the method. See the jscs and jshint tasks for example.
	 */
	setupMultitaskConfig: function( grunt, options ) {
		var task = options.task;
		var taskConfig = {};
		var config = taskConfig[ task ] = {
			options: options.defaultOptions
		};

		// "all" is the default target to be used if others are not to be run.
		var all = options.targets.all;
		var isAll = true;

		delete options.targets.all;

		Object.getOwnPropertyNames( options.targets ).forEach( function( target ) {
			if ( this.checkTaskInQueue( grunt, task + ':' + target ) ) {
				config[ target ] = options.targets[ target ]();
				isAll = false;
			}
		}, this );

		if ( isAll ) {
			config.all = all();
		}

		// Append .gitignore entries to the ignore list.
		if ( options.addGitIgnore ) {
			var ignoreProp = task + '.options.' + options.addGitIgnore;
			var ignores = grunt.config.get( ignoreProp ) || [];

			ignores = ignores.concat( this.getGitIgnore( grunt ) );
			grunt.config.set( ignoreProp, ignores );
		}

		// Merge over configurations set in gruntfile.js.
		grunt.config.merge( taskConfig );
	},

	/**
	 * Gets the list of ignores from `.gitignore`.
	 *
	 * @param grunt {Object} The Grunt object.
	 * @returns {String[]} The list of ignores.
	 */
	getGitIgnore: function( grunt ) {
		if ( !ignoreList ) {
			ignoreList = grunt.file.read( '.gitignore' );

			ignoreList = ignoreList
				// Remove comment lines.
				.replace( /^#.*$/gm, '' )
				// Transform into array.
				.split( /\n+/ )
				// Remove empty entries.
				.filter( function( path ) {
					return !!path;
				} );
		}

		return ignoreList;
	},

	/**
	 * Gets the list of files that are supposed to be included in the next Git commit.
	 *
	 * @returns {String[]} A list of file paths.
	 */
	getGitDirtyFiles: function() {
		// Cache it, so it is executed only once when running multiple tasks.
		if ( !dirtyFiles ) {
			dirtyFiles = this
				// Compare the state of index with HEAD.
				.shExec( 'git diff-index --name-only HEAD' )
				// Remove trailing /n to avoid an empty entry.
				.replace( /\s*$/, '' )
				// Transform into array.
				.split( '\n' );

			// If nothing is returned, the array will one one empty string only.
			if ( dirtyFiles.length == 1 && !dirtyFiles[ 0 ] ) {
				dirtyFiles = [];
			}
		}

		return dirtyFiles;
	},

	/**
	 * Executes a shell command.
	 *
	 * @param command {String} The command to be executed.
	 * @returns {String} The command output.
	 */
	shExec: function( command ) {
		var sh = require( 'shelljs' );
		sh.config.silent = true;

		var ret = sh.exec( command );

		if ( ret.code ) {
			throw new Error(
				'Error while executing `' + command + '`:\n\n' +
				ret.output
			);
		}

		return ret.output;
	},

	/**
	 * Links repository located in source path to repository located in destination path. Uses npm link.
	 *
	 * @param {String} sourcePath
	 * @param {String} destinationPath
	 * @param {String} pluginName
	 */
	npmLink: function( sourcePath, destinationPath, pluginName ) {
		// Don't use sudo on windows when executing npm link.
		var isWin = process.platform == 'win32';
		var linkCommands = [
			'cd ' + sourcePath,
			( !isWin ? 'sudo ' : '' ) + 'npm link',
			'cd ' + destinationPath,
			'npm link ' + pluginName
		];

		module.exports.shExec( linkCommands.join( ' && ' ) );
	},

	/**
	 * Clones repository from provided GitHub URL. Only short GitHub urls are supported that starts with 'ckeditor/'.
	 * https://docs.npmjs.com/files/package.json#github-urls
	 *
	 * @param {String} name Repository name.
	 * @param {String} gitHubUrl GitHub url to repository.
	 * @param {String} location Destination path.
	 */
	cloneRepository: function( name, gitHubUrl, location ) {
		var match = gitHubUrl.match( repositoryRegExp );

		if ( match && match[ 1 ] )  {
			var cloneCommands = [
				'cd ' + location,
				'git clone git@github.com:' + match[ 1 ]
			];

			// If commit-ish suffix is included - run git checkout.
			if ( match[ 2 ] ) {
				cloneCommands.push( 'cd ' + name );
				cloneCommands.push( 'git checkout ' + match[ 2 ] );
			}

			module.exports.shExec( cloneCommands.join( ' && ' ) );
		}
	},

	/**
	 * Returns dependencies that starts with ckeditor5-, and have valid, short GitHub url. Returns null if no
	 * dependencies are found.
	 *
	 * @param {Object} dependencies Dependencies object loaded from package.json file.
	 * @returns {Object|null}
	 */
	getCKEditorDependencies: function( dependencies ) {
		var result = null;
		var regexp = /^ckeditor5-/;

		if ( dependencies ) {
			Object.keys( dependencies ).forEach( function( key ) {
				if ( regexp.test( key ) && repositoryRegExp.test( dependencies[ key ] ) ) {
					if ( result === null ) {
						result = {};
					}

					result[ key ] = dependencies[ key ];
				}
			} );
		}

		return result;
	},

	/**
	 * Returns array with all directories under specified path.
	 *
	 * @param {String} path
	 * @returns {Array}
	 */
	getDirectories: function( path ) {
		var fs = require( 'fs' );
		var pth = require( 'path' );

		return fs.readdirSync( path ).filter( function( item ) {
			return fs.statSync( pth.join( path, item ) ).isDirectory();
		} );
	},

	/**
	 * Returns all directories under specified path that match 'ckeditor5' pattern.
	 *
	 * @param {String} path
	 * @returns {Array}
	 */
	getCKE5Directories: function( path ) {
		return module.exports.getDirectories( path ).filter( function( dir ) {
			return directoryRegExp.test( dir );
		} );
	},

	/**
	 * Returns git status --porcelain -sb executed under specified path.
	 *
	 * @param {String} path Path where git status will be executed.
	 * @returns {String|null}
	 */
	getGitStatus: function( path ) {
		var exec = module.exports.shExec;

		try {
			return exec( 'cd ' + path + ' && git status --porcelain -sb' ).trim();
		} catch ( e ) {	}

		return null;
	},

	/**
	 * Initializes development workspace. Takes CKEditor5 dependencies, clones them and npm links to the main CKEditor5
	 * repository.
	 *
	 * @param {String} workspacePath Absolute path to the workspace where all repositories will be cloned.
	 * @param {String} ckeditor5Path Absolute path to the CKEditor5 repository where all dependencies will be linked.
	 * @param {Function} log Log function used to report progress.
	 */
	initDevWorkspace: function( workspacePath, ckeditor5Path, log ) {
		var tools = module.exports;
		var path = require( 'path' );
		var packageJSON = require( path.join( ckeditor5Path, 'package.json' ) );
		var pluginPath;

		// Get only CKEditor dependencies.
		var dependencies = tools.getCKEditorDependencies( packageJSON.dependencies );

		if ( dependencies ) {
			Object.keys( dependencies ).forEach( function( name ) {
				log( 'Clonning repository ' + dependencies[ name ] + '...' );
				tools.cloneRepository( name, dependencies[ name ], workspacePath );

				pluginPath = path.join( workspacePath, name );
				log( 'Linking ' + pluginPath + ' into ' + ckeditor5Path + '...' );
				tools.npmLink( pluginPath, ckeditor5Path, name );
			} );
		}
	},

	/**
	 * Returns git status from all CKEditor repositories from workspace.
	 *
	 * @param {String} workspacePath Absolute path to the workspace containing repositories.
	 * @param {Function} log Log function used to output status information.
	 */
	getWorkspaceStatus: function( workspacePath, log ) {
		var tools = module.exports;
		var path = require( 'path' );
		var directories = tools.getCKE5Directories( workspacePath );

		directories.forEach( function( directory ) {
			var location = path.join( workspacePath, directory );
			var data = tools.getGitStatus( location );

			if ( data ) {
				log( '\x1b[1m' , '\x1b[36m', directory, '\x1b[0m\n', data );
			}
		} );
	}
};
