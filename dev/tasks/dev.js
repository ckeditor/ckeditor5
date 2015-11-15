/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const initTask = require( './utils/dev-init' );
var ckeditor5Path = process.cwd();

module.exports = ( grunt ) => {
	const packageJSON = grunt.config.data.pkg;

	grunt.registerTask( 'dev-init', function() {
		// Get workspace root relative path from configuration and convert it to absolute path.
		let	options = {
			workspaceRoot: '..'
		};
		options = this.options( options );
		initTask( ckeditor5Path, packageJSON, options, grunt.log.writeln, grunt.log.error );
	} );
};

