/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global window */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import ImageCaptioning from '../../src/imagecaptioning/imagecaptioning';
import ImageCaptioningEngine from '../../src/imagecaptioning/imagecaptioningengine';

describe( 'ImageCaptioning', () => {
	let editor;

	beforeEach( () => {
		const editorElement = window.document.createElement( 'div' );
		window.document.body.appendChild( editorElement );

		return ClassicTestEditor.create( editorElement, {
			plugins: [ ImageCaptioning ]
		} )
		.then( newEditor => {
			editor = newEditor;
		} );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( ImageCaptioning ) ).to.instanceOf( ImageCaptioning );
	} );

	it( 'should load ImageCaptioningEngine plugin', () => {
		expect( editor.plugins.get( ImageCaptioningEngine ) ).to.instanceOf( ImageCaptioningEngine );
	} );
} );
