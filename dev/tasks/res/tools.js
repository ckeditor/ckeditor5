/* global module */
/* global require */

'use strict';

var dirtyFiles;

module.exports = {
	getGitDirtyFiles: function() {
		// Cache it, so it is executed only once when running multiple tasks.
		if ( !dirtyFiles ) {
			dirtyFiles = this.shExec( 'git diff-index --name-only HEAD' ).replace( /\s*$/, '' ).split( '\n' );
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
