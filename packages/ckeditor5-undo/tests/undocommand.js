/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ModelTestEditor from '/tests/ckeditor5/_utils/modeltesteditor.js';
import Range from '/ckeditor5/engine/model/range.js';
import Position from '/ckeditor5/engine/model/position.js';
import Text from '/ckeditor5/engine/model/text.js';
import UndoCommand from '/ckeditor5/undo/undocommand.js';
import AttributeDelta from '/ckeditor5/engine/model/delta/attributedelta.js';
import { itemAt, getText } from '/tests/engine/model/_utils/utils.js';

let editor, doc, root, undo;

beforeEach( () => {
	editor = new ModelTestEditor();
	undo = new UndoCommand( editor );

	doc = editor.document;

	root = doc.getRoot();
} );

afterEach( () => {
	undo.destroy();
} );

describe( 'UndoCommand', () => {
	const p = pos => new Position( root, [].concat( pos ) );
	const r = ( a, b ) => new Range( p( a ), p( b ) );

	describe( '_execute', () => {
		let batch0, batch1, batch2, batch3;

		beforeEach( () => {
			/*
			 [root]
			 - {}
			 */
			editor.document.selection.setRanges( [ r( 0, 0 ) ] );
			batch0 = doc.batch();
			undo.addBatch( batch0 );
			batch0.insert( p( 0 ), 'foobar' );
			/*
			 [root]
			 - f
			 - o
			 - o
			 - b
			 - a
			 - r{}
			 */
			// Let's make things spicy and this time, make a backward selection.
			editor.document.selection.setRanges( [ r( 2, 4 ) ], true );
			batch1 = doc.batch();
			undo.addBatch( batch1 );
			batch1.setAttribute( r( 2, 4 ), 'key', 'value' );
			/*
			 [root]
			 - f
			 - o
			 - {o (key: value)
			 - b} (key: value)
			 - a
			 - r
			 */
			editor.document.selection.setRanges( [ r( 1, 3 ) ] );
			batch2 = doc.batch();
			undo.addBatch( batch2 );
			batch2.move( r( 1, 3 ), p( 6 ) );
			/*
			 [root]
			 - f
			 - b (key: value)
			 - a
			 - r
			 - {o
			 - o} (key: value)
			 */
			editor.document.selection.setRanges( [ r( 1, 4 ) ] );
			batch3 = doc.batch();
			undo.addBatch( batch3 );
			batch3.wrap( r( 1, 4 ), 'p' );
			/*
			 [root]
			 - f
			 - [p]
			 	- {b (key: value)
			 	- a
			 	- r}
			 - o
			 - o (key: value)
			 */
			editor.document.selection.setRanges( [ r( 0, 1 ) ] );
			batch2.move( r( 0, 1 ), p( 3 ) );
			/*
			 [root]
			 - [p]
			 	- b (key: value)
			 	- a
			 	- r
			 - o
			 - f
			 - o{} (key: value)
			 */
			editor.document.selection.setRanges( [ r( 4, 4 ) ] );
		} );

		it( 'should revert changes done by deltas from the batch that was most recently added to the command stack', () => {
			undo._execute();

			// Selection is restored. Wrap is removed:
			/*
			 [root]
			 - {b (key: value)
			 - a
			 - r}
			 - o
			 - f
			 - o (key: value)
			 */

			expect( getText( root ) ).to.equal( 'barofo' );
			expect( itemAt( root, 0 ).getAttribute( 'key' ) ).to.equal( 'value' );
			expect( itemAt( root, 5 ).getAttribute( 'key' ) ).to.equal( 'value' );

			expect( editor.document.selection.getRanges().next().value.isEqual( r( 0, 3 ) ) ).to.be.true;
			expect( editor.document.selection.isBackward ).to.be.false;

			undo._execute();

			// Two moves are removed:
			/*
			 [root]
			 - f
			 - {o
			 - o} (key: value)
			 - b (key: value)
			 - a
			 - r
			 */

			expect( getText( root ) ).to.equal( 'foobar' );
			expect( itemAt( root, 2 ).getAttribute( 'key' ) ).to.equal( 'value' );
			expect( itemAt( root, 3 ).getAttribute( 'key' ) ).to.equal( 'value' );

			expect( editor.document.selection.getRanges().next().value.isEqual( r( 1, 3 ) ) ).to.be.true;
			expect( editor.document.selection.isBackward ).to.be.false;

			undo._execute();

			// Set attribute is undone:
			/*
			 [root]
			 - f
			 - o
			 - {o
			 - b}
			 - a
			 - r
			 */

			expect( getText( root ) ).to.equal( 'foobar' );
			expect( itemAt( root, 2 ).hasAttribute( 'key' ) ).to.be.false;
			expect( itemAt( root, 3 ).hasAttribute( 'key' ) ).to.be.false;

			expect( editor.document.selection.getRanges().next().value.isEqual( r( 2, 4 ) ) ).to.be.true;
			expect( editor.document.selection.isBackward ).to.be.true;

			undo._execute();

			// Insert is undone:
			/*
			 [root]
			 */

			expect( root.childCount ).to.equal( 0 );
			expect( editor.document.selection.getRanges().next().value.isEqual( r( 0, 0 ) ) ).to.be.true;
		} );

		it( 'should revert changes done by deltas from given batch, if parameter was passed (test: revert set attribute)', () => {
			undo._execute( batch1 );
			// Remove attribute:
			/*
			 [root]
			 - [p]
			 	- b
			 	- a
			 	- r
			 - o
			 - f
			 - o
			 */

			expect( itemAt( root, 0 ).name ).to.equal( 'p' );
			expect( getText( root.getChild( 0 ) ) ).to.equal( 'bar' );
			expect( root.getChild( 1 ).data ).to.equal( 'ofo' );

			expect( itemAt( root.getChild( 0 ), 0 ).hasAttribute( 'key' ) ).to.be.false;
			expect( itemAt( root, 2 ).hasAttribute( 'key' ) ).to.be.false;
			expect( itemAt( root, 3 ).hasAttribute( 'key' ) ).to.be.false;

			// Selection is only partially restored because the range got broken.
			// The selection would have to best on letter "b" and letter "o", but it is set only on letter "b".
			expect( editor.document.selection.getRanges().next().value.isEqual( r( [ 0, 0 ], [ 0, 1 ] ) ) ).to.be.true;
			expect( editor.document.selection.isBackward ).to.be.true;
		} );

		it( 'should revert changes done by deltas from given batch, if parameter was passed (test: revert insert foobar)', () => {
			undo._execute( batch0 );
			// Remove foobar:
			/*
			 [root]
			 - [p]
			 */

			// The `P` element wasn't removed because it wasn`t added by undone batch.
			// It would be perfect if the `P` got removed aswell because wrapping was on removed nodes.
			// But this would need a lot of logic / hardcoded ifs or a post-fixer.
			expect( root.childCount ).to.equal( 1 );
			expect( itemAt( root, 0 ).name ).to.equal( 'p' );

			expect( editor.document.selection.getRanges().next().value.isEqual( r( 0, 0 ) ) ).to.be.true;
			expect( editor.document.selection.isBackward ).to.be.false;

			undo._execute( batch1 );
			// Remove attributes.
			// This does nothing in the `root` because attributes were set on nodes that already got removed.
			// But those nodes should change in the graveyard and we can check them there.

			expect( root.childCount ).to.equal( 1 );
			expect( itemAt( root, 0 ).name ).to.equal( 'p' );

			// Operations for undoing that batch were working on graveyard so document selection should not change.
			expect( editor.document.selection.getRanges().next().value.isEqual( r( 0, 0 ) ) ).to.be.true;
			expect( editor.document.selection.isBackward ).to.be.false;

			expect( doc.graveyard.getChild( 0 ).maxOffset ).to.equal( 6 );

			for ( let char of doc.graveyard._children ) {
				expect( char.hasAttribute( 'key' ) ).to.be.false;
			}

			// Let's undo wrapping. This should leave us with empty root.
			undo._execute( batch3 );
			expect( root.maxOffset ).to.equal( 0 );

			// Once again transformed range ends up in the graveyard.
			expect( editor.document.selection.getRanges().next().value.isEqual( r( 0, 0 ) ) ).to.be.true;
			expect( editor.document.selection.isBackward ).to.be.false;
		} );
	} );

	// Some tests to ensure 100% CC and proper behavior in edge cases.
	describe( 'edge cases', () => {
		function getCaseText( root ) {
			let text = '';

			for ( let i = 0; i < root.childCount; i++ ) {
				let node = root.getChild( i );
				text += node.getAttribute( 'uppercase' ) ? node.data.toUpperCase() : node.data;
			}

			return text;
		}

		it( 'correctly handles deltas in compressed history that were earlier updated into multiple deltas (or split when undoing)', () => {
			// In this case we assume that one of the deltas in compressed history was updated to two deltas.
			// This is a tricky edge case because it is almost impossible to come up with convincing scenario that produces it.
			// At the moment of writing this test and comment, only Undo feature uses `CompressedHistory#updateDelta`.
			// Because deltas that "stays" in history are transformed with `isStrong` flag set to `false`, `MoveOperation`
			// won't get split and `AttributeDelta` can hold multiple `AttributeOperation` in it. So using most common deltas
			// (`InsertDelta`, `RemoveDelta`, `MoveDelta`, `AttributeDelta`) and undo it's impossible to get to this edge case.
			// Still there might be some weird scenarios connected with OT / Undo / Collaborative Editing / other deltas /
			// fancy 3rd party plugin where it may come up, so it's better to be safe than sorry.

			root.appendChildren( new Text( 'abcdef' ) );
			expect( getCaseText( root ) ).to.equal( 'abcdef' );

			editor.document.selection.setRanges( [ r( 1, 4 ) ] );
			let batch0 = doc.batch();
			undo.addBatch( batch0 );
			batch0.move( r( 1, 4 ), p( 5 ) );
			expect( getCaseText( root ) ).to.equal( 'aebcdf' );

			editor.document.selection.setRanges( [ r( 1, 1 ) ]  );
			let batch1 = doc.batch();
			undo.addBatch( batch1 );
			batch1.remove( r( 0, 1 ) );
			expect( getCaseText( root ) ).to.equal( 'ebcdf' );

			editor.document.selection.setRanges( [ r( 0, 3 ) ] );
			let batch2 = doc.batch();
			undo.addBatch( batch2 );
			batch2.setAttribute( r( 0, 3 ), 'uppercase', true );
			expect( getCaseText( root ) ).to.equal( 'EBCdf' );

			undo._execute( batch0 );
			expect( getCaseText( root ) ).to.equal( 'BCdEf' );

			// Let's simulate splitting the delta by updating the history by hand.
			let attrHistoryDelta = doc.history.getDelta( 2 )[ 0 ];
			let attrDelta1 = new AttributeDelta();
			attrDelta1.addOperation( attrHistoryDelta.operations[ 0 ] );
			let attrDelta2 = new AttributeDelta();
			attrDelta2.addOperation( attrHistoryDelta.operations[ 1 ] );
			doc.history.updateDelta( 2, [ attrDelta1, attrDelta2 ] );

			undo._execute( batch1 );
			// After this execution, undo algorithm should update both `attrDelta1` and `attrDelta2` with new
			// versions, that have incremented offsets.
			expect( getCaseText( root ) ).to.equal( 'aBCdEf' );

			undo._execute( batch2 );
			// This execution checks whether undo algorithm correctly updated deltas in previous execution
			// and also whether it correctly "reads" both deltas from history.
			expect( getCaseText( root ) ).to.equal( 'abcdef' );
		} );

		it( 'merges touching ranges when restoring selection', () => {
			root.appendChildren( new Text( 'abcdef' ) );
			expect( getCaseText( root ) ).to.equal( 'abcdef' );

			editor.document.selection.setRanges( [ r( 1, 4 ) ] );
			let batch0 = doc.batch();
			undo.addBatch( batch0 );
			batch0.setAttribute( r( 1, 4 ), 'uppercase', true );
			expect( getCaseText( root ) ).to.equal( 'aBCDef' );

			editor.document.selection.setRanges( [ r( 3, 4 ) ] );
			let batch1 = doc.batch();
			undo.addBatch( batch1 );
			batch1.move( r( 3, 4 ), p( 1 ) );
			expect( getCaseText( root ) ).to.equal( 'aDBCef' );

			undo._execute( batch0 );

			// After undo-attr: acdbef <--- "cdb" should be selected, it would look weird if only "cd" or "b" is selected
			// but the whole unbroken part "cdb" changed attribute.
			expect( getCaseText( root ) ).to.equal( 'adbcef' );
			expect( editor.document.selection.getRanges().next().value.isEqual( r( 1, 4 ) ) ).to.be.true;
		} );

		it( 'does nothing (and not crashes) if delta to undo is no longer in history', () => {
			// Also an edgy situation but it may come up if other plugins use `CompressedHistory` API.
			root.appendChildren( new Text( 'abcdef' ) );
			expect( getCaseText( root ) ).to.equal( 'abcdef' );

			editor.document.selection.setRanges( [ r( 0, 1 ) ] );
			let batch0 = doc.batch();
			undo.addBatch( batch0 );
			batch0.setAttribute( r( 0, 1 ), 'uppercase', true );
			expect( getCaseText( root ) ).to.equal( 'Abcdef' );

			doc.history.removeDelta( 0 );
			root.getChild( 0 ).removeAttribute( 'uppercase' );
			expect( getCaseText( root ) ).to.equal( 'abcdef' );

			undo._execute();

			// Nothing happened. We are still alive.
			expect( getCaseText( root ) ).to.equal( 'abcdef' );
		} );
	} );
} );
