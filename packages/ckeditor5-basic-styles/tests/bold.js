/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Editor from '/ckeditor5/editor.js';
import Bold from '/ckeditor5/basic-styles/bold.js';
import BoldEngine from '/ckeditor5/basic-styles/boldengine.js';
import ClassicCreator from '/ckeditor5/creator-classic/classiccreator.js';

describe( 'Bold', () => {
	let editor;

	beforeEach( () => {
		editor = new Editor( { 'editor': document.getElementById( 'editor' ) }, {
			creator: ClassicCreator,
			features: [ Bold ],
			toolbar: [ 'bold' ]
		} );

		return editor.init();
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( Bold ) ).to.be.instanceOf( Bold );
	} );

	it( 'should load BoldEngine', () => {
		expect( editor.plugins.get( BoldEngine ) ).to.be.instanceOf( BoldEngine );
	} );
} );
