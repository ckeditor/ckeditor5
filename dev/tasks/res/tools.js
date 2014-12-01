/* jshint node: true */

'use strict';

var dirtyFiles,
	ignoreList;

module.exports = {
	checkTaskInQueue: function( grunt, task ) {
		var cliTasks = grunt.cli.tasks;

		// Check if the task has been called directly.
		var isDirectCall = ( cliTasks.indexOf( task ) > -1 );

		// Check if this is a "default" call and that the task is inside "default".
		var isDefaultTask = ( cliTasks.indexOf( 'default' ) > -1 ) || !cliTasks.length,
			// Hacking grunt hard.
			isTaskInDefault = isDefaultTask && ( grunt.task._tasks.default.info.indexOf( '"' + task + '"' ) > -1 );

		return isDirectCall || isTaskInDefault;
	},

	setupMultitaskConfig: function( grunt, options ) {
		var task = options.task,
			taskConfig = {},
			config = taskConfig[ task ] = {
				options: options.defaultOptions
			};

		// "all" is the default target to be used if others are not to be run.
		var all = options.targets.all,
			isAll = true;
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

		// Merge over configurations set in gruntfile.js.
		grunt.config.merge( taskConfig );
	},

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

	getGitDirtyFiles: function() {
		// Cache it, so it is executed only once when running multiple tasks.
		if ( !dirtyFiles ) {
			dirtyFiles = this.shExec( 'git diff-index --name-only HEAD' ).replace( /\s*$/, '' ).split( '\n' );
			if ( dirtyFiles.length == 1 && !dirtyFiles[ 0 ] ) {
				dirtyFiles = [];
			}
		}
		return dirtyFiles;
	},

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
