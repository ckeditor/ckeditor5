/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import ElementApiMixin from '../../../src/editor/utils/elementapimixin';
import Editor from '../../../src/editor/editor';
import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';
import mix from '@ckeditor/ckeditor5-utils/src/mix';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';

describe( 'ElementApiMixin', () => {
	let editor;

	beforeEach( () => {
		class CustomEditor extends Editor {}
		mix( CustomEditor, ElementApiMixin );

		editor = new CustomEditor();
		editor.data.processor = new HtmlDataProcessor();
		editor.model.document.createRoot();
		editor.model.schema.extend( '$text', { allowIn: '$root' } );
	} );

	afterEach( () => {
		editor.destroy();
	} );

	describe( 'updateSourceElement()', () => {
		it( 'should be added to editor interface', () => {
			expect( editor ).have.property( 'updateSourceElement' ).to.be.a( 'function' );
		} );

		it( 'sets data to editor element', () => {
			const editorElement = document.createElement( 'div' );

			editor.data.set( 'foo bar' );

			editor.sourceElement = editorElement;

			editor.updateSourceElement();

			expect( editorElement.innerHTML ).to.equal( 'foo bar' );
		} );

		it( 'throws an error if "sourceElement" has not been set', () => {
			expectToThrowCKEditorError(
				() => editor.updateSourceElement(),
				/editor-missing-sourceelement/,
				editor
			);
		} );
	} );

	describe( 'secureSourceElement()', () => {
		let sourceElement;

		beforeEach( () => {
			sourceElement = document.createElement( 'div' );

			editor.sourceElement = sourceElement;
			editor.state = 'ready';
		} );

		it( 'does not throw if the editor was not initialized using the source element', () => {
			delete editor.sourceElement;

			expect( () => {
				editor.secureSourceElement();
			} ).to.not.throw();
		} );

		it( 'does not throw if the editor was initialized using the element for the first time', () => {
			expect( () => {
				editor.secureSourceElement();
			} ).to.not.throw();
		} );

		it( 'sets the data attribute after initializing the editor', () => {
			editor.secureSourceElement();

			expect( sourceElement.dataset.ckeditorSecuredElement ).to.equal( 'true' );
		} );

		it( 'removes the data attribute after destroying the editor', () => {
			editor.secureSourceElement();

			return editor.destroy()
				.then( () => {
					expect( sourceElement.dataset.ckeditorSecuredElement ).to.be.undefined;
				} );
		} );

		it( 'throws an error if the same element was used twice', () => {
			sourceElement.dataset.ckeditorSecuredElement = true;

			expectToThrowCKEditorError(
				() => editor.secureSourceElement(),
				/^editor-source-element-used-more-than-once/ );
		} );
	} );
} );
