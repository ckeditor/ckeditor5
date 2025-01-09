/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ListEditing from '../../../src/list/listediting.js';

import BoldEditing from '@ckeditor/ckeditor5-basic-styles/src/bold/boldediting.js';
import UndoEditing from '@ckeditor/ckeditor5-undo/src/undoediting.js';
import ClipboardPipeline from '@ckeditor/ckeditor5-clipboard/src/clipboardpipeline.js';
import BlockQuoteEditing from '@ckeditor/ckeditor5-block-quote/src/blockquoteediting.js';
import HeadingEditing from '@ckeditor/ckeditor5-heading/src/headingediting.js';
import TableEditing from '@ckeditor/ckeditor5-table/src/tableediting.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import EventInfo from '@ckeditor/ckeditor5-utils/src/eventinfo.js';
import ShiftEnter from '@ckeditor/ckeditor5-enter/src/shiftenter.js';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import {
	getData as getModelData,
	setData as setModelData
} from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { DomEventData } from '@ckeditor/ckeditor5-engine';

import stubUid from '../_utils/uid.js';
import { modelList } from '../_utils/utils.js';

describe( 'ListEditing integrations: enter key', () => {
	const changedBlocks = [];

	let editor, model, modelDoc, modelRoot, view;
	let eventInfo, domEventData;
	let splitBeforeCommand, splitAfterCommand, indentCommand,
		splitBeforeCommandExecuteSpy, splitAfterCommandExecuteSpy, outdentCommandExecuteSpy;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [
				Paragraph, ClipboardPipeline, BoldEditing, ListEditing, UndoEditing,
				BlockQuoteEditing, TableEditing, HeadingEditing, ShiftEnter
			]
		} );

		model = editor.model;
		modelDoc = model.document;
		modelRoot = modelDoc.getRoot();

		view = editor.editing.view;

		model.schema.extend( 'paragraph', {
			allowAttributes: 'foo'
		} );

		// Stub `view.scrollToTheSelection` as it will fail on VirtualTestEditor without DOM.
		sinon.stub( view, 'scrollToTheSelection' ).callsFake( () => { } );
		stubUid();

		eventInfo = new EventInfo( view.document, 'enter' );
		domEventData = new DomEventData( view.document, {
			preventDefault: sinon.spy()
		} );

		splitBeforeCommand = editor.commands.get( 'splitListItemBefore' );
		splitAfterCommand = editor.commands.get( 'splitListItemAfter' );
		indentCommand = editor.commands.get( 'outdentList' );

		splitBeforeCommandExecuteSpy = sinon.spy( splitBeforeCommand, 'execute' );
		splitAfterCommandExecuteSpy = sinon.spy( splitAfterCommand, 'execute' );
		outdentCommandExecuteSpy = sinon.spy( indentCommand, 'execute' );

		changedBlocks.length = 0;

		splitBeforeCommand.on( 'afterExecute', ( evt, data ) => {
			changedBlocks.push( ...data );
		} );

		splitAfterCommand.on( 'afterExecute', ( evt, data ) => {
			changedBlocks.push( ...data );
		} );

		indentCommand.on( 'afterExecute', ( evt, data ) => {
			changedBlocks.push( ...data );
		} );
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	describe( 'collapsed selection', () => {
		describe( 'with just one block per list item', () => {
			it( 'should outdent if the slection in the only empty list item (convert into paragraph and turn off the list)', () => {
				setModelData( model, modelList( [
					'* []'
				] ) );

				view.document.fire( eventInfo, domEventData );

				expect( getModelData( model ) ).to.equalMarkup( modelList( [
					'[]'
				] ) );

				expect( changedBlocks ).to.deep.equal( [
					modelRoot.getChild( 0 )
				] );

				sinon.assert.calledOnce( outdentCommandExecuteSpy );
				sinon.assert.notCalled( splitBeforeCommandExecuteSpy );
				sinon.assert.notCalled( splitAfterCommandExecuteSpy );

				sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
				expect( eventInfo.stop.called ).to.be.true;
			} );

			it( 'should outdent if the slection in the last empty list item (convert the item into paragraph)', () => {
				setModelData( model, modelList( [
					'* a',
					'* []'
				] ) );

				view.document.fire( eventInfo, domEventData );

				expect( getModelData( model ) ).to.equalMarkup( modelList( [
					'* a',
					'[]'
				] ) );

				expect( changedBlocks ).to.deep.equal( [
					modelRoot.getChild( 1 )
				] );

				sinon.assert.calledOnce( outdentCommandExecuteSpy );
				sinon.assert.notCalled( splitBeforeCommandExecuteSpy );
				sinon.assert.notCalled( splitAfterCommandExecuteSpy );

				sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
				expect( eventInfo.stop.called ).to.be.true;
			} );

			it( 'should create another list item when the selection in a non-empty only list item', () => {
				setModelData( model, modelList( [
					'* a[]'
				] ) );

				view.document.fire( eventInfo, domEventData );

				expect( getModelData( model ) ).to.equalMarkup( modelList( [
					'* a',
					'* [] {id:a00}'
				] ) );

				expect( changedBlocks ).to.deep.equal( [
					modelRoot.getChild( 1 )
				] );

				sinon.assert.notCalled( outdentCommandExecuteSpy );
				sinon.assert.calledOnce( splitBeforeCommandExecuteSpy );
				sinon.assert.notCalled( splitAfterCommandExecuteSpy );

				sinon.assert.calledTwice( domEventData.domEvent.preventDefault );
				expect( eventInfo.stop.called ).to.be.undefined;
			} );

			it( 'should outdent if the selection in an empty, last sub-list item', () => {
				setModelData( model, modelList( [
					'* a',
					'  # b',
					'    * c',
					'    * []'
				] ) );

				view.document.fire( eventInfo, domEventData );

				expect( getModelData( model ) ).to.equalMarkup( modelList( [
					'* a',
					'  # b',
					'    * c',
					'  # []'
				] ) );

				expect( changedBlocks ).to.deep.equal( [
					modelRoot.getChild( 3 )
				] );

				sinon.assert.calledOnce( outdentCommandExecuteSpy );
				sinon.assert.notCalled( splitBeforeCommandExecuteSpy );
				sinon.assert.notCalled( splitAfterCommandExecuteSpy );

				sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
				expect( eventInfo.stop.called ).to.be.true;
			} );

			describe( 'with shift', () => {
				beforeEach( () => {
					domEventData.isSoft = true;
				} );

				it( 'should not capture event', () => {
					setModelData( model, modelList( [
						'* []'
					] ) );

					view.document.fire( eventInfo, domEventData );

					expect( getModelData( model ) ).to.equalMarkup( modelList( [
						'* <softBreak></softBreak>[]'
					] ) );

					expect( changedBlocks ).to.deep.equal( [ ] );

					sinon.assert.notCalled( outdentCommandExecuteSpy );
					sinon.assert.notCalled( splitBeforeCommandExecuteSpy );
					sinon.assert.notCalled( splitAfterCommandExecuteSpy );

					sinon.assert.calledTwice( domEventData.domEvent.preventDefault );
					expect( eventInfo.stop.called ).to.be.undefined;
				} );

				it( 'should create a soft break in an empty item at the end of a list', () => {
					setModelData( model, modelList( [
						'* Foo',
						'* []'
					] ) );

					view.document.fire( eventInfo, domEventData );

					expect( getModelData( model ) ).to.equalMarkup( modelList( [
						'* Foo',
						'* <softBreak></softBreak>[]'
					] ) );

					expect( changedBlocks ).to.deep.equal( [ ] );

					sinon.assert.notCalled( outdentCommandExecuteSpy );
					sinon.assert.notCalled( splitBeforeCommandExecuteSpy );
					sinon.assert.notCalled( splitAfterCommandExecuteSpy );

					sinon.assert.calledTwice( domEventData.domEvent.preventDefault );
					expect( eventInfo.stop.called ).to.be.undefined;
				} );

				it( 'should create a soft break in an indented empty item at the end of a list', () => {
					setModelData( model, modelList( [
						'* Foo',
						'  * []'
					] ) );

					view.document.fire( eventInfo, domEventData );

					expect( getModelData( model ) ).to.equalMarkup( modelList( [
						'* Foo',
						'  * <softBreak></softBreak>[]'
					] ) );

					expect( changedBlocks ).to.deep.equal( [ ] );

					sinon.assert.notCalled( outdentCommandExecuteSpy );
					sinon.assert.notCalled( splitBeforeCommandExecuteSpy );
					sinon.assert.notCalled( splitAfterCommandExecuteSpy );

					sinon.assert.calledTwice( domEventData.domEvent.preventDefault );
					expect( eventInfo.stop.called ).to.be.undefined;
				} );
			} );
		} );

		describe( 'with multiple blocks in a list item', () => {
			it( 'should outdent if the selection is anchored in an empty, last item block', () => {
				setModelData( model, modelList( [
					'* a',
					'  # b',
					'  # []'
				] ) );

				view.document.fire( eventInfo, domEventData );

				expect( getModelData( model ) ).to.equalMarkup( modelList( [
					'* a',
					'  # b',
					'* []'
				] ) );

				expect( changedBlocks ).to.deep.equal( [
					modelRoot.getChild( 2 )
				] );

				sinon.assert.calledOnce( outdentCommandExecuteSpy );
				sinon.assert.notCalled( splitBeforeCommandExecuteSpy );
				sinon.assert.notCalled( splitAfterCommandExecuteSpy );

				sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
				expect( eventInfo.stop.called ).to.be.true;
			} );

			it( 'should outdent if the selection is anchored in an empty, only sub-item block', () => {
				setModelData( model, modelList( [
					'* a',
					'  # b',
					'    * []',
					'  #'
				] ) );

				view.document.fire( eventInfo, domEventData );

				expect( getModelData( model ) ).to.equalMarkup( modelList( [
					'* a',
					'  # b',
					'  # []',
					'  #'
				] ) );

				expect( changedBlocks ).to.deep.equal( [
					modelRoot.getChild( 2 )
				] );

				sinon.assert.calledOnce( outdentCommandExecuteSpy );
				sinon.assert.notCalled( splitBeforeCommandExecuteSpy );
				sinon.assert.notCalled( splitAfterCommandExecuteSpy );

				sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
				expect( eventInfo.stop.called ).to.be.true;
			} );

			it( 'should create another block when the selection at the start of a non-empty first block', () => {
				setModelData( model, modelList( [
					'* a[]',
					'  b',
					'  c'
				] ) );

				view.document.fire( eventInfo, domEventData );

				expect( getModelData( model ) ).to.equalMarkup( modelList( [
					'* a',
					'  []',
					'  b',
					'  c'
				] ) );

				expect( changedBlocks ).to.deep.equal( [] );

				sinon.assert.notCalled( outdentCommandExecuteSpy );
				sinon.assert.notCalled( splitBeforeCommandExecuteSpy );
				sinon.assert.notCalled( splitAfterCommandExecuteSpy );

				sinon.assert.calledTwice( domEventData.domEvent.preventDefault );
				expect( eventInfo.stop.called ).to.be.undefined;
			} );

			it( 'should create another block when the selection at the end of a non-empty first block', () => {
				setModelData( model, modelList( [
					'* []a',
					'  b',
					'  c'
				] ) );

				view.document.fire( eventInfo, domEventData );

				expect( getModelData( model ) ).to.equalMarkup( modelList( [
					'* ',
					'  []a',
					'  b',
					'  c'
				] ) );

				expect( changedBlocks ).to.deep.equal( [] );

				sinon.assert.notCalled( outdentCommandExecuteSpy );
				sinon.assert.notCalled( splitBeforeCommandExecuteSpy );
				sinon.assert.notCalled( splitAfterCommandExecuteSpy );

				sinon.assert.calledTwice( domEventData.domEvent.preventDefault );
				expect( eventInfo.stop.called ).to.be.undefined;
			} );

			it( 'should create another block when the selection at the start of a non-empty last block', () => {
				setModelData( model, modelList( [
					'* a',
					'  b',
					'  []c'
				] ) );

				view.document.fire( eventInfo, domEventData );

				expect( getModelData( model ) ).to.equalMarkup( modelList( [
					'* a',
					'  b',
					'  ',
					'  []c'
				] ) );

				expect( changedBlocks ).to.deep.equal( [] );

				sinon.assert.notCalled( outdentCommandExecuteSpy );
				sinon.assert.notCalled( splitBeforeCommandExecuteSpy );
				sinon.assert.notCalled( splitAfterCommandExecuteSpy );

				sinon.assert.calledTwice( domEventData.domEvent.preventDefault );
				expect( eventInfo.stop.called ).to.be.undefined;
			} );

			it( 'should create another block when the selection at the end of a non-empty last block', () => {
				setModelData( model, modelList( [
					'* a',
					'  b',
					'  c[]'
				] ) );

				view.document.fire( eventInfo, domEventData );

				expect( getModelData( model ) ).to.equalMarkup( modelList( [
					'* a',
					'  b',
					'  c',
					'  []'
				] ) );

				expect( changedBlocks ).to.deep.equal( [] );

				sinon.assert.notCalled( outdentCommandExecuteSpy );
				sinon.assert.notCalled( splitBeforeCommandExecuteSpy );
				sinon.assert.notCalled( splitAfterCommandExecuteSpy );

				sinon.assert.calledTwice( domEventData.domEvent.preventDefault );
				expect( eventInfo.stop.called ).to.be.undefined;
			} );

			it( 'should create another block when the selection in an empty middle block', () => {
				setModelData( model, modelList( [
					'* a',
					'  []',
					'  c'
				] ) );

				view.document.fire( eventInfo, domEventData );

				expect( getModelData( model ) ).to.equalMarkup( modelList( [
					'* a',
					'  ',
					'  []',
					'  c'
				] ) );

				expect( changedBlocks ).to.deep.equal( [] );

				sinon.assert.notCalled( outdentCommandExecuteSpy );
				sinon.assert.notCalled( splitBeforeCommandExecuteSpy );
				sinon.assert.notCalled( splitAfterCommandExecuteSpy );

				sinon.assert.calledTwice( domEventData.domEvent.preventDefault );
				expect( eventInfo.stop.called ).to.be.undefined;
			} );

			it( 'should create another list item when the selection in an empty last block (two blocks in total)', () => {
				setModelData( model, modelList( [
					'* a',
					'  []'
				] ) );

				view.document.fire( eventInfo, domEventData );

				expect( getModelData( model ) ).to.equalMarkup( modelList( [
					'* a',
					'* [] {id:a00}'
				] ) );

				expect( changedBlocks ).to.deep.equal( [
					modelRoot.getChild( 1 )
				] );

				sinon.assert.notCalled( outdentCommandExecuteSpy );
				sinon.assert.calledOnce( splitBeforeCommandExecuteSpy );
				sinon.assert.notCalled( splitAfterCommandExecuteSpy );

				sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
				expect( eventInfo.stop.called ).to.be.true;
			} );

			it( 'should create another list item when the selection in an empty last block (three blocks in total)', () => {
				setModelData( model, modelList( [
					'* a',
					'  b',
					'  []'
				] ) );

				view.document.fire( eventInfo, domEventData );

				expect( getModelData( model ) ).to.equalMarkup( modelList( [
					'* a',
					'  b',
					'* [] {id:a00}'
				] ) );

				expect( changedBlocks ).to.deep.equal( [
					modelRoot.getChild( 2 )
				] );

				sinon.assert.notCalled( outdentCommandExecuteSpy );
				sinon.assert.calledOnce( splitBeforeCommandExecuteSpy );
				sinon.assert.notCalled( splitAfterCommandExecuteSpy );

				sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
				expect( eventInfo.stop.called ).to.be.true;
			} );

			it( 'should create another list item when the selection in an empty last block (followed by a list item)', () => {
				setModelData( model, modelList( [
					'* a',
					'  b',
					'  []',
					'* '
				] ) );

				view.document.fire( eventInfo, domEventData );

				expect( getModelData( model ) ).to.equalMarkup( modelList( [
					'* a',
					'  b',
					'* [] {id:a00}',
					'* '
				] ) );

				expect( changedBlocks ).to.deep.equal( [
					modelRoot.getChild( 2 )
				] );

				sinon.assert.notCalled( outdentCommandExecuteSpy );
				sinon.assert.calledOnce( splitBeforeCommandExecuteSpy );
				sinon.assert.notCalled( splitAfterCommandExecuteSpy );

				sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
				expect( eventInfo.stop.called ).to.be.true;
			} );

			it( 'should create another list item when the selection in an empty first block (followed by another block)', () => {
				setModelData( model, modelList( [
					'* []',
					'  b'
				] ) );

				view.document.fire( eventInfo, domEventData );

				expect( getModelData( model ) ).to.equalMarkup( modelList( [
					'* []',
					'* b {id:a00}'
				] ) );

				expect( changedBlocks ).to.deep.equal( [
					modelRoot.getChild( 1 )
				] );

				sinon.assert.notCalled( outdentCommandExecuteSpy );
				sinon.assert.notCalled( splitBeforeCommandExecuteSpy );
				sinon.assert.calledOnce( splitAfterCommandExecuteSpy );

				sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
				expect( eventInfo.stop.called ).to.be.true;
			} );

			it( 'should create another list item when the selection in an empty first block (followed by multiple blocks)', () => {
				setModelData( model, modelList( [
					'* []',
					'  a',
					'  b'
				] ) );

				view.document.fire( eventInfo, domEventData );

				expect( getModelData( model ) ).to.equalMarkup( modelList( [
					'* []',
					'* a {id:a00}',
					'  b'
				] ) );

				expect( changedBlocks ).to.deep.equal( [
					modelRoot.getChild( 1 ),
					modelRoot.getChild( 2 )
				] );

				sinon.assert.notCalled( outdentCommandExecuteSpy );
				sinon.assert.notCalled( splitBeforeCommandExecuteSpy );
				sinon.assert.calledOnce( splitAfterCommandExecuteSpy );

				sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
				expect( eventInfo.stop.called ).to.be.true;
			} );

			it( 'should create another list item when the selection in an empty first block (followed by multiple blocks and an item)',
				() => {
					setModelData( model, modelList( [
						'* []',
						'  a',
						'  b',
						'* c'
					] ) );

					view.document.fire( eventInfo, domEventData );

					expect( getModelData( model ) ).to.equalMarkup( modelList( [
						'* []',
						'* a {id:a00}',
						'  b',
						'* c'
					] ) );

					expect( changedBlocks ).to.deep.equal( [
						modelRoot.getChild( 1 ),
						modelRoot.getChild( 2 )
					] );

					sinon.assert.notCalled( outdentCommandExecuteSpy );
					sinon.assert.notCalled( splitBeforeCommandExecuteSpy );
					sinon.assert.calledOnce( splitAfterCommandExecuteSpy );

					sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
					expect( eventInfo.stop.called ).to.be.true;
				} );

			describe( 'with shift', () => {
				beforeEach( () => {
					domEventData.isSoft = true;
				} );

				it( 'should not capture event', () => {
					setModelData( model, modelList( [
						'* ',
						'  []'
					] ) );

					view.document.fire( eventInfo, domEventData );

					expect( getModelData( model ) ).to.equalMarkup( modelList( [
						'* ',
						'  <softBreak></softBreak>[]'
					] ) );

					expect( changedBlocks ).to.deep.equal( [ ] );

					sinon.assert.notCalled( outdentCommandExecuteSpy );
					sinon.assert.notCalled( splitBeforeCommandExecuteSpy );
					sinon.assert.notCalled( splitAfterCommandExecuteSpy );

					sinon.assert.calledTwice( domEventData.domEvent.preventDefault );
					expect( eventInfo.stop.called ).to.be.undefined;
				} );

				it( 'should create a soft break in a block of a list item at the end of a list', () => {
					setModelData( model, modelList( [
						'* Foo',
						'* ',
						'  []'
					] ) );

					view.document.fire( eventInfo, domEventData );

					expect( getModelData( model ) ).to.equalMarkup( modelList( [
						'* Foo',
						'* ',
						'  <softBreak></softBreak>[]'
					] ) );

					expect( changedBlocks ).to.deep.equal( [ ] );

					sinon.assert.notCalled( outdentCommandExecuteSpy );
					sinon.assert.notCalled( splitBeforeCommandExecuteSpy );
					sinon.assert.notCalled( splitAfterCommandExecuteSpy );

					sinon.assert.calledTwice( domEventData.domEvent.preventDefault );
					expect( eventInfo.stop.called ).to.be.undefined;
				} );
			} );
		} );
	} );

	describe( 'non-collapsed selection', () => {
		describe( 'with just one block per list item', () => {
			it( 'should create another list item if the selection contains some content at the end of the list item', () => {
				setModelData( model, modelList( [
					'* a[b]'
				] ) );

				view.document.fire( eventInfo, domEventData );

				expect( getModelData( model ) ).to.equalMarkup( modelList( [
					'* a',
					'* [] {id:a00}'
				] ) );

				expect( changedBlocks ).to.deep.equal( [
					modelRoot.getChild( 1 )
				] );

				sinon.assert.notCalled( outdentCommandExecuteSpy );
				sinon.assert.calledOnce( splitBeforeCommandExecuteSpy );
				sinon.assert.notCalled( splitAfterCommandExecuteSpy );

				sinon.assert.calledTwice( domEventData.domEvent.preventDefault );
				expect( eventInfo.stop.called ).to.be.undefined;
			} );

			it( 'should create another list item if the selection contains some content at the start of the list item', () => {
				setModelData( model, modelList( [
					'* [a]b'
				] ) );

				view.document.fire( eventInfo, domEventData );

				expect( getModelData( model ) ).to.equalMarkup( modelList( [
					'* ',
					'* []b {id:a00}'
				] ) );

				expect( changedBlocks ).to.deep.equal( [
					modelRoot.getChild( 1 )
				] );

				sinon.assert.notCalled( outdentCommandExecuteSpy );
				sinon.assert.calledOnce( splitBeforeCommandExecuteSpy );
				sinon.assert.notCalled( splitAfterCommandExecuteSpy );

				sinon.assert.calledTwice( domEventData.domEvent.preventDefault );
				expect( eventInfo.stop.called ).to.be.undefined;
			} );

			it( 'should clean the content and turn off the list if slection contains all content at the zero indent level', () => {
				setModelData( model, modelList( [
					'* [a',
					'* b]'
				] ) );

				view.document.fire( eventInfo, domEventData );

				expect( getModelData( model ) ).to.equalMarkup( modelList( [
					'[]'
				] ) );

				expect( changedBlocks ).to.deep.equal( [] );

				sinon.assert.notCalled( outdentCommandExecuteSpy );
				sinon.assert.notCalled( splitBeforeCommandExecuteSpy );
				sinon.assert.notCalled( splitAfterCommandExecuteSpy );

				sinon.assert.calledTwice( domEventData.domEvent.preventDefault );
				expect( eventInfo.stop.called ).to.be.undefined;
			} );

			it( 'should clean the content and move the selection when it contains some content at the zero indent level', () => {
				setModelData( model, modelList( [
					'* a[b',
					'* b]'
				] ) );

				view.document.fire( eventInfo, domEventData );

				expect( getModelData( model ) ).to.equalMarkup( modelList( [
					'* a',
					'* []'
				] ) );

				expect( changedBlocks ).to.deep.equal( [] );

				sinon.assert.notCalled( outdentCommandExecuteSpy );
				sinon.assert.notCalled( splitBeforeCommandExecuteSpy );
				sinon.assert.notCalled( splitAfterCommandExecuteSpy );

				sinon.assert.calledTwice( domEventData.domEvent.preventDefault );
				expect( eventInfo.stop.called ).to.be.undefined;
			} );

			it( 'should clean the content when the selection contains all content at a deeper indent level', () => {
				setModelData( model, modelList( [
					'* a',
					'  # b',
					'    * [c',
					'    * d]'
				] ) );

				view.document.fire( eventInfo, domEventData );

				expect( getModelData( model ) ).to.equalMarkup( modelList( [
					'* a',
					'  # b',
					'    * []'
				] ) );

				expect( changedBlocks ).to.deep.equal( [] );

				sinon.assert.notCalled( outdentCommandExecuteSpy );
				sinon.assert.notCalled( splitBeforeCommandExecuteSpy );
				sinon.assert.notCalled( splitAfterCommandExecuteSpy );

				sinon.assert.calledTwice( domEventData.domEvent.preventDefault );
				expect( eventInfo.stop.called ).to.be.undefined;
			} );

			describe( 'with shift', () => {
				beforeEach( () => {
					domEventData.isSoft = true;
				} );

				it( 'should replace text with soft break', () => {
					setModelData( model, modelList( [
						'* [ab]'
					] ) );

					view.document.fire( eventInfo, domEventData );

					expect( getModelData( model ) ).to.equalMarkup( modelList( [
						'* <softBreak></softBreak>[]'
					] ) );

					expect( changedBlocks ).to.deep.equal( [ ] );

					sinon.assert.notCalled( outdentCommandExecuteSpy );
					sinon.assert.notCalled( splitBeforeCommandExecuteSpy );
					sinon.assert.notCalled( splitAfterCommandExecuteSpy );

					sinon.assert.calledTwice( domEventData.domEvent.preventDefault );
					expect( eventInfo.stop.called ).to.be.undefined;
				} );

				it( 'should delete selected text and set selection in new paragraph', () => {
					setModelData( model, modelList( [
						'* F[oo',
						'* Bar]'
					] ) );

					view.document.fire( eventInfo, domEventData );

					expect( getModelData( model ) ).to.equalMarkup( modelList( [
						'* F',
						'* []'
					] ) );

					expect( changedBlocks ).to.deep.equal( [ ] );

					sinon.assert.notCalled( outdentCommandExecuteSpy );
					sinon.assert.notCalled( splitBeforeCommandExecuteSpy );
					sinon.assert.notCalled( splitAfterCommandExecuteSpy );

					sinon.assert.calledTwice( domEventData.domEvent.preventDefault );
					expect( eventInfo.stop.called ).to.be.undefined;
				} );
			} );

			describe( 'cross-indent level selection', () => {
				it( 'should clean the content and remove list across different indentation levels (list the only content)', () => {
					setModelData( model, modelList( [
						'* [ab',
						'  # cd]'
					] ) );

					view.document.fire( eventInfo, domEventData );

					expect( getModelData( model ) ).to.equalMarkup( modelList( [
						'[]'
					] ) );

					expect( changedBlocks ).to.deep.equal( [] );

					sinon.assert.notCalled( outdentCommandExecuteSpy );
					sinon.assert.notCalled( splitBeforeCommandExecuteSpy );
					sinon.assert.notCalled( splitAfterCommandExecuteSpy );

					sinon.assert.calledTwice( domEventData.domEvent.preventDefault );
					expect( eventInfo.stop.called ).to.be.undefined;
				} );

				it( 'should clean the content across different indentation levels (one level, entire blocks)', () => {
					setModelData( model, modelList( [
						'foo',
						'* [ab',
						'  # cd]'
					] ) );

					view.document.fire( eventInfo, domEventData );

					expect( getModelData( model ) ).to.equalMarkup( modelList( [
						'foo',
						'* []'
					] ) );

					expect( changedBlocks ).to.deep.equal( [] );

					sinon.assert.notCalled( outdentCommandExecuteSpy );
					sinon.assert.notCalled( splitBeforeCommandExecuteSpy );
					sinon.assert.notCalled( splitAfterCommandExecuteSpy );

					sinon.assert.calledTwice( domEventData.domEvent.preventDefault );
					expect( eventInfo.stop.called ).to.be.undefined;
				} );

				it( 'should clean the content across different indentation levels (one level, subset of blocks)', () => {
					setModelData( model, modelList( [
						'foo',
						'* a[b',
						'  # c]d'
					] ) );

					view.document.fire( eventInfo, domEventData );

					expect( getModelData( model ) ).to.equalMarkup( modelList( [
						'foo',
						'* a',
						'  # []d'
					] ) );

					expect( changedBlocks ).to.deep.equal( [] );

					sinon.assert.notCalled( outdentCommandExecuteSpy );
					sinon.assert.notCalled( splitBeforeCommandExecuteSpy );
					sinon.assert.notCalled( splitAfterCommandExecuteSpy );

					sinon.assert.calledTwice( domEventData.domEvent.preventDefault );
					expect( eventInfo.stop.called ).to.be.undefined;
				} );

				it( 'should clean the content across different indentation levels (two levels, entire blocks)', () => {
					setModelData( model, modelList( [
						'* [ab',
						'  # cd',
						'    * ef]',
						'    * gh'
					] ) );

					view.document.fire( eventInfo, domEventData );

					expect( getModelData( model ) ).to.equalMarkup( modelList( [
						'* []',
						'  * gh {id:003}'
					] ) );

					expect( changedBlocks ).to.deep.equal( [] );

					sinon.assert.notCalled( outdentCommandExecuteSpy );
					sinon.assert.notCalled( splitBeforeCommandExecuteSpy );
					sinon.assert.notCalled( splitAfterCommandExecuteSpy );

					sinon.assert.calledTwice( domEventData.domEvent.preventDefault );
					expect( eventInfo.stop.called ).to.be.undefined;
				} );

				it( 'should clean the content across different indentation levels (two levels, subset of blocks)', () => {
					setModelData( model, modelList( [
						'* a[b',
						'  # cd',
						'    * e]f',
						'    * gh'
					] ) );

					view.document.fire( eventInfo, domEventData );

					expect( getModelData( model ) ).to.equalMarkup( modelList( [
						'* a',
						'  * []f {id:002}',
						'  * gh {id:003}'
					] ) );

					expect( changedBlocks ).to.deep.equal( [] );

					sinon.assert.notCalled( outdentCommandExecuteSpy );
					sinon.assert.notCalled( splitBeforeCommandExecuteSpy );
					sinon.assert.notCalled( splitAfterCommandExecuteSpy );

					sinon.assert.calledTwice( domEventData.domEvent.preventDefault );
					expect( eventInfo.stop.called ).to.be.undefined;
				} );

				it( 'should clean the content across different indentation levels (three levels, entire blocks)', () => {
					setModelData( model, modelList( [
						'foo',
						'* [ab',
						'  # cd',
						'    * ef',
						'    * gh]'
					] ) );

					view.document.fire( eventInfo, domEventData );

					expect( getModelData( model ) ).to.equalMarkup( modelList( [
						'foo',
						'* []'
					] ) );

					expect( changedBlocks ).to.deep.equal( [] );

					sinon.assert.notCalled( outdentCommandExecuteSpy );
					sinon.assert.notCalled( splitBeforeCommandExecuteSpy );
					sinon.assert.notCalled( splitAfterCommandExecuteSpy );

					sinon.assert.calledTwice( domEventData.domEvent.preventDefault );
					expect( eventInfo.stop.called ).to.be.undefined;
				} );

				it( 'should clean the content and remove list across different indentation levels ' +
					'(three levels, list the only content)', () => {
					setModelData( model, modelList( [
						'* [ab',
						'  # cd',
						'    * ef',
						'    * gh]'
					] ) );

					view.document.fire( eventInfo, domEventData );

					expect( getModelData( model ) ).to.equalMarkup( modelList( [
						'[]'
					] ) );

					expect( changedBlocks ).to.deep.equal( [] );

					sinon.assert.notCalled( outdentCommandExecuteSpy );
					sinon.assert.notCalled( splitBeforeCommandExecuteSpy );
					sinon.assert.notCalled( splitAfterCommandExecuteSpy );

					sinon.assert.calledTwice( domEventData.domEvent.preventDefault );
					expect( eventInfo.stop.called ).to.be.undefined;
				} );

				it( 'should clean the content across different indentation levels (three levels, subset of blocks)', () => {
					setModelData( model, modelList( [
						'* a[b',
						'  # cd',
						'    * ef',
						'      # g]h',
						'    * ij'
					] ) );

					view.document.fire( eventInfo, domEventData );

					expect( getModelData( model ) ).to.equalMarkup( modelList( [
						'* a',
						'  # []h {id:003}',
						'* ij {id:004}'
					] ) );

					expect( changedBlocks ).to.deep.equal( [] );

					sinon.assert.notCalled( outdentCommandExecuteSpy );
					sinon.assert.notCalled( splitBeforeCommandExecuteSpy );
					sinon.assert.notCalled( splitAfterCommandExecuteSpy );

					sinon.assert.calledTwice( domEventData.domEvent.preventDefault );
					expect( eventInfo.stop.called ).to.be.undefined;
				} );

				it( 'should clean the content across different indentation levels (one level, start at first, entire blocks)', () => {
					setModelData( model, modelList( [
						'* ab',
						'  # [cd',
						'    * ef',
						'    * gh]'
					] ) );

					view.document.fire( eventInfo, domEventData );

					expect( getModelData( model ) ).to.equalMarkup( modelList( [
						'* ab',
						'  # []'
					] ) );

					expect( changedBlocks ).to.deep.equal( [] );

					sinon.assert.notCalled( outdentCommandExecuteSpy );
					sinon.assert.notCalled( splitBeforeCommandExecuteSpy );
					sinon.assert.notCalled( splitAfterCommandExecuteSpy );

					sinon.assert.calledTwice( domEventData.domEvent.preventDefault );
					expect( eventInfo.stop.called ).to.be.undefined;
				} );

				it( 'should clean the content across different indentation levels (one level, start at first, part of blocks)', () => {
					setModelData( model, modelList( [
						'* ab',
						'  # c[d',
						'    * ef',
						'    * g]h'
					] ) );

					view.document.fire( eventInfo, domEventData );

					expect( getModelData( model ) ).to.equalMarkup( modelList( [
						'* ab',
						'  # c',
						'    * []h {id:003}'
					] ) );

					expect( changedBlocks ).to.deep.equal( [] );

					sinon.assert.notCalled( outdentCommandExecuteSpy );
					sinon.assert.notCalled( splitBeforeCommandExecuteSpy );
					sinon.assert.notCalled( splitAfterCommandExecuteSpy );

					sinon.assert.calledTwice( domEventData.domEvent.preventDefault );
					expect( eventInfo.stop.called ).to.be.undefined;
				} );

				it( 'should clean the content across different indentation levels (level up then down, subset of blocks)', () => {
					setModelData( model, modelList( [
						'* ab',
						'  # c[d',
						'    * ef',
						'  # g]h'
					] ) );

					view.document.fire( eventInfo, domEventData );

					expect( getModelData( model ) ).to.equalMarkup( modelList( [
						'* ab',
						'  # c',
						'  # []h {id:003}'
					] ) );

					expect( changedBlocks ).to.deep.equal( [] );

					sinon.assert.notCalled( outdentCommandExecuteSpy );
					sinon.assert.notCalled( splitBeforeCommandExecuteSpy );
					sinon.assert.notCalled( splitAfterCommandExecuteSpy );

					sinon.assert.calledTwice( domEventData.domEvent.preventDefault );
					expect( eventInfo.stop.called ).to.be.undefined;
				} );

				it( 'should clean the content across different indentation levels (level up then down, entire of blocks)', () => {
					setModelData( model, modelList( [
						'* ab',
						'  # [cd',
						'    * ef',
						'  # gh]',
						'* ij'
					] ) );

					view.document.fire( eventInfo, domEventData );

					expect( getModelData( model ) ).to.equalMarkup( modelList( [
						'* ab',
						'  # []',
						'* ij {id:004}'
					] ) );

					expect( changedBlocks ).to.deep.equal( [] );

					sinon.assert.notCalled( outdentCommandExecuteSpy );
					sinon.assert.notCalled( splitBeforeCommandExecuteSpy );
					sinon.assert.notCalled( splitAfterCommandExecuteSpy );

					sinon.assert.calledTwice( domEventData.domEvent.preventDefault );
					expect( eventInfo.stop.called ).to.be.undefined;
				} );

				it( 'should clean the content across different indentation levels (level up then down, preceded by an item)', () => {
					setModelData( model, modelList( [
						'* ab',
						'  # cd',
						'  # [ef',
						'    * gh',
						'  # ij]',
						'* kl'
					] ) );

					view.document.fire( eventInfo, domEventData );

					expect( getModelData( model ) ).to.equalMarkup( modelList( [
						'* ab',
						'  # cd',
						'  # []',
						'* kl {id:005}'
					] ) );

					expect( changedBlocks ).to.deep.equal( [] );

					sinon.assert.notCalled( outdentCommandExecuteSpy );
					sinon.assert.notCalled( splitBeforeCommandExecuteSpy );
					sinon.assert.notCalled( splitAfterCommandExecuteSpy );

					sinon.assert.calledTwice( domEventData.domEvent.preventDefault );
					expect( eventInfo.stop.called ).to.be.undefined;
				} );
			} );
		} );

		describe( 'with multiple blocks in a list item', () => {
			it( 'should clean the selected content (partial blocks)', () => {
				setModelData( model, modelList( [
					'* a[b',
					'  c]d'
				] ) );

				view.document.fire( eventInfo, domEventData );

				expect( getModelData( model ) ).to.equalMarkup( modelList( [
					'* a',
					'* []d {id:a00}'
				] ) );

				expect( changedBlocks ).to.deep.equal( [
					modelRoot.getChild( 1 )
				] );

				sinon.assert.notCalled( outdentCommandExecuteSpy );
				sinon.assert.calledOnce( splitBeforeCommandExecuteSpy );
				sinon.assert.notCalled( splitAfterCommandExecuteSpy );

				sinon.assert.calledTwice( domEventData.domEvent.preventDefault );
				expect( eventInfo.stop.called ).to.be.undefined;
			} );

			it( 'should clean the selected content (entire blocks)', () => {
				setModelData( model, modelList( [
					'foo',
					'* [ab',
					'  cd]'
				] ) );

				view.document.fire( eventInfo, domEventData );

				expect( getModelData( model ) ).to.equalMarkup( modelList( [
					'foo',
					'* []'
				] ) );

				expect( changedBlocks ).to.deep.equal( [] );

				sinon.assert.notCalled( outdentCommandExecuteSpy );
				sinon.assert.notCalled( splitBeforeCommandExecuteSpy );
				sinon.assert.notCalled( splitAfterCommandExecuteSpy );

				sinon.assert.calledTwice( domEventData.domEvent.preventDefault );
				expect( eventInfo.stop.called ).to.be.undefined;
			} );

			it( 'should clean the selected content (entire block, middle one)', () => {
				setModelData( model, modelList( [
					'* ab',
					'  [cd]',
					'  ef'
				] ) );

				view.document.fire( eventInfo, domEventData );

				expect( getModelData( model ) ).to.equalMarkup( modelList( [
					'* ab',
					'  []',
					'  ef'
				] ) );

				expect( changedBlocks ).to.deep.equal( [] );

				sinon.assert.notCalled( outdentCommandExecuteSpy );
				sinon.assert.notCalled( splitBeforeCommandExecuteSpy );
				sinon.assert.notCalled( splitAfterCommandExecuteSpy );

				sinon.assert.calledTwice( domEventData.domEvent.preventDefault );
				expect( eventInfo.stop.called ).to.be.undefined;
			} );

			it( 'should clean the selected content (entire blocks, starting from the second)', () => {
				setModelData( model, modelList( [
					'* ab',
					'  [cd',
					'  ef]'
				] ) );

				view.document.fire( eventInfo, domEventData );

				// Generally speaking, we'd rather expect something like this:
				//	* ab
				//	  []
				// But there is no easy way to tell what the original selection looked like when it came to EnterCommand#afterExecute.
				// Enter deletes all the content first [cd, ef] and in #afterExecute it looks like the original selection was:
				//	* ab
				//	  []
				// and the algorithm falls back to splitting in this case. There's even a test for this kind of selection.
				expect( getModelData( model ) ).to.equalMarkup( modelList( [
					'* ab',
					'* [] {id:a00}'
				] ) );

				expect( changedBlocks ).to.deep.equal( [
					modelRoot.getChild( 1 )
				] );

				sinon.assert.notCalled( outdentCommandExecuteSpy );
				sinon.assert.calledOnce( splitBeforeCommandExecuteSpy );
				sinon.assert.notCalled( splitAfterCommandExecuteSpy );

				sinon.assert.calledTwice( domEventData.domEvent.preventDefault );
				expect( eventInfo.stop.called ).to.be.undefined;
			} );

			it( 'should clean the selected content (partial blocks, starting from the second)', () => {
				setModelData( model, modelList( [
					'* ab',
					'  c[d',
					'  e]f'
				] ) );

				view.document.fire( eventInfo, domEventData );

				expect( getModelData( model ) ).to.equalMarkup( modelList( [
					'* ab',
					'  c',
					'  []f'
				] ) );

				expect( changedBlocks ).to.deep.equal( [] );

				sinon.assert.notCalled( outdentCommandExecuteSpy );
				sinon.assert.notCalled( splitBeforeCommandExecuteSpy );
				sinon.assert.notCalled( splitAfterCommandExecuteSpy );

				sinon.assert.calledTwice( domEventData.domEvent.preventDefault );
				expect( eventInfo.stop.called ).to.be.undefined;
			} );

			it( 'should clean the selected content (entire blocks, three blocks in total)', () => {
				setModelData( model, modelList( [
					'* [ab',
					'  cd',
					'  ef]',
					'* gh'
				] ) );

				view.document.fire( eventInfo, domEventData );

				expect( getModelData( model ) ).to.equalMarkup( modelList( [
					'* []',
					'* gh {id:003}'
				] ) );

				expect( changedBlocks ).to.deep.equal( [] );

				sinon.assert.notCalled( outdentCommandExecuteSpy );
				sinon.assert.notCalled( splitBeforeCommandExecuteSpy );
				sinon.assert.notCalled( splitAfterCommandExecuteSpy );

				sinon.assert.calledTwice( domEventData.domEvent.preventDefault );
				expect( eventInfo.stop.called ).to.be.undefined;
			} );

			it( 'should clean the selected content (entire blocks, across list items)', () => {
				setModelData( model, modelList( [
					'foo',
					'* [ab',
					'  cd',
					'  ef',
					'* gh]'
				] ) );

				view.document.fire( eventInfo, domEventData );

				expect( getModelData( model ) ).to.equalMarkup( modelList( [
					'foo',
					'* []'
				] ) );

				expect( changedBlocks ).to.deep.equal( [] );

				sinon.assert.notCalled( outdentCommandExecuteSpy );
				sinon.assert.notCalled( splitBeforeCommandExecuteSpy );
				sinon.assert.notCalled( splitAfterCommandExecuteSpy );

				sinon.assert.calledTwice( domEventData.domEvent.preventDefault );
				expect( eventInfo.stop.called ).to.be.undefined;
			} );

			it( 'should clean the selected content (entire blocks + a partial block, across list items)', () => {
				setModelData( model, modelList( [
					'* [ab',
					'  cd',
					'  ef',
					'* g]h'
				] ) );

				view.document.fire( eventInfo, domEventData );

				expect( getModelData( model ) ).to.equalMarkup( modelList( [
					'* ',
					'* []h {id:003}'
				] ) );

				expect( changedBlocks ).to.deep.equal( [] );

				sinon.assert.notCalled( outdentCommandExecuteSpy );
				sinon.assert.notCalled( splitBeforeCommandExecuteSpy );
				sinon.assert.notCalled( splitAfterCommandExecuteSpy );

				sinon.assert.calledTwice( domEventData.domEvent.preventDefault );
				expect( eventInfo.stop.called ).to.be.undefined;
			} );

			it( 'should clean the selected content (partial blocks, across list items)', () => {
				setModelData( model, modelList( [
					'* ab',
					'  cd',
					'  e[f',
					'* g]h'
				] ) );

				view.document.fire( eventInfo, domEventData );

				expect( getModelData( model ) ).to.equalMarkup( modelList( [
					'* ab',
					'  cd',
					'  e',
					'* []h'
				] ) );

				expect( changedBlocks ).to.deep.equal( [] );

				sinon.assert.notCalled( outdentCommandExecuteSpy );
				sinon.assert.notCalled( splitBeforeCommandExecuteSpy );
				sinon.assert.notCalled( splitAfterCommandExecuteSpy );

				sinon.assert.calledTwice( domEventData.domEvent.preventDefault );
				expect( eventInfo.stop.called ).to.be.undefined;
			} );

			describe( 'with shift', () => {
				beforeEach( () => {
					domEventData.isSoft = true;
				} );

				it( 'should replace text and create a new paragraph after', () => {
					setModelData( model, modelList( [
						'* A[a',
						'  b',
						'* cc',
						'* dd]'
					] ) );

					view.document.fire( eventInfo, domEventData );

					expect( getModelData( model ) ).to.equalMarkup( modelList( [
						'* A',
						'* [] {id:003}'
					] ) );

					expect( changedBlocks ).to.deep.equal( [ ] );

					sinon.assert.notCalled( outdentCommandExecuteSpy );
					sinon.assert.notCalled( splitBeforeCommandExecuteSpy );
					sinon.assert.notCalled( splitAfterCommandExecuteSpy );

					sinon.assert.calledTwice( domEventData.domEvent.preventDefault );
					expect( eventInfo.stop.called ).to.be.undefined;
				} );
			} );

			describe( 'cross-indent level selection', () => {
				it( 'should clean the selected content (partial blocks)', () => {
					setModelData( model, modelList( [
						'* ab',
						'  * cd',
						'    e[f',
						'    gh',
						'    * i]j'
					] ) );

					view.document.fire( eventInfo, domEventData );

					expect( getModelData( model ) ).to.equalMarkup( modelList( [
						'* ab',
						'  * cd',
						'    e',
						'    * []j {id:004}'
					] ) );

					expect( changedBlocks ).to.deep.equal( [] );

					sinon.assert.notCalled( outdentCommandExecuteSpy );
					sinon.assert.notCalled( splitBeforeCommandExecuteSpy );
					sinon.assert.notCalled( splitAfterCommandExecuteSpy );

					sinon.assert.calledTwice( domEventData.domEvent.preventDefault );
					expect( eventInfo.stop.called ).to.be.undefined;
				} );

				it( 'should clean the selected content (partial blocks + entire block)', () => {
					setModelData( model, modelList( [
						'* ab',
						'  * cd',
						'    e[f',
						'    gh',
						'    * ij]'
					] ) );

					view.document.fire( eventInfo, domEventData );

					expect( getModelData( model ) ).to.equalMarkup( modelList( [
						'* ab',
						'  * cd',
						'    e',
						'    * [] {id:004}'
					] ) );

					expect( changedBlocks ).to.deep.equal( [] );

					sinon.assert.notCalled( outdentCommandExecuteSpy );
					sinon.assert.notCalled( splitBeforeCommandExecuteSpy );
					sinon.assert.notCalled( splitAfterCommandExecuteSpy );

					sinon.assert.calledTwice( domEventData.domEvent.preventDefault );
					expect( eventInfo.stop.called ).to.be.undefined;
				} );

				it( 'should clean the selected content (across two middle levels)', () => {
					setModelData( model, modelList( [
						'* ab',
						'  c[d',
						'  * ef',
						'    g]h',
						'    * ij'
					] ) );

					view.document.fire( eventInfo, domEventData );

					expect( getModelData( model ) ).to.equalMarkup( modelList( [
						'* ab',
						'  c',
						'  * []h',
						'    * ij {id:004}'
					] ) );

					expect( changedBlocks ).to.deep.equal( [] );

					sinon.assert.notCalled( outdentCommandExecuteSpy );
					sinon.assert.notCalled( splitBeforeCommandExecuteSpy );
					sinon.assert.notCalled( splitAfterCommandExecuteSpy );

					sinon.assert.calledTwice( domEventData.domEvent.preventDefault );
					expect( eventInfo.stop.called ).to.be.undefined;
				} );
			} );
		} );
	} );
} );
