/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const initTask = require( './utils/dev-init' );
const pluginCreateTask = require( './utils/dev-plugin-create' );
const pluginInstallTask = require( './utils/dev-plugin-install' );
const pluginUpdateTask = require( './utils/dev-update' );
const pluginStatusTask = require( './utils/dev-status' );
const boilerplateUpdateTask = require( './utils/dev-boilerplate-update' );
const ckeditor5Path = process.cwd();

module.exports = ( grunt ) => {
	const packageJSON = grunt.config.data.pkg;
	const workspaceRoot = grunt.config.data.workspaceRoot;

	grunt.registerTask( 'dev-init', function() {
		initTask( ckeditor5Path, packageJSON, workspaceRoot, grunt.log.writeln, grunt.log.error );
	} );

	grunt.registerTask( 'dev-plugin-create', function() {
		const done = this.async();
		pluginCreateTask( ckeditor5Path, workspaceRoot, grunt.log.writeln )
			.then( done )
			.catch( ( error )  => done( error ) );
	} );

	grunt.registerTask( 'dev-plugin-install', function() {
		const done = this.async();
		pluginInstallTask( ckeditor5Path, workspaceRoot, grunt.log.writeln )
			.then( done )
			.catch( ( error )  => done( error ) );
	} );

	grunt.registerTask( 'dev-update', function() {
		pluginUpdateTask( ckeditor5Path, packageJSON, workspaceRoot, grunt.log.writeln, grunt.log.error );
	} );

	grunt.registerTask( 'dev-status', function() {
		pluginStatusTask( ckeditor5Path, packageJSON, workspaceRoot, grunt.log.writeln, grunt.log.error );
	} );

	grunt.registerTask( 'dev-boilerplate-update', function() {
		boilerplateUpdateTask( ckeditor5Path, packageJSON, workspaceRoot, grunt.log.writeln, grunt.log.error );
	} );
};

