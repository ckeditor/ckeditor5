/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const path = require( 'path' );
const files = [
	path.join( __dirname, '../static/extensions.js' ),
	path.join( __dirname, '../static/tools.js' )
];

module.exports = {
	name: 'bender-ckeditor5',

	attach() {
		this.plugins.addFiles( files );

		this.on( 'test:created', ( test ) => {
			let name = test.displayName;

			name = name.replace( /node_modules\/ckeditor5-core/, 'core: ' );
			name = name.replace( /node_modules\/ckeditor5-plugin-([^\/]+)/, 'plugin!$1: ' );

			test.displayName = name;
		} );

		// Add this plugins' scripts before the includes pagebuilder (which handles bender-include directives), so
		// the main tools file is loaded before tools included in the core or in the plugins.
		this.pagebuilders.add( 'ckeditor5', build, this.pagebuilders.getPriority( 'includes' ) - 1 );

		function build( data ) {
			files.forEach( ( file ) => {
				data.addJS( path.join( '/plugins/', file ).split( path.sep ).join( '/' ) );
			} );

			return data;
		}
	}
};
