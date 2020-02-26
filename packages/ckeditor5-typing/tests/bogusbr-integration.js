/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';

import MutationObserver from '@ckeditor/ckeditor5-engine/src/view/observer/mutationobserver';

import Typing from '../src/typing';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';

import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'Typing – bogus BR integration', () => {
	let editor, domRoot, mutationObserver, editorElement;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Typing, Paragraph, Bold ]
			} )
			.then( newEditor => {
				editor = newEditor;
				domRoot = editor.editing.view.getDomRoot();
				mutationObserver = editor.editing.view.getObserver( MutationObserver );
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	// Part of tests used the native insertText command to generate mutations which would be generated
	// by real typing. Unfortunately, the command is not reliable (due to focus) and we needed
	// to stop using it. Instead we use a direct DOM modifications and completely fake mutations.

	describe( 'direct DOM modifications', () => {
		it( 'space is inserted on the end of the line (paragraph)', done => {
			editor.model.change( () => {
				setData( editor.model, '<paragraph>Foo[]</paragraph>' );
			} );

			editor.model.document.once( 'change', () => {
				expect( editor.getData() ).to.equal( '<p>Foo&nbsp;</p>' );
				done();
			}, { priority: 'low' } );

			const p = editor.editing.view.getDomRoot().firstChild;
			p.firstChild.data = 'Foo\u00a0';
		} );

		it( 'space is inserted at the end of the line (empty paragraph)', done => {
			editor.model.change( () => {
				setData( editor.model, '<paragraph>[]</paragraph>' );
			} );

			editor.model.document.once( 'change', () => {
				expect( editor.getData( { trim: 'none' } ) ).to.equal( '<p>&nbsp;</p>' );
				done();
			}, { priority: 'low' } );

			const p = editor.editing.view.getDomRoot().firstChild;
			const bogusBr = p.firstChild;
			const text = document.createTextNode( '\u00a0' );

			p.insertBefore( text, bogusBr );
		} );

		// We sometimes observed that browsers remove the bogus br automatically.
		it( 'space is inserted at the end of the line (empty paragraph; remove <br> when inserting space)', done => {
			editor.model.change( () => {
				setData( editor.model, '<paragraph>[]</paragraph>' );
			} );

			editor.model.document.once( 'change', () => {
				expect( editor.getData( { trim: 'none' } ) ).to.equal( '<p>&nbsp;</p>' );
				done();
			}, { priority: 'low' } );

			const p = editor.editing.view.getDomRoot().firstChild;
			const bogusBr = p.firstChild;
			const text = document.createTextNode( '\u00a0' );

			p.insertBefore( text, bogusBr );
			bogusBr.remove();
		} );

		it( 'space is inserted on the end of the line (bold)', done => {
			editor.model.change( () => {
				setData( editor.model, '<paragraph><$text bold="true">Foo[]</$text></paragraph>' );
			} );

			editor.model.document.once( 'change', () => {
				expect( editor.getData() ).to.equal( '<p><strong>Foo&nbsp;</strong></p>' );
				done();
			}, { priority: 'low' } );

			const p = editor.editing.view.getDomRoot().firstChild;
			p.firstChild.firstChild.data = 'Foo\u00a0';
		} );
	} );

	describe( 'mutations', () => {
		// This tests use fixed list of mutation mocks to simulate specific browser behaviours.

		it( 'space is inserted on the end of the paragraph', done => {
			editor.model.change( () => {
				setData( editor.model, '<paragraph>Foo[]</paragraph>' );
			} );

			editor.model.document.once( 'change', () => {
				expect( editor.getData() ).to.equal( '<p>Foo&nbsp;</p>' );
				done();
			}, { priority: 'low' } );

			const mutationTarget = domRoot.childNodes[ 0 ].childNodes[ 0 ];

			mutationObserver.disable();

			mutationTarget.data = 'Foo ';

			mutationObserver.enable();

			mutationObserver._onMutations( [
				generateMutationMock( 'characterData', mutationTarget ),
				generateMutationMock( 'characterData', mutationTarget ),
				generateMutationMock( 'characterData', mutationTarget )
			] );
		} );

		it( 'space is inserted on the end of the line paragraph (with bogus br)', done => {
			editor.model.change( () => {
				editor.editing.view.getDomRoot().focus();
				setData( editor.model, '<paragraph>Foo[]</paragraph>' );
			} );

			editor.model.document.once( 'change', () => {
				expect( editor.getData() ).to.equal( '<p>Foo&nbsp;</p>' );
				done();
			}, { priority: 'low' } );

			const paragraph = domRoot.childNodes[ 0 ];
			const text = paragraph.childNodes[ 0 ];
			const br = document.createElement( 'br' );

			mutationObserver.disable();

			text.data = 'Foo ';

			mutationObserver.enable();

			mutationObserver._onMutations( [
				generateMutationMock( 'characterData', text ),
				generateMutationMock( 'childList', paragraph, text, [ br ] ),
				generateMutationMock( 'characterData', text ),
				generateMutationMock( 'characterData', text )
			] );
		} );

		it( 'word is properly corrected on the end of the block element (with bogus br)', done => {
			editor.model.change( () => {
				editor.editing.view.getDomRoot().focus();
				setData( editor.model, '<paragraph>Foo hous[]</paragraph>' );
			} );

			editor.model.document.once( 'change', () => {
				expect( editor.getData() ).to.equal( '<p>Foo house</p>' );
				done();
			}, { priority: 'low' } );

			const paragraph = domRoot.childNodes[ 0 ];
			const text = paragraph.childNodes[ 0 ];
			const br = document.createElement( 'br' );

			mutationObserver.disable();

			text.data = 'Foo house';

			mutationObserver.enable();

			mutationObserver._onMutations( [
				generateMutationMock( 'characterData', text ),
				generateMutationMock( 'characterData', text ),
				generateMutationMock( 'characterData', text ),
				generateMutationMock( 'childList', paragraph, text, [ br ] ),
				generateMutationMock( 'characterData', text ),
				generateMutationMock( 'characterData', text ),
				generateMutationMock( 'characterData', text )
			] );
		} );
	} );

	function generateMutationMock( type, target, previousSibling, addedNodes ) {
		return {
			addedNodes: addedNodes || [],
			attributeName: null,
			attributeNamespace: null,
			nextSibling: null,
			oldValue: null,
			previousSibling: previousSibling || null,
			removedNodes: [],
			target,
			type
		};
	}
} );
