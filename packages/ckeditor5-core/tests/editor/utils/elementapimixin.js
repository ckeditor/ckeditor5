/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import ElementApiMixin from '../../../src/editor/utils/elementapimixin';
import Editor from '../../../src/editor/editor';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';

describe( 'ElementApiMixin', () => {
	let editor;

	beforeEach( () => {
		// eslint-disable-next-line new-cap
		class CustomEditor extends ElementApiMixin( Editor ) {
		}

		editor = new CustomEditor();
		editor.model.document.createRoot();
		editor.model.schema.extend( '$text', { allowIn: '$root' } );
		editor.fire( 'ready' ); // (#6139)
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	it( 'is compatible with `mix` function', () => {
		expect( ElementApiMixin ).have.property( 'updateSourceElement' ).to.be.a( 'function' );
	} );

	describe( 'updateSourceElement()', () => {
		it( 'should be added to editor interface', () => {
			expect( editor ).have.property( 'updateSourceElement' ).to.be.a( 'function' );
		} );

		it( 'don\'t set the data to editor element', () => {
			const editorElement = document.createElement( 'div' );

			editor.data.set( 'foo bar' );

			editor.sourceElement = editorElement;

			editor.updateSourceElement();

			expect( editorElement.innerHTML ).to.equal( '' );
		} );

		it( 'sets data to editor element (div)', () => {
			const editorElement = document.createElement( 'div' );

			// Adding `updateSourceElementOnDestroy` config to the editor allows setting the data
			// back to the source element.
			editor.config.set( 'updateSourceElementOnDestroy', true );
			editor.data.set( 'foo bar' );

			editor.sourceElement = editorElement;

			editor.updateSourceElement();

			expect( editorElement.innerHTML ).to.equal( 'foo bar' );
		} );

		it( 'sets data to editor element (textarea)', () => {
			const editorElement = document.createElement( 'textarea' );

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
