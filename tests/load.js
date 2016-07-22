/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import load from '/ckeditor5/load.js';

describe( 'load()', () => {
	it( 'loads plugin.js', () => {
		return load( 'ckeditor5/plugin.js' )
			.then( ( PluginModule ) => {
				expect( PluginModule.default ).to.be.a( 'function' );
			} );
	} );

	it( 'loads ckeditor5/editor/editor.js', () => {
		return load( 'ckeditor5/editor/editor.js' )
			.then( ( EditorModule ) => {
				expect( EditorModule.default ).to.be.a( 'function' );
			} );
	} );
} );

