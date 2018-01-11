/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */

import ElementInterface from '../../../src/editor/utils/elementinterface';
import Editor from '../../../src/editor/editor';
import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';
import mix from '@ckeditor/ckeditor5-utils/src/mix';

describe( 'ElementInterface', () => {
	let editor;

	beforeEach( () => {
		class CustomEditor extends Editor {}
		mix( CustomEditor, ElementInterface );

		editor = new CustomEditor();
		editor.data.processor = new HtmlDataProcessor();
		editor.model.document.createRoot();
		editor.model.schema.extend( '$text', { allowIn: '$root' } );
	} );

	afterEach( () => {
		editor.destroy();
	} );

	it( 'should add #element property to editor', () => {
		expect( editor ).have.property( 'element', null );
	} );

	describe( 'loadDataFromElement()', () => {
		it( 'should be added to editor interface', () => {
			expect( editor ).have.property( 'loadDataFromElement' ).to.be.a( 'function' );
		} );

		it( 'sets data to editor element', () => {
			const editorElement = document.createElement( 'div' );

			editor.element = editorElement;
			editorElement.innerHTML = 'foo bar';

			editor.loadDataFromElement();

			expect( editorElement.innerHTML ).to.equal( 'foo bar' );
		} );
	} );

	describe( 'updateEditorElement()', () => {
		it( 'should be added to editor interface', () => {
			expect( editor ).have.property( 'updateElement' ).to.be.a( 'function' );
		} );

		it( 'sets data to editor element', () => {
			const editorElement = document.createElement( 'div' );

			editor.data.set( 'foo bar' );

			editor.element = editorElement;

			editor.updateElement();

			expect( editorElement.innerHTML ).to.equal( 'foo bar' );
		} );
	} );
} );
