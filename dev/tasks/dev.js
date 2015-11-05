/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

var tools = require( './utils/tools' );
var path = require( 'path' );
var ckeditor5Path = process.cwd();
var workspaceAbsolutePath;

module.exports = function( grunt ) {
	grunt.registerTask( 'dev', function( target ) {
		var	options = {
			workspaceRoot: '..'
		};

		// Get workspace root from configuration.
		options = this.options( options );
		workspaceAbsolutePath = path.join( ckeditor5Path, options.workspaceRoot );

		switch ( target ) {

			// grunt dev:init
			case 'init':
				tools.initDevWorkspace( workspaceAbsolutePath, ckeditor5Path, grunt.log.writeln );
				break;

			// grunt dev:status
			case 'status':
				tools.getWorkspaceStatus( workspaceAbsolutePath, grunt.log.writeln );
				break;
		}
	} );
};

