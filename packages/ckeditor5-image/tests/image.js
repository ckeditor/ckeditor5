/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global window */

import ClassicTestEditor from 'ckeditor5-core/tests/_utils/classictesteditor';
import Image from 'ckeditor5-image/src/image';
import ImageEngine from 'ckeditor5-image/src/imageengine';
import Widget from 'ckeditor5-image/src/widget/widget';
import ImageAlternateText from 'ckeditor5-image/src/imagealternatetext/imagealternatetext';

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

	it( 'should load ImageEngine plugin', () => {
		expect( editor.plugins.get( ImageEngine ) ).to.instanceOf( ImageEngine );
	} );

	it( 'should load Widget plugin', () => {
		expect( editor.plugins.get( Widget ) ).to.instanceOf( Widget );
	} );

	it( 'should load ImageAlternateText plugin', () => {
		expect( editor.plugins.get( ImageAlternateText ) ).to.instanceOf( ImageAlternateText );
	} );
} );
