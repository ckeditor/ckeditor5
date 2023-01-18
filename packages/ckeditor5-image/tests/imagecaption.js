/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global window */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import ImageCaption from '../src/imagecaption';
import ImageCaptionEditing from '../src/imagecaption/imagecaptionediting';
import ImageCaptionUI from '../src/imagecaption/imagecaptionui';

describe( 'ImageCaption', () => {
	let editor, editorElement;

	beforeEach( () => {
		editorElement = window.document.createElement( 'div' );
		window.document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ ImageCaption ]
			} )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	afterEach( () => {
		editorElement.remove();
		return editor.destroy();
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( ImageCaption ) ).to.instanceOf( ImageCaption );
	} );

	it( 'should load the ImageCaptionEditing plugin', () => {
		expect( editor.plugins.get( ImageCaptionEditing ) ).to.instanceOf( ImageCaptionEditing );
	} );

	it( 'should load the ImageCaptionUI plugin', () => {
		expect( editor.plugins.get( ImageCaptionUI ) ).to.instanceOf( ImageCaptionUI );
	} );
} );
