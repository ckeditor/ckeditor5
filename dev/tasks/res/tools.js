/* jshint node: true */

'use strict';

var dirtyFiles;

module.exports = {
	checkTaskInQueue: function( grunt, task ) {
		var cliTasks = grunt.cli.tasks;

		// Check if the task has been called directly.
		var isDirectCall = ( cliTasks.indexOf( 'task' ) > -1 );

		// Check if this is a "default" call and that the task is inside "default".
		var isDefaultTask = ( cliTasks.indexOf( 'default' ) > -1 ) || !cliTasks.length,
			// Hacking grunt hard.
			isTaskInDefault = isDefaultTask && ( grunt.task._tasks.default.info.indexOf( '"jshint:git"' ) > -1 );

		return isDirectCall || isDefaultTask;
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
