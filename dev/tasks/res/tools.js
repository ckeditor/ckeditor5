/* global module */
/* global require */

'use strict';

module.exports = {
	getGitDirtyFiles: function() {
		return this.shExec( 'git diff-index --name-only HEAD' ).split( '\n' );
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
