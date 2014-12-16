/* jshint node: true */

'use strict';

var dirtyFiles,
	ignoreList;

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
	}
};
