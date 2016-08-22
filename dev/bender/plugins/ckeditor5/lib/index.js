/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const path = require( 'path' );
const files = [
	path.join( __dirname, '../static/extensions.js' )
];

module.exports = {
	name: 'bender-ckeditor5',

	attach() {
		this.plugins.addFiles( files );

		this.on( 'test:created', ( test ) => {
			const moduleRegExp = /^([^\/]+)\//;
			let name = test.displayName.replace( /^build\/modules\/amd\/tests\//, '' );
			let module = name.match( moduleRegExp );

			if ( module ) {
				test.tags.unshift( 'module!' + module[ 1 ] );
				test.displayName = name.replace( moduleRegExp, '$1: ' );
			} else {
				test.tags.unshift( 'module!ckeditor5' );
				test.displayName = 'ckeditor5: ' + name.replace( /^ckeditor5\//, '' );
			}
		} );

		this.pagebuilders.add( 'ckeditor5', build );

		function build( data ) {
			files.forEach( ( file ) => {
				data.addJS( path.join( '/plugins/', file ).split( path.sep ).join( '/' ) );
			} );

			return data;
		}
	}
};
