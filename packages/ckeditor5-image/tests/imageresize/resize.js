/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';

import ParagraphPlugin from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import ImagePlugin from '../../src/image';

describe( 'Image resizer', () => {
	// 40x20 black png image
	const imageFixture = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAUCAQAAABVT7cwAAAAHUlEQVR42mNk' +
		'+MlAVcA4auCogaMGjho4auBINRAAxoATiYvKC7IAAAAASUVORK5CYII=';
	let editor, viewDocument, editorElement;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		editorElement.innerHTML = `<p>foo</p><figure><img src="${ imageFixture }"></figure>`;

		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ ImagePlugin, ParagraphPlugin ]
			} )
			.then( newEditor => {
				editor = newEditor;
				viewDocument = editor.editing.view.document;
			} );
	} );

	afterEach( () => {
		editorElement.remove();
		return editor.destroy();
	} );

	describe( 'visual resizers', () => {
		it( 'correct amount is added by default', () => {
			const resizers = document.querySelectorAll( '.ck-widget__resizer' );

			expect( resizers.length ).to.be.equal( 4 );
		} );

		describe( 'visibility', () => {
			it( 'is hidden by default', () => {
				const allResizers = document.querySelectorAll( '.ck-widget__resizer' );

				for ( const resizer of allResizers ) {
					expect( isVisible( resizer ) ).to.be.false;
				}
			} );

			it( 'is shown when image is focused', () => {
				const widget = viewDocument.getRoot().getChild( 1 );
				const allResizers = document.querySelectorAll( '.ck-widget__resizer' );
				const domEventDataMock = {
					target: widget,
					preventDefault: sinon.spy()
				};

				viewDocument.fire( 'mousedown', domEventDataMock );

				for ( const resizer of allResizers ) {
					expect( isVisible( resizer ) ).to.be.true;
				}
			} );
		} );
	} );

	describe( 'standard image', () => {
		it( 'works', () => {} );
	} );

	describe( 'side image', () => {} );

	function isVisible( element ) {
		// Checks if the DOM element is visible to the end user.
		return element.offsetParent !== null;
	}
} );
