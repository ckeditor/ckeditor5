/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import secureSourceElement from '../../../src/editor/utils/securesourceelement';
import Editor from '../../../src/editor/editor';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';

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

	it( 'does not throw if the editor was not initialized using the source element', () => {
		delete editor.sourceElement;

		expect( () => {
			secureSourceElement( editor );
		} ).to.not.throw();
	} );

	it( 'does not throw if the editor was initialized using the element for the first time', () => {
		expect( () => {
			secureSourceElement( editor );
		} ).to.not.throw();
	} );

	it( 'sets the data attribute after initializing the editor', () => {
		secureSourceElement( editor );

		expect( sourceElement.dataset.ckeditorSecuredElement ).to.equal( 'true' );
	} );

	it( 'removes the data attribute after destroying the editor', () => {
		secureSourceElement( editor );

		return editor.destroy()
			.then( () => {
				expect( sourceElement.dataset.ckeditorSecuredElement ).to.be.undefined;
			} );
	} );

	it( 'throws an error if the same element was used twice', () => {
		sourceElement.dataset.ckeditorSecuredElement = true;

		expectToThrowCKEditorError( () => {
			secureSourceElement( editor );
		}, /^securesourceelement-element-used-more-than-once/, editor, { element: sourceElement } );
	} );
} );
