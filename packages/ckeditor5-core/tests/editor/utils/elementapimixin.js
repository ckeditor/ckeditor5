/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
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
		class CustomEditor extends Editor {
		}

		mix( CustomEditor, ElementApiMixin );

		editor = new CustomEditor();
		editor.data.processor = new HtmlDataProcessor( editor.editing.view.document );
		editor.model.document.createRoot();
		editor.model.schema.extend( '$text', { allowIn: '$root' } );
		editor.fire( 'ready' ); // (#6139)
	} );

	afterEach( async () => {
		await editor.destroy();
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
} );
