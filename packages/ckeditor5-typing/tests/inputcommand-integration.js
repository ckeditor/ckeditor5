/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';

import Typing from '../src/typing';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';

import Range from '@ckeditor/ckeditor5-engine/src/model/range';
import Position from '@ckeditor/ckeditor5-engine/src/model/position';

import { setData as setModelData, getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

describe( 'InputCommand integration', () => {
	let editor, doc, viewDocument, boldView, italicView, editorElement;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Typing, Paragraph, Undo, Bold, Italic, Enter ],
				typing: { undoStep: 3 }
			} )
			.then( newEditor => {
				editor = newEditor;
				doc = editor.document;
				viewDocument = editor.editing.view;

				boldView = editor.ui.componentFactory.create( 'bold' );
				italicView = editor.ui.componentFactory.create( 'italic' );
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	function expectOutput( modelOutput, viewOutput ) {
		expect( getModelData( editor.document ) ).to.equal( modelOutput );
		expect( getViewData( viewDocument ) ).to.equal( viewOutput );
	}

	function simulateTyping( text ) {
		// While typing, every character is an atomic change.
		text.split( '' ).forEach( character => {
			editor.execute( 'input', {
				text: character
			} );
		} );
	}

	function simulateBatches( batches ) {
		// Use longer text at once in input command.
		batches.forEach( batch => {
			editor.execute( 'input', {
				text: batch
			} );
		} );
	}

	function setSelection( pathA, pathB ) {
		doc.selection.setRanges( [ new Range( new Position( doc.getRoot(), pathA ), new Position( doc.getRoot(), pathB ) ) ] );
	}

	describe( 'InputCommand integration', () => {
		it( 'resets the buffer on typing respecting typing.undoStep', () => {
			setModelData( doc, '<paragraph>0[]</paragraph>' );

			simulateTyping( '123456789' );

			expectOutput( '<paragraph>0123456789[]</paragraph>', '<p>0123456789{}</p>' );

			editor.execute( 'undo' );

			expectOutput( '<paragraph>0123456[]</paragraph>', '<p>0123456{}</p>' );

			editor.execute( 'undo' );

			expectOutput( '<paragraph>0123[]</paragraph>', '<p>0123{}</p>' );

			editor.execute( 'redo' );

			expectOutput( '<paragraph>0123456[]</paragraph>', '<p>0123456{}</p>' );
		} );

		it( 'resets the buffer on text insertion respecting typing.undoStep', () => {
			setModelData( doc, '<paragraph>0[]</paragraph>' );

			simulateBatches( [ '1234', '5', '678', '9' ] );

			expectOutput( '<paragraph>0123456789[]</paragraph>', '<p>0123456789{}</p>' );

			editor.execute( 'undo' );

			expectOutput( '<paragraph>012345678[]</paragraph>', '<p>012345678{}</p>' );

			editor.execute( 'undo' );

			expectOutput( '<paragraph>01234[]</paragraph>', '<p>01234{}</p>' );

			editor.execute( 'redo' );

			expectOutput( '<paragraph>012345678[]</paragraph>', '<p>012345678{}</p>' );
		} );

		it( 'resets the buffer when selection changes', () => {
			setModelData( doc, '<paragraph>Foo[] Bar</paragraph>' );

			setSelection( [ 0, 5 ], [ 0, 5 ] );
			simulateTyping( '1' );

			setSelection( [ 0, 7 ], [ 0, 8 ] );
			simulateTyping( '2' );

			expectOutput( '<paragraph>Foo B1a2[]</paragraph>', '<p>Foo B1a2{}</p>' );

			editor.execute( 'undo' );

			expectOutput( '<paragraph>Foo B1a[r]</paragraph>', '<p>Foo B1a{r}</p>' );

			editor.execute( 'undo' );

			expectOutput( '<paragraph>Foo B[]ar</paragraph>', '<p>Foo B{}ar</p>' );

			editor.execute( 'redo' );

			expectOutput( '<paragraph>Foo B1[]ar</paragraph>', '<p>Foo B1{}ar</p>' );
		} );

		it( 'resets the buffer when selection changes (with enter)', () => {
			setModelData( doc, '<paragraph>Foo[]Bar</paragraph>' );

			simulateTyping( '1' );
			editor.execute( 'enter' );

			setSelection( [ 1, 3 ], [ 1, 3 ] );
			simulateTyping( '2' );
			editor.execute( 'enter' );

			simulateTyping( 'Baz' );

			expectOutput( '<paragraph>Foo1</paragraph><paragraph>Bar2</paragraph><paragraph>Baz[]</paragraph>',
				'<p>Foo1</p><p>Bar2</p><p>Baz{}</p>' );

			editor.execute( 'undo' );

			expectOutput( '<paragraph>Foo1</paragraph><paragraph>Bar2</paragraph><paragraph>[]</paragraph>',
				'<p>Foo1</p><p>Bar2</p><p>[]</p>' );

			editor.execute( 'undo' );

			expectOutput( '<paragraph>Foo1</paragraph><paragraph>Bar2[]</paragraph>',
				'<p>Foo1</p><p>Bar2{}</p>' );

			editor.execute( 'undo' );

			expectOutput( '<paragraph>Foo1</paragraph><paragraph>Bar[]</paragraph>',
				'<p>Foo1</p><p>Bar{}</p>' );

			editor.execute( 'redo' );

			expectOutput( '<paragraph>Foo1</paragraph><paragraph>Bar2[]</paragraph>',
				'<p>Foo1</p><p>Bar2{}</p>' );
		} );

		it( 'resets the buffer when attribute changes', () => {
			setModelData( doc, '<paragraph>Foo[] Bar</paragraph>' );

			simulateTyping( ' ' );

			boldView.fire( 'execute' );
			simulateTyping( 'B' );

			italicView.fire( 'execute' );
			simulateTyping( 'a' );

			boldView.fire( 'execute' );
			italicView.fire( 'execute' );
			simulateTyping( 'z' );

			expectOutput(
				'<paragraph>Foo <$text bold="true">B<$text italic="true">a</$text></$text>z[] Bar</paragraph>',
				'<p>Foo <strong>B</strong><i><strong>a</strong></i>z{} Bar</p>'
			);

			editor.execute( 'undo' );

			expectOutput(
				'<paragraph>' +
					'Foo <$text bold="true">B<$text italic="true">a[]</$text></$text> Bar' +
				'</paragraph>',
				'<p>Foo <strong>B</strong><i><strong>a{}</strong></i> Bar</p>'
			);

			editor.execute( 'undo' );

			expectOutput( '<paragraph>Foo <$text bold="true">B[]</$text> Bar</paragraph>',
				'<p>Foo <strong>B{}</strong> Bar</p>' );
		} );
	} );
} );
