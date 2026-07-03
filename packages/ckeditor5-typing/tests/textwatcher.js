/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { ModelTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import { _setModelData } from '@ckeditor/ckeditor5-engine';

import { TextWatcher } from '../src/textwatcher.js';

describe( 'TextWatcher', () => {
	let editor, model, doc;
	let watcher, matchedDataSpy, matchedSelectionSpy, unmatchedSpy, testCallbackStub;

	beforeEach( () => {
		return ModelTestEditor.create()
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				doc = model.document;

				testCallbackStub = vi.fn();
				matchedDataSpy = vi.fn();
				matchedSelectionSpy = vi.fn();
				unmatchedSpy = vi.fn();

				model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );

				_setModelData( model, '<paragraph>foo []</paragraph>' );

				watcher = new TextWatcher( model, testCallbackStub, () => {} );
				watcher.on( 'matched:data', matchedDataSpy );
				watcher.on( 'matched:selection', matchedSelectionSpy );
				watcher.on( 'unmatched', unmatchedSpy );
			} );
	} );

	afterEach( () => {
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

			expect( testCallbackStub ).toHaveBeenCalledOnce();
			expect( testCallbackStub ).toHaveBeenCalledWith( 'foo @' );
		} );

		it( 'should not evaluate text for not collapsed selection', () => {
			model.change( writer => {
				const start = writer.createPositionAt( doc.getRoot().getChild( 0 ), 0 );

				writer.setSelection( writer.createRange( start, start.getShiftedBy( 1 ) ) );
			} );

			expect( testCallbackStub ).not.toHaveBeenCalled();
		} );

		it( 'should evaluate text for selection changes', () => {
			model.change( writer => {
				writer.setSelection( doc.getRoot().getChild( 0 ), 1 );
			} );

			expect( testCallbackStub ).toHaveBeenCalledOnce();
			expect( testCallbackStub ).toHaveBeenCalledWith( 'f' );
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

			expect( testCallbackStub ).toHaveBeenCalledOnce();
			expect( testCallbackStub ).toHaveBeenCalledWith( '@' );
		} );

		it( 'should not evaluate text for undo batches', () => {
			model.enqueueChange( { isUndo: true }, writer => {
				writer.insertText( '@', doc.selection.getFirstPosition() );
			} );

			expect( testCallbackStub ).not.toHaveBeenCalled();
		} );

		it( 'should not evaluate text for non-local batches', () => {
			model.enqueueChange( { isLocal: false }, writer => {
				writer.insertText( '@', doc.selection.getFirstPosition() );
			} );

			expect( testCallbackStub ).not.toHaveBeenCalled();
		} );

		it( 'should not evaluate text when watcher is disabled', () => {
			watcher.isEnabled = false;

			model.change( writer => {
				writer.insertText( '@', doc.selection.getFirstPosition() );
			} );

			expect( testCallbackStub ).not.toHaveBeenCalled();
		} );

		it( 'should evaluate text when watcher is enabled again', () => {
			watcher.isEnabled = false;

			model.change( writer => {
				writer.insertText( '@', doc.selection.getFirstPosition() );
			} );

			expect( testCallbackStub ).not.toHaveBeenCalled();

			watcher.isEnabled = true;

			model.change( writer => {
				writer.insertText( '@', doc.selection.getFirstPosition() );
			} );

			expect( testCallbackStub ).toHaveBeenCalledOnce();
			expect( testCallbackStub ).toHaveBeenCalledWith( 'foo @@' );
		} );
	} );

	describe( 'events', () => {
		describe( '"matched:data"', () => {
			it( 'should be fired when test callback returns true for model data changes', () => {
				testCallbackStub.mockReturnValue( true );

				model.change( writer => {
					writer.insertText( '@', doc.selection.getFirstPosition() );
				} );

				expect( testCallbackStub ).toHaveBeenCalledOnce();
				expect( matchedDataSpy ).toHaveBeenCalledOnce();
				expect( matchedSelectionSpy ).not.toHaveBeenCalled();
				expect( unmatchedSpy ).not.toHaveBeenCalled();
			} );

			it( 'should be fired with additional data when test callback returns true for model data changes', () => {
				const additionalData = { abc: 'xyz' };

				testCallbackStub.mockReturnValue( additionalData );

				model.change( writer => {
					writer.insertText( '@', doc.selection.getFirstPosition() );
				} );

				expect( testCallbackStub ).toHaveBeenCalledOnce();
				expect( matchedDataSpy ).toHaveBeenCalledOnce();
				expect( matchedSelectionSpy ).not.toHaveBeenCalled();
				expect( unmatchedSpy ).not.toHaveBeenCalled();

				expect( matchedDataSpy.mock.calls[ 0 ][ 1 ] ).to.deep.include( additionalData );
			} );
		} );

		it( 'should not fire "matched:data" event when watcher is disabled' +
		' (even when test callback returns true for model data changes)', () => {
			watcher.isEnabled = false;

			testCallbackStub.mockReturnValue( true );

			model.change( writer => {
				writer.insertText( '@', doc.selection.getFirstPosition() );
			} );

			expect( testCallbackStub ).not.toHaveBeenCalled();
			expect( matchedDataSpy ).not.toHaveBeenCalled();
			expect( matchedSelectionSpy ).not.toHaveBeenCalled();
			expect( unmatchedSpy ).not.toHaveBeenCalled();
		} );

		it( 'should fire "matched:selection" event when test callback returns true for model data changes', () => {
			testCallbackStub.mockReturnValue( true );

			model.enqueueChange( { isLocal: false }, writer => {
				writer.insertText( '@', doc.selection.getFirstPosition() );
			} );

			model.change( writer => {
				writer.setSelection( doc.getRoot().getChild( 0 ), 0 );
			} );

			expect( testCallbackStub ).toHaveBeenCalledOnce();
			expect( matchedDataSpy ).not.toHaveBeenCalled();
			expect( matchedSelectionSpy ).toHaveBeenCalledOnce();
			expect( unmatchedSpy ).not.toHaveBeenCalled();
		} );

		it( 'should not fire "matched:selection" event when when watcher is disabled' +
		' (even when test callback returns true for model data changes)', () => {
			watcher.isEnabled = false;

			testCallbackStub.mockReturnValue( true );

			model.enqueueChange( { isUndoable: false }, writer => {
				writer.insertText( '@', doc.selection.getFirstPosition() );
			} );

			model.change( writer => {
				writer.setSelection( doc.getRoot().getChild( 0 ), 0 );
			} );

			expect( testCallbackStub ).not.toHaveBeenCalled();
			expect( matchedDataSpy ).not.toHaveBeenCalled();
			expect( matchedSelectionSpy ).not.toHaveBeenCalled();
			expect( unmatchedSpy ).not.toHaveBeenCalled();
		} );

		it( 'should not fire "matched" event when test callback returns false', () => {
			testCallbackStub.mockReturnValue( false );

			model.change( writer => {
				writer.insertText( '@', doc.selection.getFirstPosition() );
			} );

			expect( testCallbackStub ).toHaveBeenCalledOnce();
			expect( matchedDataSpy ).not.toHaveBeenCalled();
			expect( matchedSelectionSpy ).not.toHaveBeenCalled();
			expect( unmatchedSpy ).not.toHaveBeenCalled();
		} );

		it( 'should fire "unmatched" event when test callback returns false when it was previously matched', () => {
			testCallbackStub.mockReturnValue( true );

			model.change( writer => {
				writer.insertText( '@', doc.selection.getFirstPosition() );
			} );

			expect( testCallbackStub ).toHaveBeenCalledOnce();
			expect( matchedDataSpy ).toHaveBeenCalledOnce();
			expect( unmatchedSpy ).not.toHaveBeenCalled();

			testCallbackStub.mockReturnValue( false );

			model.change( writer => {
				writer.insertText( '@', doc.selection.getFirstPosition() );
			} );

			expect( testCallbackStub ).toHaveBeenCalledTimes( 2 );
			expect( matchedDataSpy ).toHaveBeenCalledOnce();
			expect( unmatchedSpy ).toHaveBeenCalledOnce();
		} );

		it( 'should fire "umatched" event when selection is expanded', () => {
			testCallbackStub.mockReturnValue( true );

			model.change( writer => {
				writer.insertText( '@', doc.selection.getFirstPosition() );
			} );

			expect( testCallbackStub ).toHaveBeenCalledOnce();
			expect( matchedDataSpy ).toHaveBeenCalledOnce();
			expect( matchedSelectionSpy ).not.toHaveBeenCalled();
			expect( unmatchedSpy ).not.toHaveBeenCalled();

			model.change( writer => {
				const start = writer.createPositionAt( doc.getRoot().getChild( 0 ), 0 );

				writer.setSelection( writer.createRange( start, start.getShiftedBy( 1 ) ) );
			} );

			expect( testCallbackStub ).toHaveBeenCalledOnce();
			expect( matchedDataSpy ).toHaveBeenCalledOnce();
			expect( matchedSelectionSpy ).not.toHaveBeenCalled();
			expect( unmatchedSpy ).toHaveBeenCalledOnce();
		} );

		it( 'should not fire "umatched" event when selection is expanded if watcher is disabled', () => {
			watcher.isEnabled = false;

			testCallbackStub.mockReturnValue( true );

			model.change( writer => {
				writer.insertText( '@', doc.selection.getFirstPosition() );
			} );

			expect( testCallbackStub ).not.toHaveBeenCalled();
			expect( matchedDataSpy ).not.toHaveBeenCalled();
			expect( matchedSelectionSpy ).not.toHaveBeenCalled();
			expect( unmatchedSpy ).not.toHaveBeenCalled();

			model.change( writer => {
				const start = writer.createPositionAt( doc.getRoot().getChild( 0 ), 0 );

				writer.setSelection( writer.createRange( start, start.getShiftedBy( 1 ) ) );
			} );

			expect( testCallbackStub ).not.toHaveBeenCalled();
			expect( matchedDataSpy ).not.toHaveBeenCalled();
			expect( matchedSelectionSpy ).not.toHaveBeenCalled();
			expect( unmatchedSpy ).not.toHaveBeenCalled();
		} );
	} );
} );
