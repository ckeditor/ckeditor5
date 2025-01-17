/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

import TextWatcher from '../src/textwatcher.js';

describe( 'TextWatcher', () => {
	let editor, model, doc;
	let watcher, matchedDataSpy, matchedSelectionSpy, unmatchedSpy, testCallbackStub;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		return ModelTestEditor.create()
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				doc = model.document;

				testCallbackStub = sinon.stub();
				matchedDataSpy = sinon.spy();
				matchedSelectionSpy = sinon.spy();
				unmatchedSpy = sinon.spy();

				model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );

				setData( model, '<paragraph>foo []</paragraph>' );

				watcher = new TextWatcher( model, testCallbackStub, () => {} );
				watcher.on( 'matched:data', matchedDataSpy );
				watcher.on( 'matched:selection', matchedSelectionSpy );
				watcher.on( 'unmatched', unmatchedSpy );
			} );
	} );

	afterEach( () => {
		sinon.restore();

		if ( editor ) {
			return editor.destroy();
		}
	} );

	describe( '#isEnabled', () => {
		it( 'should be enabled after initialization', () => {
			expect( watcher.isEnabled ).to.be.true;
		} );

		it( 'should be disabled after setting #isEnabled to false', () => {
			watcher.isEnabled = false;

			expect( watcher.isEnabled ).to.be.false;
		} );
	} );

	describe( 'testCallback', () => {
		it( 'should evaluate text before caret for data changes', () => {
			model.change( writer => {
				writer.insertText( '@', doc.selection.getFirstPosition() );
			} );

			sinon.assert.calledOnce( testCallbackStub );
			sinon.assert.calledWithExactly( testCallbackStub, 'foo @' );
		} );

		it( 'should not evaluate text for not collapsed selection', () => {
			model.change( writer => {
				const start = writer.createPositionAt( doc.getRoot().getChild( 0 ), 0 );

				writer.setSelection( writer.createRange( start, start.getShiftedBy( 1 ) ) );
			} );

			sinon.assert.notCalled( testCallbackStub );
		} );

		it( 'should evaluate text for selection changes', () => {
			model.change( writer => {
				writer.setSelection( doc.getRoot().getChild( 0 ), 1 );
			} );

			sinon.assert.calledOnce( testCallbackStub );
			sinon.assert.calledWithExactly( testCallbackStub, 'f' );
		} );

		it( 'should evaluate text before caret up to <softBreak>', () => {
			model.schema.register( 'softBreak', {
				allowWhere: '$text',
				isInline: true
			} );

			model.change( writer => {
				writer.insertElement( 'softBreak', doc.selection.getFirstPosition() );
				writer.insertText( '@', doc.selection.getFirstPosition() );
			} );

			sinon.assert.calledOnce( testCallbackStub );
			sinon.assert.calledWithExactly( testCallbackStub, '@' );
		} );

		it( 'should not evaluate text for undo batches', () => {
			model.enqueueChange( { isUndo: true }, writer => {
				writer.insertText( '@', doc.selection.getFirstPosition() );
			} );

			sinon.assert.notCalled( testCallbackStub );
		} );

		it( 'should not evaluate text for non-local batches', () => {
			model.enqueueChange( { isLocal: false }, writer => {
				writer.insertText( '@', doc.selection.getFirstPosition() );
			} );

			sinon.assert.notCalled( testCallbackStub );
		} );

		it( 'should not evaluate text when watcher is disabled', () => {
			watcher.isEnabled = false;

			model.change( writer => {
				writer.insertText( '@', doc.selection.getFirstPosition() );
			} );

			sinon.assert.notCalled( testCallbackStub );
		} );

		it( 'should evaluate text when watcher is enabled again', () => {
			watcher.isEnabled = false;

			model.change( writer => {
				writer.insertText( '@', doc.selection.getFirstPosition() );
			} );

			sinon.assert.notCalled( testCallbackStub );

			watcher.isEnabled = true;

			model.change( writer => {
				writer.insertText( '@', doc.selection.getFirstPosition() );
			} );

			sinon.assert.calledOnce( testCallbackStub );
			sinon.assert.calledWithExactly( testCallbackStub, 'foo @@' );
		} );
	} );

	describe( 'events', () => {
		describe( '"matched:data"', () => {
			it( 'should be fired when test callback returns true for model data changes', () => {
				testCallbackStub.returns( true );

				model.change( writer => {
					writer.insertText( '@', doc.selection.getFirstPosition() );
				} );

				sinon.assert.calledOnce( testCallbackStub );
				sinon.assert.calledOnce( matchedDataSpy );
				sinon.assert.notCalled( matchedSelectionSpy );
				sinon.assert.notCalled( unmatchedSpy );
			} );

			it( 'should be fired with additional data when test callback returns true for model data changes', () => {
				const additionalData = { abc: 'xyz' };

				testCallbackStub.returns( additionalData );

				model.change( writer => {
					writer.insertText( '@', doc.selection.getFirstPosition() );
				} );

				sinon.assert.calledOnce( testCallbackStub );
				sinon.assert.calledOnce( matchedDataSpy );
				sinon.assert.notCalled( matchedSelectionSpy );
				sinon.assert.notCalled( unmatchedSpy );

				expect( matchedDataSpy.firstCall.args[ 1 ] ).to.deep.include( additionalData );
			} );
		} );

		it( 'should not fire "matched:data" event when watcher is disabled' +
		' (even when test callback returns true for model data changes)', () => {
			watcher.isEnabled = false;

			testCallbackStub.returns( true );

			model.change( writer => {
				writer.insertText( '@', doc.selection.getFirstPosition() );
			} );

			sinon.assert.notCalled( testCallbackStub );
			sinon.assert.notCalled( matchedDataSpy );
			sinon.assert.notCalled( matchedSelectionSpy );
			sinon.assert.notCalled( unmatchedSpy );
		} );

		it( 'should fire "matched:selection" event when test callback returns true for model data changes', () => {
			testCallbackStub.returns( true );

			model.enqueueChange( { isLocal: false }, writer => {
				writer.insertText( '@', doc.selection.getFirstPosition() );
			} );

			model.change( writer => {
				writer.setSelection( doc.getRoot().getChild( 0 ), 0 );
			} );

			sinon.assert.calledOnce( testCallbackStub );
			sinon.assert.notCalled( matchedDataSpy );
			sinon.assert.calledOnce( matchedSelectionSpy );
			sinon.assert.notCalled( unmatchedSpy );
		} );

		it( 'should not fire "matched:selection" event when when watcher is disabled' +
		' (even when test callback returns true for model data changes)', () => {
			watcher.isEnabled = false;

			testCallbackStub.returns( true );

			model.enqueueChange( { isUndoable: false }, writer => {
				writer.insertText( '@', doc.selection.getFirstPosition() );
			} );

			model.change( writer => {
				writer.setSelection( doc.getRoot().getChild( 0 ), 0 );
			} );

			sinon.assert.notCalled( testCallbackStub );
			sinon.assert.notCalled( matchedDataSpy );
			sinon.assert.notCalled( matchedSelectionSpy );
			sinon.assert.notCalled( unmatchedSpy );
		} );

		it( 'should not fire "matched" event when test callback returns false', () => {
			testCallbackStub.returns( false );

			model.change( writer => {
				writer.insertText( '@', doc.selection.getFirstPosition() );
			} );

			sinon.assert.calledOnce( testCallbackStub );
			sinon.assert.notCalled( matchedDataSpy );
			sinon.assert.notCalled( matchedSelectionSpy );
			sinon.assert.notCalled( unmatchedSpy );
		} );

		it( 'should fire "unmatched" event when test callback returns false when it was previously matched', () => {
			testCallbackStub.returns( true );

			model.change( writer => {
				writer.insertText( '@', doc.selection.getFirstPosition() );
			} );

			sinon.assert.calledOnce( testCallbackStub );
			sinon.assert.calledOnce( matchedDataSpy );
			sinon.assert.notCalled( unmatchedSpy );

			testCallbackStub.returns( false );

			model.change( writer => {
				writer.insertText( '@', doc.selection.getFirstPosition() );
			} );

			sinon.assert.calledTwice( testCallbackStub );
			sinon.assert.calledOnce( matchedDataSpy );
			sinon.assert.calledOnce( unmatchedSpy );
		} );

		it( 'should fire "umatched" event when selection is expanded', () => {
			testCallbackStub.returns( true );

			model.change( writer => {
				writer.insertText( '@', doc.selection.getFirstPosition() );
			} );

			sinon.assert.calledOnce( testCallbackStub );
			sinon.assert.calledOnce( matchedDataSpy );
			sinon.assert.notCalled( matchedSelectionSpy );
			sinon.assert.notCalled( unmatchedSpy );

			model.change( writer => {
				const start = writer.createPositionAt( doc.getRoot().getChild( 0 ), 0 );

				writer.setSelection( writer.createRange( start, start.getShiftedBy( 1 ) ) );
			} );

			sinon.assert.calledOnce( testCallbackStub );
			sinon.assert.calledOnce( matchedDataSpy );
			sinon.assert.notCalled( matchedSelectionSpy );
			sinon.assert.calledOnce( unmatchedSpy );
		} );

		it( 'should not fire "umatched" event when selection is expanded if watcher is disabled', () => {
			watcher.isEnabled = false;

			testCallbackStub.returns( true );

			model.change( writer => {
				writer.insertText( '@', doc.selection.getFirstPosition() );
			} );

			sinon.assert.notCalled( testCallbackStub );
			sinon.assert.notCalled( matchedDataSpy );
			sinon.assert.notCalled( matchedSelectionSpy );
			sinon.assert.notCalled( unmatchedSpy );

			model.change( writer => {
				const start = writer.createPositionAt( doc.getRoot().getChild( 0 ), 0 );

				writer.setSelection( writer.createRange( start, start.getShiftedBy( 1 ) ) );
			} );

			sinon.assert.notCalled( testCallbackStub );
			sinon.assert.notCalled( matchedDataSpy );
			sinon.assert.notCalled( matchedSelectionSpy );
			sinon.assert.notCalled( unmatchedSpy );
		} );
	} );
} );
