/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import secureSourceElement from '../../../src/editor/utils/securesourceelement';
import Editor from '../../../src/editor/editor';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

describe( 'secureSourceElement()', () => {
	let editor, sourceElement;

	beforeEach( () => {
		class CustomEditor extends Editor {}

		sourceElement = document.createElement( 'div' );
		editor = new CustomEditor();

		editor.sourceElement = sourceElement;
		editor.state = 'ready';
	} );

	afterEach( () => {
		if ( editor ) {
			return editor.destroy();
		}
	} );

	it( 'does nothing if the editor was not initialized using the source element', () => {
		delete editor.sourceElement;

		expect( () => {
			secureSourceElement( editor );
		} ).to.not.throw();
	} );

	it( 'does nothing if the editor was initialized using the element for the first time', () => {
		expect( () => {
			secureSourceElement( editor );
		} ).to.not.throw();
	} );

	it( 'sets the data attribute after initializing the editor', () => {
		secureSourceElement( editor );

		expect( sourceElement.hasAttribute( 'data-ckeditor5' ) ).to.equal( true );
	} );

	it( 'removes the data attribute after destroying the editor', () => {
		secureSourceElement( editor );

		return editor.destroy()
			.then( () => {
				editor = null;

				expect( sourceElement.hasAttribute( 'data-ckeditor5' ) ).to.equal( false );
			} );
	} );

	it( 'throws an error if the same element was used twice', () => {
		sourceElement.setAttribute( 'data-ckeditor5', 'true' );

		expect( () => {
			secureSourceElement( editor );
		} ).to.throw( CKEditorError, /^securesourceelement-source-element-used-more-than-once/ );
	} );
} );
