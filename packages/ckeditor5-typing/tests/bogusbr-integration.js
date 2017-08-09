/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';

import MutationObserver from '@ckeditor/ckeditor5-engine/src/view/observer/mutationobserver';

import Typing from '../src/typing';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';

import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'Bogus BR integration', () => {
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

	describe( 'insertText', () => {
		// Tests using 'insertText' generates same mutations as typing. This means they will behave
		// a little different in every browser (as native mutations may be different in different browsers).

		it( 'space is inserted on the end of the line (paragraph)', done => {
			editor.document.enqueueChanges( () => {
				editor.editing.view.getDomRoot().focus();
				setData( editor.document, '<paragraph>Foo[]</paragraph>' );
			} );

			editor.document.once( 'changesDone', () => {
				expect( editor.getData() ).to.equal( '<p>Foo&nbsp;</p>' );
				done();
			}, { priority: 'low' } );

			document.execCommand( 'insertText', false, ' ' );
		} );

		it( 'space is inserted on the end of the line (empty paragraph)', done => {
			editor.document.enqueueChanges( () => {
				editor.editing.view.getDomRoot().focus();
				setData( editor.document, '<paragraph>[]</paragraph>' );
			} );

			editor.document.once( 'changesDone', () => {
				expect( editor.getData() ).to.equal( '<p>&nbsp;</p>' );
				done();
			}, { priority: 'low' } );

			document.execCommand( 'insertText', false, ' ' );
		} );

		it( 'space is inserted on the end of the line (bold)', done => {
			editor.document.enqueueChanges( () => {
				editor.editing.view.getDomRoot().focus();
				setData( editor.document, '<paragraph><$text bold="true">Foo[]</$text></paragraph>' );
			} );

			editor.document.once( 'changesDone', () => {
				expect( editor.getData() ).to.equal( '<p><strong>Foo&nbsp;</strong></p>' );
				done();
			}, { priority: 'low' } );

			document.execCommand( 'insertText', false, ' ' );
		} );
	} );

	describe( 'mutations', () => {
		// This tests use fixed list of mutation mocks to simulate specific browser behaviours.

		it( 'space is inserted on the end of the paragraph', done => {
			editor.document.enqueueChanges( () => {
				editor.editing.view.getDomRoot().focus();
				setData( editor.document, '<paragraph>Foo[]</paragraph>' );
			} );

			editor.document.once( 'changesDone', () => {
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
			editor.document.enqueueChanges( () => {
				editor.editing.view.getDomRoot().focus();
				setData( editor.document, '<paragraph>Foo[]</paragraph>' );
			} );

			editor.document.once( 'changesDone', () => {
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
			editor.document.enqueueChanges( () => {
				editor.editing.view.getDomRoot().focus();
				setData( editor.document, '<paragraph>Foo hous[]</paragraph>' );
			} );

			editor.document.once( 'changesDone', () => {
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
				generateMutationMock( 'characterData', text ),
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
