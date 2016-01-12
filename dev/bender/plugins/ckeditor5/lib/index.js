/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const path = require( 'path' );
const files = [
	path.join( __dirname, '../static/amd.js' ),
	path.join( __dirname, '../static/tools.js' )
];

module.exports = {
	name: 'bender-ckeditor5',

	attach() {
		this.plugins.addFiles( files );

		this.on( 'test:created', ( test ) => {
			const moduleRegExp = /node_modules\/ckeditor5-([^\/]+)/;
			let name = test.displayName;
			let module = name.match( moduleRegExp );

			if ( module ) {
				test.tags.unshift( 'module!' + module[ 1 ] );
				test.displayName = name.replace( moduleRegExp, '$1: ' );
			} else {
				test.tags.unshift( 'module!ckeditor5' );
				test.displayName = 'ckeditor5: ' + test.displayName;
			}
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
