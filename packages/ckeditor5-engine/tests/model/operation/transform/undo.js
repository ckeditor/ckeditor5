/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Client, expectClients, syncClients, clearBuffer } from './utils.js';

import DocumentFragment from '../../../../src/model/documentfragment.js';
import Element from '../../../../src/model/element.js';
import Text from '../../../../src/model/text.js';

describe( 'transform', () => {
	describe( 'undo', () => {
		let john;

		beforeEach( () => {
			return Client.get( 'john' ).then( client => ( john = client ) );
		} );

		afterEach( () => {
			clearBuffer();

			return john.destroy();
		} );

		it( 'split, remove', () => {
			john.setData( '<paragraph>Foo[]Bar</paragraph>' );

			john.split();
			john.setSelection( [ 1 ], [ 2 ] );
			john.remove();
			john.undo();
			john.undo();

			expectClients( '<paragraph>FooBar</paragraph>' );
		} );

		it( 'move, merge', () => {
			john.setData( '[<paragraph>Foo</paragraph>]<paragraph>Bar</paragraph>' );

			john.move( [ 2 ] );
			john.setSelection( [ 1 ] );
			john.merge();
			john.undo();
			john.undo();

			expectClients( '<paragraph>Foo</paragraph><paragraph>Bar</paragraph>' );
		} );

		it.skip( 'move multiple, merge', () => {
			john.setData( '[<paragraph>Foo</paragraph><paragraph>Bar</paragraph>]<paragraph>Xyz</paragraph>' );

			john.move( [ 3 ] );

			expectClients( '<paragraph>Xyz</paragraph><paragraph>Foo</paragraph><paragraph>Bar</paragraph>' );

			john.setSelection( [ 1 ] );
			john.merge();

			expectClients( '<paragraph>XyzFoo</paragraph><paragraph>Bar</paragraph>' );

			john.undo();

			expectClients( '<paragraph>Xyz</paragraph><paragraph>Foo</paragraph><paragraph>Bar</paragraph>' );

			john.undo();

			// Wrong move is done.
			expectClients( '<paragraph>Foo</paragraph><paragraph>Bar</paragraph><paragraph>Xyz</paragraph>' );
		} );

		it( 'move inside unwrapped content', () => {
			john.setData( '<blockQuote>[<paragraph>Foo</paragraph>]<paragraph>Bar</paragraph></blockQuote>' );

			john.move( [ 0, 2 ] );
			john.setSelection( [ 0, 0 ] );
			john.unwrap();
			john.undo();
			john.undo();

			expectClients(
				'<blockQuote>' +
					'<paragraph>Foo</paragraph>' +
					'<paragraph>Bar</paragraph>' +
				'</blockQuote>'
			);
		} );

		it( 'remove node, merge', () => {
			john.setData( '<paragraph>Foo</paragraph><paragraph>[Bar]</paragraph>' );

			john.remove();
			john.setSelection( [ 1 ] );
			john.merge();
			john.undo();
			john.undo();

			expectClients( '<paragraph>Foo</paragraph><paragraph>Bar</paragraph>' );
		} );

		it( 'merge, merge #1', () => {
			john.setData(
				'<blockQuote>' +
					'<paragraph>Foo</paragraph>' +
					'<paragraph>Bar</paragraph>' +
				'</blockQuote>' +
				'[]' +
				'<blockQuote>' +
					'<paragraph>Xyz</paragraph>' +
				'</blockQuote>'
			);

			john.merge();
			john.setSelection( [ 0, 2 ] );
			john.merge();

			expectClients(
				'<blockQuote>' +
					'<paragraph>Foo</paragraph>' +
					'<paragraph>BarXyz</paragraph>' +
				'</blockQuote>'
			);

			john.undo();
			john.undo();

			expectClients(
				'<blockQuote>' +
					'<paragraph>Foo</paragraph>' +
					'<paragraph>Bar</paragraph>' +
				'</blockQuote>' +
				'<blockQuote>' +
					'<paragraph>Xyz</paragraph>' +
				'</blockQuote>'
			);
		} );

		it( 'merge, merge #2', () => {
			john.setData(
				'<blockQuote>' +
					'<paragraph>Foo</paragraph>' +
				'</blockQuote>' +
				'[]' +
				'<blockQuote>' +
					'<paragraph>Bar</paragraph>' +
					'<paragraph>Xyz</paragraph>' +
				'</blockQuote>'
			);

			john.merge();
			john.setSelection( [ 0, 1 ] );
			john.merge();

			expectClients(
				'<blockQuote>' +
					'<paragraph>FooBar</paragraph>' +
					'<paragraph>Xyz</paragraph>' +
				'</blockQuote>'
			);

			john.undo();
			john.undo();

			expectClients(
				'<blockQuote>' +
					'<paragraph>Foo</paragraph>' +
				'</blockQuote>' +
				'<blockQuote>' +
					'<paragraph>Bar</paragraph>' +
					'<paragraph>Xyz</paragraph>' +
				'</blockQuote>'
			);
		} );

		it( 'merge, unwrap', () => {
			john.setData( '<paragraph></paragraph>[]<paragraph>Foo</paragraph>' );

			john.merge();
			john.setSelection( [ 0, 0 ] );
			john.unwrap();

			john.undo();
			john.undo();

			expectClients( '<paragraph></paragraph><paragraph>Foo</paragraph>' );
		} );

		it( 'remove node at the split position #1', () => {
			john.setData( '<paragraph>Ab</paragraph>[]<paragraph>Xy</paragraph>' );

			john.merge();
			john.setSelection( [ 0, 1 ], [ 0, 2 ] );
			john.remove();

			john.undo();
			john.undo();

			expectClients( '<paragraph>Ab</paragraph><paragraph>Xy</paragraph>' );
		} );

		it( 'remove node at the split position #2', () => {
			john.setData( '<paragraph>Ab</paragraph>[]<paragraph>Xy</paragraph>' );

			john.merge();
			john.setSelection( [ 0, 2 ], [ 0, 3 ] );
			john.remove();

			john.undo();
			john.undo();

			expectClients( '<paragraph>Ab</paragraph><paragraph>Xy</paragraph>' );
		} );

		it( 'undoing split after the element created by split has been removed', () => {
			// This example is ported here from ckeditor5-undo to keep 100% CC in ckeditor5-engine alone.
			john.setData( '<paragraph>Foo[]bar</paragraph>' );

			john.split();
			john.setSelection( [ 0, 3 ], [ 1, 3 ] );
			john.delete();

			expectClients( '<paragraph>Foo</paragraph>' );

			john.undo();

			expectClients( '<paragraph>Foo</paragraph><paragraph>bar</paragraph>' );

			john.undo();

			expectClients( '<paragraph>Foobar</paragraph>' );
		} );

		it( 'remove text from paragraph and merge it', () => {
			john.setData( '<paragraph>Foo</paragraph><paragraph>[Bar]</paragraph>' );

			john.remove();
			john.setSelection( [ 1 ] );
			john.merge();

			expectClients( '<paragraph>Foo</paragraph>' );

			john.undo();

			expectClients( '<paragraph>Foo</paragraph><paragraph></paragraph>' );

			john.undo();

			expectClients( '<paragraph>Foo</paragraph><paragraph>Bar</paragraph>' );
		} );

		it( 'delete split paragraphs, then merge, undo, redo', () => {
			john.setData( '<paragraph>Foo</paragraph><paragraph>B[]ar</paragraph>' );

			john.split();
			john.setSelection( [ 2, 1 ] );
			john.split();
			john.setSelection( [ 1, 0 ], [ 3, 1 ] );
			john.delete();
			john.setSelection( [ 1 ] );
			john.merge();

			expectClients( '<paragraph>Foo</paragraph>' );

			john.undo();
			expectClients( '<paragraph>Foo</paragraph><paragraph></paragraph>' );

			john.undo();
			expectClients( '<paragraph>Foo</paragraph><paragraph>B</paragraph><paragraph>a</paragraph><paragraph>r</paragraph>' );

			john.undo();
			expectClients( '<paragraph>Foo</paragraph><paragraph>B</paragraph><paragraph>ar</paragraph>' );

			john.undo();
			expectClients( '<paragraph>Foo</paragraph><paragraph>Bar</paragraph>' );

			john.redo();
			expectClients( '<paragraph>Foo</paragraph><paragraph>B</paragraph><paragraph>ar</paragraph>' );

			john.redo();
			expectClients( '<paragraph>Foo</paragraph><paragraph>B</paragraph><paragraph>a</paragraph><paragraph>r</paragraph>' );

			john.redo();
			expectClients( '<paragraph>Foo</paragraph><paragraph></paragraph>' );

			john.redo();
			expectClients( '<paragraph>Foo</paragraph>' );
		} );

		it( 'pasting on collapsed selection undo and redo', () => {
			john.setData( '<paragraph>Foo[]Bar</paragraph>' );

			// Below simulates pasting.
			john.editor.model.change( () => {
				john.split();
				john.setSelection( [ 1 ] );

				john.insert( '<paragraph>1</paragraph>' );
				john.setSelection( [ 1 ] );
				john.merge();

				john.setSelection( [ 1 ] );
				john.insert( '<paragraph>2</paragraph>' );
				john.setSelection( [ 2 ] );
				john.merge();
			} );

			expectClients( '<paragraph>Foo1</paragraph><paragraph>2Bar</paragraph>' );

			john.undo();
			expectClients( '<paragraph>FooBar</paragraph>' );

			john.redo();
			expectClients( '<paragraph>Foo1</paragraph><paragraph>2Bar</paragraph>' );

			john.undo();
			expectClients( '<paragraph>FooBar</paragraph>' );

			john.redo();
			expectClients( '<paragraph>Foo1</paragraph><paragraph>2Bar</paragraph>' );
		} );

		// Following case was throwing before a fix was applied:
		//
		// [] is selection and a marker. It is copied and pasted between XY. And then undone:
		//
		// <p>A[A</p><p>B]B</p><p>XY</p>
		// <p>A[A</p><p>B]B</p><p>X[A</p><p>B]Y</p>
		// <p>A[A</p><p>B]B</p><p>XY</p>
		//
		it( 'paste with markers, undo, redo', () => {
			john.setData( '<paragraph>AA</paragraph><paragraph>BB</paragraph><paragraph>X[]Y</paragraph>' );

			john.editor.model.change( writer => {
				// Simulate copy. Create a document fragment that includes expected copied fragment + marker.
				// <paragraph><$marker />A</paragraph><paragraph>B<$marker /></paragraph>
				const docFrag = writer.createDocumentFragment();
				const pA = writer.createElement( 'paragraph' );
				const pB = writer.createElement( 'paragraph' );

				writer.insertText( 'A', pA, 0 );
				writer.insertText( 'B', pB, 0 );
				writer.insert( pA, docFrag, 0 );
				writer.insert( pB, docFrag, 1 );

				const marker = writer.createRange( writer.createPositionAt( pA, 0 ), writer.createPositionAt( pB, 1 ) );
				docFrag.markers.set( 'm', marker );

				// Insert the document fragment (simulates paste).
				john.setSelection( [ 2, 1 ], [ 2, 1 ] );
				john.insertContent( docFrag );
			} );

			expectClients(
				'<paragraph>AA</paragraph>' +
				'<paragraph>BB</paragraph>' +
				'<paragraph>X<m:start></m:start>A</paragraph>' +
				'<paragraph>B<m:end></m:end>Y</paragraph>'
			);

			john.undo();
			expectClients( '<paragraph>AA</paragraph><paragraph>BB</paragraph><paragraph>XY</paragraph>' );

			john.redo();
			expectClients(
				'<paragraph>AA</paragraph>' +
				'<paragraph>BB</paragraph>' +
				'<paragraph>X<m:start></m:start>A</paragraph>' +
				'<paragraph>B<m:end></m:end>Y</paragraph>'
			);

			john.undo();
			expectClients( '<paragraph>AA</paragraph><paragraph>BB</paragraph><paragraph>XY</paragraph>' );
		} );

		it( 'selection attribute setting: split, bold, merge, undo, undo, undo', () => {
			// This test is ported from undo to keep 100% CC in engine.
			john.setData( '<paragraph>Foo[]</paragraph><paragraph>Bar</paragraph>' );

			john.split();
			john.setSelection( [ 1, 0 ] );
			john._processExecute( 'bold' );
			john._processExecute( 'deleteForward' );

			expectClients( '<paragraph>Foo</paragraph><paragraph>Bar</paragraph>' );

			john.undo();
			expectClients( '<paragraph>Foo</paragraph><paragraph selection:bold="true"></paragraph><paragraph>Bar</paragraph>' );

			john.undo();
			expectClients( '<paragraph>Foo</paragraph><paragraph></paragraph><paragraph>Bar</paragraph>' );

			john.undo();
			expectClients( '<paragraph>Foo</paragraph><paragraph>Bar</paragraph>' );
		} );

		// https://github.com/ckeditor/ckeditor5/issues/1288
		it( 'remove two groups of blocks then undo, undo', () => {
			john.setData(
				'<paragraph>X</paragraph><paragraph>A</paragraph><paragraph>B[</paragraph><paragraph>C</paragraph><paragraph>D]</paragraph>'
			);

			john.delete();
			john.setSelection( [ 0, 1 ], [ 2, 1 ] );
			john.delete();

			expectClients( '<paragraph>X</paragraph>' );

			john.undo();

			expectClients( '<paragraph>X</paragraph><paragraph>A</paragraph><paragraph>B</paragraph>' );

			john.undo();

			expectClients(
				'<paragraph>X</paragraph><paragraph>A</paragraph><paragraph>B</paragraph><paragraph>C</paragraph><paragraph>D</paragraph>'
			);
		} );

		// https://github.com/ckeditor/ckeditor5/issues/1287 TC1
		it( 'pasting on non-collapsed selection undo and redo', () => {
			john.setData( '<paragraph>Fo[o</paragraph><paragraph>B]ar</paragraph>' );

			// Below simulates pasting.
			john.editor.model.change( () => {
				john.editor.model.deleteContent( john.document.selection );

				john.setSelection( [ 0, 2 ] );
				john.split();

				john.setSelection( [ 1 ] );
				john.insert( '<paragraph>1</paragraph>' );

				john.setSelection( [ 1 ] );
				john.merge();

				john.setSelection( [ 1 ] );
				john.insert( '<paragraph>2</paragraph>' );

				john.setSelection( [ 2 ] );
				john.merge();
			} );

			expectClients( '<paragraph>Fo1</paragraph><paragraph>2ar</paragraph>' );

			john.undo();
			expectClients( '<paragraph>Foo</paragraph><paragraph>Bar</paragraph>' );

			john.redo();
			expectClients( '<paragraph>Fo1</paragraph><paragraph>2ar</paragraph>' );

			john.undo();
			expectClients( '<paragraph>Foo</paragraph><paragraph>Bar</paragraph>' );

			john.redo();
			expectClients( '<paragraph>Fo1</paragraph><paragraph>2ar</paragraph>' );
		} );

		it( 'collapsed marker at the beginning of merged element then undo', () => {
			john.setData( '<paragraph>Foo</paragraph><paragraph>[]Bar</paragraph>' );

			john.setMarker( 'm1' );
			john.setSelection( [ 1 ] );
			john.merge();

			expectClients( '<paragraph>Foo<m1:start></m1:start>Bar</paragraph>' );

			john.undo();

			expectClients( '<paragraph>Foo</paragraph><paragraph><m1:start></m1:start>Bar</paragraph>' );
		} );

		it( 'collapsed marker at the end of merge-target element then undo', () => {
			john.setData( '<paragraph>Foo[]</paragraph><paragraph>Bar</paragraph>' );

			john.setMarker( 'm1' );
			john.setSelection( [ 1 ] );
			john.merge();

			expectClients( '<paragraph>Foo<m1:start></m1:start>Bar</paragraph>' );

			john.undo();

			expectClients( '<paragraph>Foo<m1:start></m1:start></paragraph><paragraph>Bar</paragraph>' );
		} );

		it( 'marker starts at the end of merge-target element then undo', () => {
			john.setData( '<paragraph>Foo[</paragraph><paragraph>Bar]</paragraph>' );

			john.setMarker( 'm1' );
			john.setSelection( [ 1 ] );
			john.merge();

			expectClients( '<paragraph>Foo<m1:start></m1:start>Bar<m1:end></m1:end></paragraph>' );

			john.undo();

			expectClients( '<paragraph>Foo<m1:start></m1:start></paragraph><paragraph>Bar<m1:end></m1:end></paragraph>' );
		} );

		// This is different from the case above, because here the marker is collapsed after merge, while above it is non-collapsed.
		it( 'empty marker between merged elements then undo', () => {
			john.setData( '<paragraph>Foo[</paragraph><paragraph>]Bar</paragraph>' );

			john.setMarker( 'm1' );
			john.setSelection( [ 1 ] );
			john.merge();

			expectClients( '<paragraph>Foo<m1:start></m1:start>Bar</paragraph>' );

			john.undo();

			expectClients( '<paragraph>Foo<m1:start></m1:start></paragraph><paragraph><m1:end></m1:end>Bar</paragraph>' );
		} );

		it( 'left side of marker moved then undo', () => {
			john.setData( '<paragraph>Foo[bar]</paragraph><paragraph></paragraph>' );

			john.setMarker( 'm1' );
			john.setSelection( [ 0, 2 ], [ 0, 4 ] );
			john.move( [ 1, 0 ] );

			expectClients( '<paragraph>Fo<m1:start></m1:start>ar<m1:end></m1:end></paragraph><paragraph>ob</paragraph>' );

			john.undo();

			expectClients( '<paragraph>Foo<m1:start></m1:start>bar<m1:end></m1:end></paragraph><paragraph></paragraph>' );
		} );

		it( 'right side of marker moved then undo', () => {
			john.setData( '<paragraph>[Foo]bar</paragraph><paragraph></paragraph>' );

			john.setMarker( 'm1' );
			john.setSelection( [ 0, 2 ], [ 0, 4 ] );
			john.move( [ 1, 0 ] );

			expectClients( '<paragraph><m1:start></m1:start>Fo<m1:end></m1:end>ar</paragraph><paragraph>ob</paragraph>' );

			john.undo();

			expectClients( '<paragraph><m1:start></m1:start>Foo<m1:end></m1:end>bar</paragraph><paragraph></paragraph>' );
		} );

		it( 'marker on closing and opening tag - remove multiple elements #1', () => {
			john.setData(
				'<paragraph>Abc</paragraph>' +
				'<paragraph>Foo[</paragraph>' +
				'<paragraph>]Bar</paragraph>'
			);

			john.setMarker( 'm1' );
			john.setSelection( [ 0, 1 ], [ 2, 2 ] );
			john._processExecute( 'delete' );

			expectClients( '<paragraph>A<m1:start></m1:start>r</paragraph>' );

			john.undo();

			expectClients(
				'<paragraph>Abc</paragraph>' +
				'<paragraph>Foo<m1:start></m1:start></paragraph>' +
				'<paragraph><m1:end></m1:end>Bar</paragraph>'
			);
		} );

		it( 'marker on closing and opening tag - remove multiple elements #2', () => {
			john.setData(
				'<paragraph>Foo[</paragraph>' +
				'<paragraph>]Bar</paragraph>' +
				'<paragraph>Xyz</paragraph>'
			);

			john.setMarker( 'm1' );
			john.setSelection( [ 0, 1 ], [ 2, 2 ] );
			john._processExecute( 'delete' );

			expectClients( '<paragraph>F<m1:start></m1:start>z</paragraph>' );

			john.undo();

			expectClients(
				'<paragraph>Foo<m1:start></m1:start></paragraph>' +
				'<paragraph><m1:end></m1:end>Bar</paragraph>' +
				'<paragraph>Xyz</paragraph>'
			);
		} );

		it( 'marker on closing and opening tag + some text - merge elements + remove text', () => {
			john.setData(
				'<paragraph>Foo[</paragraph>' +
				'<paragraph>B]ar</paragraph>'
			);

			john.setMarker( 'm1' );
			john.setSelection( [ 0, 1 ], [ 1, 2 ] );
			john._processExecute( 'delete' );

			expectClients( '<paragraph>F<m1:start></m1:start>r</paragraph>' );

			john.undo();

			expectClients(
				'<paragraph>Foo<m1:start></m1:start></paragraph>' +
				'<paragraph>B<m1:end></m1:end>ar</paragraph>'
			);
		} );

		// https://github.com/ckeditor/ckeditor5-engine/issues/1668
		it( 'marker and moves with undo-redo-undo', () => {
			john.setData( '<paragraph>X[]Y</paragraph>' );

			const inputBufferBatch = john.editor.commands.get( 'input' ).buffer.batch;

			john.editor.model.enqueueChange( inputBufferBatch, () => {
				john.type( 'a' );
				john.type( 'b' );
				john.type( 'c' );

				john.setSelection( [ 0, 1 ], [ 0, 4 ] );
				john.setMarker( 'm1' );
			} );

			expectClients( '<paragraph>X<m1:start></m1:start>abc<m1:end></m1:end>Y</paragraph>' );

			john.setSelection( [ 0, 0 ], [ 0, 5 ] );
			john._processExecute( 'delete' );

			expectClients( '<paragraph></paragraph>' );

			john.undo();

			expectClients( '<paragraph>X<m1:start></m1:start>abc<m1:end></m1:end>Y</paragraph>' );

			john.undo();

			expectClients( '<paragraph>XY</paragraph>' );

			john.redo();

			expectClients( '<paragraph>X<m1:start></m1:start>abc<m1:end></m1:end>Y</paragraph>' );

			john.redo();

			expectClients( '<paragraph></paragraph>' );

			john.undo();

			expectClients( '<paragraph>X<m1:start></m1:start>abc<m1:end></m1:end>Y</paragraph>' );

			john.undo();

			expectClients( '<paragraph>XY</paragraph>' );
		} );

		// https://github.com/ckeditor/ckeditor5/issues/1385
		it( 'paste inside paste + undo, undo + redo, redo', () => {
			const model = john.editor.model;

			john.setData( '<paragraph>[]</paragraph>' );

			model.insertContent( getPastedContent() );

			john.setSelection( [ 0, 3 ] );

			model.insertContent( getPastedContent() );

			expectClients( '<heading1>FooFoobarbar</heading1>' );

			john.undo();

			expectClients( '<heading1>Foobar</heading1>' );

			john.undo();

			expectClients( '<paragraph></paragraph>' );

			john.redo();

			expectClients( '<heading1>Foobar</heading1>' );

			john.redo();

			expectClients( '<heading1>FooFoobarbar</heading1>' );

			function getPastedContent() {
				return new Element( 'heading1', null, new Text( 'Foobar' ) );
			}
		} );

		// https://github.com/ckeditor/ckeditor5/issues/1540
		it( 'paste, select all, paste, undo, undo, redo, redo, redo', () => {
			john.setData( '<paragraph>[]</paragraph>' );

			pasteContent();

			john.setSelection( [ 0, 0 ], [ 1, 3 ] );

			pasteContent();

			expectClients( '<heading1>Foo</heading1><paragraph>Bar</paragraph>' );

			john.undo();

			expectClients( '<heading1>Foo</heading1><paragraph>Bar</paragraph>' );

			john.undo();

			expectClients( '<paragraph></paragraph>' );

			john.redo();

			expectClients( '<heading1>Foo</heading1><paragraph>Bar</paragraph>' );

			john.redo();

			expectClients( '<heading1>Foo</heading1><paragraph>Bar</paragraph>' );

			function pasteContent() {
				john.editor.model.insertContent(
					new DocumentFragment( [
						new Element( 'heading1', null, new Text( 'Foo' ) ),
						new Element( 'paragraph', null, new Text( 'Bar' ) )
					] )
				);
			}
		} );

		// Happens in track changes. Emulated here.
		// https://github.com/ckeditor/ckeditor5-engine/issues/1701
		it( 'paste, remove, undo, undo, redo, redo', () => {
			john.setData( '<paragraph>Ab[]cd</paragraph><paragraph>Wxyz</paragraph>' );

			john.editor.model.insertContent(
				new DocumentFragment( [
					new Element( 'paragraph', null, new Text( 'Foo' ) ),
					new Element( 'paragraph', null, new Text( 'Bar' ) )
				] )
			);

			john.setSelection( [ 1, 3 ], [ 2, 2 ] );

			john._processExecute( 'delete' );

			expectClients( '<paragraph>AbFoo</paragraph><paragraph>Baryz</paragraph>' );

			john.undo();

			expectClients( '<paragraph>AbFoo</paragraph><paragraph>Barcd</paragraph><paragraph>Wxyz</paragraph>' );

			john.undo();

			expectClients( '<paragraph>Abcd</paragraph><paragraph>Wxyz</paragraph>' );

			john.redo();

			expectClients( '<paragraph>AbFoo</paragraph><paragraph>Barcd</paragraph><paragraph>Wxyz</paragraph>' );

			john.redo();

			expectClients( '<paragraph>AbFoo</paragraph><paragraph>Baryz</paragraph>' );
		} );

		// https://github.com/ckeditor/ckeditor5/issues/8870
		it( 'object, p, p, p, remove, undo', () => {
			john.setData( '<imageBlock></imageBlock><paragraph>A</paragraph><paragraph>B[]</paragraph>' );

			// I couldn't use delete command because simply executing this command several times does not
			// work correctly when selection reaches <imageBlock></imageBlock><p>[]</p>.
			// At this point we have custom control for firing delete event on view and I didn't want to
			// simulate that.
			//
			john.remove( [ 2, 0 ], [ 2, 1 ] );
			john.merge( [ 2 ] );
			john.remove( [ 1, 0 ], [ 1, 1 ] );
			john.remove( [ 1 ], [ 2 ] );
			john.remove( [ 0 ], [ 1 ] );

			john.undo();
			john.undo();
			john.undo();
			john.undo();
			john.undo();

			expectClients( '<imageBlock></imageBlock><paragraph>A</paragraph><paragraph>B</paragraph>' );
		} );

		it( 'remove merged element then undo', () => {
			john.setData( '<paragraph>Foo</paragraph>[]<paragraph>Bar</paragraph>' );

			john.merge();
			john.setSelection( [ 0, 0 ], [ 0, 6 ] );
			john.remove();

			expectClients( '<paragraph></paragraph>' );

			john.undo();
			john.undo();

			expectClients( '<paragraph>Foo</paragraph><paragraph>Bar</paragraph>' );
		} );

		// https://github.com/cksource/ckeditor5-commercial/issues/4371.
		it( 'add paragraphs and marker, remove marker, undo on both clients', async () => {
			const kate = await Client.get( 'kate' );

			kate.setData( '<paragraph>[]</paragraph>' );
			john.setData( '<paragraph>[]</paragraph>' );

			syncClients();

			kate._processExecute( 'insertText', { text: 'A' } );
			kate._processExecute( 'insertText', { text: 'B' } );
			kate._processExecute( 'insertText', { text: 'C' } );
			kate._processExecute( 'enter' );
			kate._processExecute( 'insertText', { text: 'X' } );
			kate._processExecute( 'insertText', { text: 'Y' } );
			kate._processExecute( 'insertText', { text: 'Z' } );
			kate.setSelection( [ 0, 1 ], [ 1, 2 ] );
			kate.setMarker( 'm1' );

			syncClients();
			expectClients( '<paragraph>A<m1:start></m1:start>BC</paragraph><paragraph>XY<m1:end></m1:end>Z</paragraph>' );

			john.setSelection( [ 0, 1 ], [ 1, 2 ] );
			john.delete();

			syncClients();
			expectClients( '<paragraph>A<m1:start></m1:start>Z</paragraph>' );

			kate.undo();

			syncClients();
			expectClients( '<paragraph>AZ</paragraph>' );

			kate.undo();

			syncClients();
			expectClients( '<paragraph>A</paragraph>' );

			john.undo();

			syncClients();
			expectClients( '<paragraph>A<m1:start></m1:start>BC</paragraph><paragraph>XY<m1:end></m1:end></paragraph>' );

			return kate.destroy();
		} );

		// https://github.com/cksource/ckeditor5-commercial/issues/4341
		it( 'split, type, remove on another client, undo, redo', async () => {
			const kate = await Client.get( 'kate' );

			kate.setData( '<paragraph>Abc[]</paragraph><paragraph>Xyz</paragraph><paragraph>Foo</paragraph><paragraph>Bar</paragraph>' );
			john.setData( '<paragraph>Abc[]</paragraph><paragraph>Xyz</paragraph><paragraph>Foo</paragraph><paragraph>Bar</paragraph>' );

			kate._processExecute( 'enter' );
			kate._processExecute( 'insertText', { text: 'X' } );

			syncClients();
			expectClients( '<paragraph>Abc</paragraph><paragraph>X</paragraph><paragraph>Xyz</paragraph>' +
				'<paragraph>Foo</paragraph><paragraph>Bar</paragraph>' );

			john.setSelection( [ 0, 0 ], [ 3, 3 ] );
			john._processExecute( 'delete' );

			syncClients();
			expectClients( '<paragraph></paragraph><paragraph>Bar</paragraph>' );

			kate.undo();
			kate.undo();

			syncClients();
			expectClients( '<paragraph></paragraph><paragraph>Bar</paragraph>' );

			kate.redo();
			kate.redo();

			syncClients();
			expectClients( '<paragraph></paragraph><paragraph>Bar</paragraph>' );

			return kate.destroy();
		} );

		// https://github.com/cksource/ckeditor5-commercial/issues/1939
		it( 'two intersecting removes through multiple elements, then undo', async () => {
			const kate = await Client.get( 'kate' );

			kate.setData( '<paragraph>ABC</paragraph><paragraph>[ABC</paragraph><paragraph>ABC]</paragraph><paragraph>ABC</paragraph>' );
			john.setData( '<paragraph>[ABC</paragraph><paragraph>ABC</paragraph><paragraph>ABC</paragraph><paragraph>ABC]</paragraph>' );

			john._processExecute( 'delete' );
			kate._processExecute( 'delete' );

			syncClients();
			expectClients( '<paragraph></paragraph>' );

			john.undo();

			syncClients();

			// Actually, the *really* expected data is one paragraph less because `kate` removes it:
			//
			// <paragraph>ABC</paragraph><paragraph></paragraph><paragraph>ABC</paragraph>
			//
			// But during OT the merge operation becomes no operation at one point.
			//
			expectClients( '<paragraph>ABC</paragraph><paragraph></paragraph><paragraph></paragraph><paragraph>ABC</paragraph>' );

			return kate.destroy();
		} );

		// https://github.com/ckeditor/ckeditor5/issues/9296
		it( 'multiple enters, then backspaces, then undo, redo', () => {
			john.setData( '<paragraph>AB[]CD</paragraph>' );

			john.split();
			john.setSelection( [ 1, 0 ] );

			john.split();
			john.setSelection( [ 2, 0 ] );

			john.split();
			john.setSelection( [ 3, 0 ] );

			expectClients( '<paragraph>AB</paragraph><paragraph></paragraph><paragraph></paragraph><paragraph>CD</paragraph>' );

			john.delete();
			john.delete();
			john.delete();

			expectClients( '<paragraph>ABCD</paragraph>' );

			john.undo();

			expectClients( '<paragraph>AB</paragraph><paragraph></paragraph><paragraph></paragraph><paragraph>CD</paragraph>' );

			john.undo();
			john.undo();
			john.undo();

			expectClients( '<paragraph>ABCD</paragraph>' );

			john.redo();
			john.redo();
			john.redo();
			john.redo();

			expectClients( '<paragraph>ABCD</paragraph>' );
		} );
	} );
} );
