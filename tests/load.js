/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import load from '/ckeditor5/load.js';

describe( 'load()', () => {
	it( 'loads ckeditor.js', () => {
		return load( 'ckeditor.js' )
			.then( ( CKEDITORModule ) => {
				expect( CKEDITORModule.default ).to.have.property( 'create' );
			} );
	} );

	it( 'loads ckeditor5/core/editor', () => {
		return load( 'ckeditor5/core/editor.js' )
			.then( ( EditorModule ) => {
				expect( EditorModule.default ).to.be.a( 'function' );
			} );
	} );
} );

