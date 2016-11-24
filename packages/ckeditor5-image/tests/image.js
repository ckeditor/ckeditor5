/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global window */

import ClassicTestEditor from 'tests/core/_utils/classictesteditor.js';
import Image from 'ckeditor5/image/image.js';
import ImageEngine from 'ckeditor5/image/imageengine.js';
import Widget from 'ckeditor5/image/widget/widget.js';

describe( 'Image', () => {
	let editor;

	beforeEach( () => {
		const editorElement = window.document.createElement( 'div' );
		window.document.body.appendChild( editorElement );

		return ClassicTestEditor.create( editorElement, {
			plugins: [ Image ]
		} )
		.then( newEditor => {
			editor = newEditor;
		} );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( Image ) ).to.instanceOf( Image );
	} );

	it( 'should load ImageEngine feature', () => {
		expect( editor.plugins.get( ImageEngine ) ).to.instanceOf( ImageEngine );
	} );

	it( 'should load Widget feature', () => {
		expect( editor.plugins.get( Widget ) ).to.instanceOf( Widget );
	} );
} );
