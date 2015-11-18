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

	grunt.registerTask( 'dev-init', function() {
		const options = getOptions( this );
		initTask( ckeditor5Path, packageJSON, options, grunt.log.writeln, grunt.log.error );
	} );

	grunt.registerTask( 'dev-plugin-create', function() {
		const done = this.async();
		const options = getOptions( this );
		pluginCreateTask( ckeditor5Path, options, grunt.log.writeln, grunt.log.error )
			.then( done )
			.catch( ( error )  => done( error ) );
	} );

	grunt.registerTask( 'dev-plugin-install', function() {
		const done = this.async();
		const options = getOptions( this );
		pluginInstallTask( ckeditor5Path, options, grunt.log.writeln, grunt.log.error )
			.then( done )
			.catch( ( error )  => done( error ) );
	} );

	grunt.registerTask( 'dev-update', function() {
		const options = getOptions( this );
		pluginUpdateTask( ckeditor5Path, packageJSON, options, grunt.log.writeln, grunt.log.error );
	} );

	grunt.registerTask( 'dev-status', function() {
		const options = getOptions( this );
		pluginStatusTask( ckeditor5Path, packageJSON, options, grunt.log.writeln, grunt.log.error );
	} );

	grunt.registerTask( 'dev-boilerplate-update', function() {
		const options = getOptions( this );
		boilerplateUpdateTask( ckeditor5Path, packageJSON, options, grunt.log.writeln, grunt.log.error );
	} );

	function getOptions( context ) {
		const options = {
			workspaceRoot: '..'
		};

		return context.options( options );
	}
};

