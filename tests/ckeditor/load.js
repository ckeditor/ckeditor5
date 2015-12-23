/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const modules = bender.amd.require( 'ckeditor', 'ckeditor5/load' );
let CKEDITOR, load;

before( () => {
	CKEDITOR = modules.ckeditor;
	load = modules[ 'ckeditor5/load' ];
} );

describe( 'load()', () => {
	it( 'loads ckeditor.js', () => {
		return load( 'ckeditor.js' )
			.then( ( CKEDITORModule ) => {
				expect( CKEDITORModule.default ).to.equal( CKEDITOR );
			} );
	} );

	it( 'loads core/editor', () => {
		return load( CKEDITOR.getModulePath( 'core/editor' ) )
			.then( ( EditorModule ) => {
				expect( EditorModule.default ).to.be.a( 'function' );
			} );
	} );
} );

