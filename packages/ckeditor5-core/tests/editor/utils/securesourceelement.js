/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import secureSourceElement from '../../../src/editor/utils/securesourceelement.js';
import Editor from '../../../src/editor/editor.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

describe( 'secureSourceElement()', () => {
	let editor, sourceElement;

	beforeEach( () => {
		class CustomEditor extends Editor {}

		sourceElement = document.createElement( 'div' );
		editor = new CustomEditor();

		editor.state = 'ready';
	} );

	afterEach( () => {
		if ( editor ) {
			return editor.destroy();
		}
	} );

	it( 'does not throw if the editor was initialized using the element for the first time', () => {
		expect( () => {
			secureSourceElement( editor, sourceElement );
		} ).to.not.throw();
	} );

	it( 'sets the property after initializing the editor', () => {
		secureSourceElement( editor, sourceElement );

		expect( sourceElement.ckeditorInstance ).to.equal( editor );
	} );

	it( 'removes the property after destroying the editor', () => {
		secureSourceElement( editor, sourceElement );

		return editor.destroy()
			.then( () => {
				editor = null;

				expect( sourceElement.ckeditorInstance ).to.be.undefined;
			} );
	} );

	it( 'throws an error if the same element was used twice', () => {
		sourceElement.ckeditorInstance = 'foo';

		expectToThrowCKEditorError( () => {
			secureSourceElement( editor, sourceElement );
		}, /^editor-source-element-already-used/, editor );
	} );
} );
