/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import DocumentListEditing from '../../../src/documentlist/documentlistediting';

import BoldEditing from '@ckeditor/ckeditor5-basic-styles/src/bold/boldediting';
import UndoEditing from '@ckeditor/ckeditor5-undo/src/undoediting';
import ClipboardPipeline from '@ckeditor/ckeditor5-clipboard/src/clipboardpipeline';
import BlockQuoteEditing from '@ckeditor/ckeditor5-block-quote/src/blockquoteediting';
import HeadingEditing from '@ckeditor/ckeditor5-heading/src/headingediting';
import TableEditing from '@ckeditor/ckeditor5-table/src/tableediting';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import {
	getData as getModelData,
	setData as setModelData
} from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { DomEventData } from '@ckeditor/ckeditor5-engine';

import stubUid from '../_utils/uid';
import { modelList } from '../_utils/utils';
import BubblingEventInfo from '@ckeditor/ckeditor5-engine/src/view/observer/bubblingeventinfo';

describe( 'DocumentListEditing integrations: backspace & delete', () => {
	const changedBlocks = [];

	let editor, model, view;
	let eventInfo, domEventData;
	let mergeBackwardCommand, mergeForwardCommand, splitAfterCommand, indentCommand,
		mergeBackwardCommandExecuteSpy, mergeForwardCommandExecuteSpy, splitAfterCommandExecuteSpy, outdentCommandExecuteSpy;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [
				Paragraph, ClipboardPipeline, BoldEditing, DocumentListEditing, UndoEditing,
				BlockQuoteEditing, TableEditing, HeadingEditing
			]
		} );

		model = editor.model;
		view = editor.editing.view;

		model.schema.extend( 'paragraph', {
			allowAttributes: 'foo'
		} );

		model.schema.register( 'nonListable', {
			allowWhere: '$block',
			allowContentOf: '$block',
			inheritTypesFrom: '$block',
			allowAttributes: 'foo'
		} );

		editor.conversion.elementToElement( { model: 'nonListable', view: 'div' } );

		// Stub `view.scrollToTheSelection` as it will fail on VirtualTestEditor without DOM.
		sinon.stub( view, 'scrollToTheSelection' ).callsFake( () => { } );
		stubUid();

		eventInfo = new BubblingEventInfo( view.document, 'delete' );

		splitAfterCommand = editor.commands.get( 'splitListItemAfter' );
		indentCommand = editor.commands.get( 'outdentList' );
		mergeBackwardCommand = editor.commands.get( 'mergeListItemBackward' );
		mergeForwardCommand = editor.commands.get( 'mergeListItemForward' );

		splitAfterCommandExecuteSpy = sinon.spy( splitAfterCommand, 'execute' );
		outdentCommandExecuteSpy = sinon.spy( indentCommand, 'execute' );
		mergeBackwardCommandExecuteSpy = sinon.spy( mergeBackwardCommand, 'execute' );
		mergeForwardCommandExecuteSpy = sinon.spy( mergeForwardCommand, 'execute' );

		changedBlocks.length = 0;

		splitAfterCommand.on( 'afterExecute', ( evt, data ) => {
			changedBlocks.push( ...data );
		} );

		indentCommand.on( 'afterExecute', ( evt, data ) => {
			changedBlocks.push( ...data );
		} );

		mergeBackwardCommand.on( 'afterExecute', ( evt, data ) => {
			changedBlocks.push( ...data );
		} );

		mergeForwardCommand.on( 'afterExecute', ( evt, data ) => {
			changedBlocks.push( ...data );
		} );
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	describe( 'backspace (backward)', () => {
		beforeEach( () => {
			domEventData = new DomEventData( view, {
				preventDefault: sinon.spy()
			}, {
				direction: 'backward',
				unit: 'codePoint',
				sequence: 1
			} );
		} );

		describe( 'single block list item', () => {
			describe( 'collapsed selection at the beginning of a list item', () => {
				describe( 'item before is empty', () => {
					it( 'should remove list when in empty only element of a list', () => {
						setModelData( model, modelList( [
							'* []'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'[]'
						] ) );
					} );

					it( 'should merge non empty list item with with previous list item as a block', () => {
						setModelData( model, modelList( [
							'* ',
							'* []b'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []b {id:001}'
						] ) );

						sinon.assert.notCalled( outdentCommandExecuteSpy );
						sinon.assert.notCalled( splitAfterCommandExecuteSpy );
						sinon.assert.calledOnce( mergeBackwardCommandExecuteSpy );

						sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
						expect( eventInfo.stop.called ).to.be.true;
					} );

					it( 'should merge empty list item with with previous empty list item', () => {
						setModelData( model, modelList( [
							'* ',
							'* []'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []'
						] ) );

						sinon.assert.notCalled( outdentCommandExecuteSpy );
						sinon.assert.notCalled( splitAfterCommandExecuteSpy );
						sinon.assert.calledOnce( mergeBackwardCommandExecuteSpy );

						sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
						expect( eventInfo.stop.called ).to.be.true;
					} );

					it( 'should merge indented list item with with previous empty list item', () => {
						setModelData( model, modelList( [
							'* ',
							'  * []a'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []a {id:001}'
						] ) );

						sinon.assert.notCalled( outdentCommandExecuteSpy );
						sinon.assert.notCalled( splitAfterCommandExecuteSpy );
						sinon.assert.calledOnce( mergeBackwardCommandExecuteSpy );

						sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
						expect( eventInfo.stop.called ).to.be.true;
					} );

					it( 'should merge indented empty list item with with previous empty list item', () => {
						setModelData( model, modelList( [
							'* ',
							'  * []'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []'
						] ) );

						sinon.assert.notCalled( outdentCommandExecuteSpy );
						sinon.assert.notCalled( splitAfterCommandExecuteSpy );
						sinon.assert.calledOnce( mergeBackwardCommandExecuteSpy );

						sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
						expect( eventInfo.stop.called ).to.be.true;
					} );

					it( 'should merge list item with with previous indented empty list item', () => {
						setModelData( model, modelList( [
							'* ',
							'  * ',
							'* []a'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* ',
							'  * []a{id:002}'
						] ) );

						sinon.assert.notCalled( outdentCommandExecuteSpy );
						sinon.assert.notCalled( splitAfterCommandExecuteSpy );
						sinon.assert.calledOnce( mergeBackwardCommandExecuteSpy );

						sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
						expect( eventInfo.stop.called ).to.be.true;
					} );

					it( 'should merge empty list item with with previous indented empty list item', () => {
						setModelData( model, modelList( [
							'* ',
							'  * ',
							'* []'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* ',
							'  * []'
						] ) );

						sinon.assert.notCalled( outdentCommandExecuteSpy );
						sinon.assert.notCalled( splitAfterCommandExecuteSpy );
						sinon.assert.calledOnce( mergeBackwardCommandExecuteSpy );

						sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
						expect( eventInfo.stop.called ).to.be.true;
					} );
				} );

				describe( 'item before is not empty', () => {
					it( 'should merge non empty list item with with previous list item as a block', () => {
						setModelData( model, modelList( [
							'* a',
							'* []b'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* a',
							'  []b'
						] ) );

						sinon.assert.notCalled( outdentCommandExecuteSpy );
						sinon.assert.notCalled( splitAfterCommandExecuteSpy );
						sinon.assert.calledOnce( mergeBackwardCommandExecuteSpy );

						sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
						expect( eventInfo.stop.called ).to.be.true;
					} );

					it( 'should merge empty list item with with previous list item as a block', () => {
						setModelData( model, modelList( [
							'* a',
							'* []'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* a',
							'  []'
						] ) );

						sinon.assert.notCalled( outdentCommandExecuteSpy );
						sinon.assert.notCalled( splitAfterCommandExecuteSpy );
						sinon.assert.calledOnce( mergeBackwardCommandExecuteSpy );

						sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
						expect( eventInfo.stop.called ).to.be.true;
					} );

					it( 'should merge indented list item with with parent list item as a block', () => {
						setModelData( model, modelList( [
							'* a',
							'  * []b'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* a',
							'  []b'
						] ) );

						sinon.assert.notCalled( outdentCommandExecuteSpy );
						sinon.assert.notCalled( splitAfterCommandExecuteSpy );
						sinon.assert.calledOnce( mergeBackwardCommandExecuteSpy );

						sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
						expect( eventInfo.stop.called ).to.be.true;
					} );

					it( 'should merge indented empty list item with with parent list item as a block', () => {
						setModelData( model, modelList( [
							'* a',
							'  * []'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* a',
							'  []'
						] ) );

						sinon.assert.notCalled( outdentCommandExecuteSpy );
						sinon.assert.notCalled( splitAfterCommandExecuteSpy );
						sinon.assert.calledOnce( mergeBackwardCommandExecuteSpy );

						sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
						expect( eventInfo.stop.called ).to.be.true;
					} );

					it( 'should merge list item with with previous list item with higher indent as a block', () => {
						setModelData( model, modelList( [
							'* a',
							'  * b',
							'* []c'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* a',
							'  * b',
							'  []c'
						] ) );

						sinon.assert.notCalled( outdentCommandExecuteSpy );
						sinon.assert.notCalled( splitAfterCommandExecuteSpy );
						sinon.assert.calledOnce( mergeBackwardCommandExecuteSpy );

						sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
						expect( eventInfo.stop.called ).to.be.true;
					} );

					it( 'should merge empty list item with with previous list item with higher indent as a block', () => {
						setModelData( model, modelList( [
							'* a',
							'  * b',
							'* []'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* a',
							'  * b',
							'  []'
						] ) );

						sinon.assert.notCalled( outdentCommandExecuteSpy );
						sinon.assert.notCalled( splitAfterCommandExecuteSpy );
						sinon.assert.calledOnce( mergeBackwardCommandExecuteSpy );

						sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
						expect( eventInfo.stop.called ).to.be.true;
					} );

					it( 'should keep merged list item\'s children', () => {
						setModelData( model, modelList( [
							'* a',
							'  * []b',
							'    * c',
							'    * d',
							'      e',
							'    * f',
							'      * g',
							'        h'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* a',
							'  []b',
							'  * c',
							'  * d',
							'    e',
							'  * f',
							'    * g',
							'      h'
						] ) );

						sinon.assert.notCalled( outdentCommandExecuteSpy );
						sinon.assert.notCalled( splitAfterCommandExecuteSpy );
						sinon.assert.calledOnce( mergeBackwardCommandExecuteSpy );

						sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
						expect( eventInfo.stop.called ).to.be.true;
					} );
				} );
			} );

			describe( 'collapsed selection at the end of a list item', () => {
				describe( 'item after is empty', () => {
					it( 'should merge non empty list item with with previous list item as a block', () => {
						setModelData( model, modelList( [
							'* ',
							'* []b'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []b{id:001}'
						] ) );
					} );

					// Default behaviour of backspace?
					it( 'should merge empty list item with with previous empty list item', () => {
						setModelData( model, modelList( [
							'* ',
							'* []'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []'
						] ) );
					} );

					it( 'should merge indented list item with with previous empty list item', () => {
						setModelData( model, modelList( [
							'* ',
							'  * []a'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []a {id:001}'
						] ) );
					} );

					it( 'should merge indented empty list item with with previous empty list item', () => {
						setModelData( model, modelList( [
							'* ',
							'  * []'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []'
						] ) );
					} );

					it( 'should merge list item with with previous indented empty list item', () => {
						setModelData( model, modelList( [
							'* ',
							'  * ',
							'* []a'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* ',
							'  * []a{id:002}'
						] ) );
					} );

					it( 'should merge empty list item with with previous indented empty list item', () => {
						setModelData( model, modelList( [
							'* ',
							'  * ',
							'* []'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* ',
							'  * []'
						] ) );
					} );
				} );

				describe( 'item before is not empty', () => {
					it( 'should merge non empty list item with with previous list item as a block', () => {
						setModelData( model, modelList( [
							'* a',
							'* []b'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* a',
							'  []b'
						] ) );
					} );

					it( 'should merge empty list item with with previous list item as a block', () => {
						setModelData( model, modelList( [
							'* a',
							'* []'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* a',
							'  []'
						] ) );
					} );

					it( 'should merge indented list item with with parent list item as a block', () => {
						setModelData( model, modelList( [
							'* a',
							'  * []b'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* a',
							'  []b'
						] ) );
					} );

					it( 'should merge indented empty list item with with parent list item as a block', () => {
						setModelData( model, modelList( [
							'* a',
							'  * []'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* a',
							'  []'
						] ) );
					} );

					it( 'should merge list item with with previous list item with higher indent as a block', () => {
						setModelData( model, modelList( [
							'* a',
							'  * b',
							'* []c'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* a',
							'  * b',
							'  []c'
						] ) );
					} );

					it( 'should merge empty list item with with previous list item with higher indent as a block', () => {
						setModelData( model, modelList( [
							'* a',
							'  * b',
							'* []'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* a',
							'  * b',
							'  []'
						] ) );
					} );

					it( 'should keep merged list item\'s children', () => {
						setModelData( model, modelList( [
							'* a',
							'  * []b',
							'    * c',
							'    * d',
							'      e',
							'    * f',
							'      * g',
							'        h'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* a',
							'  []b',
							'  * c',
							'  * d',
							'    e',
							'  * f',
							'    * g',
							'      h'
						] ) );
					} );
				} );
			} );

			describe( 'non-collapsed selection starting in first block of a list item', () => {
				describe( 'first position in empty block', () => {
					it( 'should merge two empty list items', () => {
						setModelData( model, modelList( [
							'a',
							'* [',
							'* ]'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'a',
							'* []'
						] ) );
					} );

					it( 'should merge non empty list item', () => {
						setModelData( model, modelList( [
							'* [',
							'* ]text'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []text{id:001}'
						] ) );
					} );

					it( 'should merge non empty list item and delete text', () => {
						setModelData( model, modelList( [
							'* [',
							'* te]xt'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []xt{id:001}'
						] ) );
					} );

					it( 'should merge and adjust indentation of child list item when end selection is at the beginning of item', () => {
						setModelData( model, modelList( [
							'* [',
							'* a',
							'  * ]b'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []',
							'* b {id:002}'
						] ) );
					} );

					it( 'should merge and adjust indentation of child list items', () => {
						setModelData( model, modelList( [
							'* [',
							'* a',
							'  * b]c',
							'    * d'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []c{id:002}',
							'  * d{id:003}'
						] ) );
					} );

					it( 'should merge and adjust indentation of child list items when selection at the end of an item', () => {
						setModelData( model, modelList( [
							'* [',
							'* a',
							'  * bc]',
							'    * d'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []{id:000}',
							'  * d{id:003}'
						] ) );
					} );

					it( 'should delete all items till the end of selection and merge last list item', () => {
						setModelData( model, modelList( [
							'* [',
							'* a',
							'  * b',
							'* ]d'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []',
							'* d {id:003}'
						] ) );
					} );

					it( 'should delete all items and text till the end of selection and merge last list item', () => {
						setModelData( model, modelList( [
							'* [',
							'* a',
							'  * b',
							'* d]e'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []e{id:003}'
						] ) );
					} );
				} );

				describe( 'first position in non-empty block', () => {
					it( 'should merge two list items', () => {
						setModelData( model, modelList( [
							'* [text',
							'* ano]ther'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []ther{id:001}'
						] ) );
					} );

					it( 'should merge two list items if selection is in the middle', () => {
						setModelData( model, modelList( [
							'* te[xt',
							'* ano]ther'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* te[]ther'
						] ) );
					} );

					it( 'should merge non empty list item', () => {
						setModelData( model, modelList( [
							'* text[',
							'* ]another'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* text[]another'
						] ) );
					} );

					it( 'should merge non empty list item and delete text', () => {
						setModelData( model, modelList( [
							'* text[',
							'* ano]ther'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* text[]ther'
						] ) );
					} );

					it( 'should merge and adjust indentation of child list item when end selection is at the beginning of item', () => {
						setModelData( model, modelList( [
							'* text[',
							'* a',
							'  * ]b',
							'    * c'
						] ) );

						view.document.fire( eventInfo, domEventData );
						// output is okay, fix expect
						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* text[]',
							'* b {id:002}',
							'  * c{id:003}'
						] ) );
					} );

					it( 'should merge and adjust indentation of child list items', () => {
						setModelData( model, modelList( [
							'* text[',
							'* a',
							'  * b]c',
							'    * d'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* text[]c',
							'  * d{id:003}'
						] ) );
					} );

					it( 'should merge and adjust indentation of child list items when selection at the end of an item', () => {
						setModelData( model, modelList( [
							'* text[',
							'* a',
							'  * bc]',
							'    * d'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* text[]{id:000}',
							'  * d{id:003}'
						] ) );
					} );

					it( 'should delete all items till the end of selection and merge last list item', () => {
						setModelData( model, modelList( [
							'* text[',
							'* a',
							'  * b',
							'* ]d'
						] ) );

						view.document.fire( eventInfo, domEventData );

						// output is okay, fix expect
						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* text[]',
							'* d {id:003}'
						] ) );
					} );

					it( 'should delete all items and text till the end of selection and merge last list item', () => {
						setModelData( model, modelList( [
							'* text[',
							'* a',
							'  * b',
							'* d]e'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* text[]e'
						] ) );
					} );
				} );
			} );
		} );

		describe( 'multi-block list item', () => {
			describe( 'collapsed selection at the beginning of a list item', () => {
				describe( 'item before is empty', () => {
					it( 'should merge with previous list item and keep blocks intact', () => {
						setModelData( model, modelList( [
							'* ',
							'* []b',
							'  c'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []b{id:001}',
							'  c'
						] ) );

						sinon.assert.notCalled( outdentCommandExecuteSpy );
						sinon.assert.notCalled( splitAfterCommandExecuteSpy );
						sinon.assert.calledOnce( mergeBackwardCommandExecuteSpy );

						sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
						expect( eventInfo.stop.called ).to.be.true;
					} );

					it.skip( 'should merge with previous list item and keep complex blocks intact ', () => {
						setModelData( model, modelList( [
							'* ',
							'* []b',
							'  c',
							'  * d',
							'    e',
							'  * f',
							'    * g',
							'      h',
							'      * i',
							'        * j',
							'       k',
							'  l'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []b',
							'  c',
							'  * d',
							'    e',
							'  * f',
							'    * g',
							'      h',
							'      * i',
							'        * j',
							'       k',
							'  l'
						] ) );

						sinon.assert.notCalled( outdentCommandExecuteSpy );
						sinon.assert.notCalled( splitAfterCommandExecuteSpy );
						sinon.assert.calledOnce( mergeBackwardCommandExecuteSpy );

						sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
						expect( eventInfo.stop.called ).to.be.true;

						// expect( changedBlocks ).to.deep.equal( [
						// 	modelRoot.getChild( 0 )
						// ] );
					} );

					it( 'should merge list item with first block empty with previous empty list item', () => {
						setModelData( model, modelList( [
							'* ',
							'* []',
							'  a'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []',
							'  a'
						] ) );

						sinon.assert.notCalled( outdentCommandExecuteSpy );
						sinon.assert.notCalled( splitAfterCommandExecuteSpy );
						sinon.assert.calledOnce( mergeBackwardCommandExecuteSpy );

						sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
						expect( eventInfo.stop.called ).to.be.true;

						// expect( changedBlocks ).to.deep.equal( [
						// 	modelRoot.getChild( 0 )
						// ] );
					} );

					it( 'should merge indented list item with with previous empty list item', () => {
						setModelData( model, modelList( [
							'* ',
							'  * []a',
							'    b'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []a {id:001}',
							'  b'
						] ) );

						sinon.assert.notCalled( outdentCommandExecuteSpy );
						sinon.assert.notCalled( splitAfterCommandExecuteSpy );
						sinon.assert.calledOnce( mergeBackwardCommandExecuteSpy );

						sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
						expect( eventInfo.stop.called ).to.be.true;

						// expect( changedBlocks ).to.deep.equal( [
						// 	modelRoot.getChild( 0 )
						// ] );
					} );

					it( 'should merge indented list having block and indented list item with previous empty list item', () => {
						setModelData( model, modelList( [
							'* ',
							'  * []a',
							'    b',
							'    * c'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []a {id:001}',
							'  b',
							'  * c {id:003}'
						] ) );

						sinon.assert.notCalled( outdentCommandExecuteSpy );
						sinon.assert.notCalled( splitAfterCommandExecuteSpy );
						sinon.assert.calledOnce( mergeBackwardCommandExecuteSpy );

						sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
						expect( eventInfo.stop.called ).to.be.true;

						// expect( changedBlocks ).to.deep.equal( [
						// 	modelRoot.getChild( 0 )
						// ] );
					} );

					it( 'should merge indented empty list item with previous empty list item', () => {
						setModelData( model, modelList( [
							'* ',
							'  * []',
							'    text'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []',
							'  text'
						] ) );

						sinon.assert.notCalled( outdentCommandExecuteSpy );
						sinon.assert.notCalled( splitAfterCommandExecuteSpy );
						sinon.assert.calledOnce( mergeBackwardCommandExecuteSpy );

						sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
						expect( eventInfo.stop.called ).to.be.true;

						// expect( changedBlocks ).to.deep.equal( [
						// 	modelRoot.getChild( 0 )
						// ] );
					} );

					it( 'should merge list item with with previous indented empty list item', () => {
						setModelData( model, modelList( [
							'* ',
							'  * ',
							'* []a',
							'  b'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* ',
							'  * []a{id:002}',
							'    b'
						] ) );

						sinon.assert.notCalled( outdentCommandExecuteSpy );
						sinon.assert.notCalled( splitAfterCommandExecuteSpy );
						sinon.assert.calledOnce( mergeBackwardCommandExecuteSpy );

						sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
						expect( eventInfo.stop.called ).to.be.true;
					} );

					it( 'should merge empty list item with with previous indented empty list item', () => {
						setModelData( model, modelList( [
							'* ',
							'  * ',
							'* []',
							'  text'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* ',
							'  * []',
							'    text'
						] ) );

						sinon.assert.notCalled( outdentCommandExecuteSpy );
						sinon.assert.notCalled( splitAfterCommandExecuteSpy );
						sinon.assert.calledOnce( mergeBackwardCommandExecuteSpy );

						sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
						expect( eventInfo.stop.called ).to.be.true;
					} );
				} );

				describe( 'item before is not empty', () => {
					it( 'should merge with previous list item and keep blocks intact', () => {
						setModelData( model, modelList( [
							'* a',
							'* []b',
							'  c'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* a',
							'  []b',
							'  c'
						] ) );

						sinon.assert.notCalled( outdentCommandExecuteSpy );
						sinon.assert.notCalled( splitAfterCommandExecuteSpy );
						sinon.assert.calledOnce( mergeBackwardCommandExecuteSpy );

						sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
						expect( eventInfo.stop.called ).to.be.true;

						// expect( changedBlocks ).to.deep.equal( [
						// 	modelRoot.getChild( 0 )
						// ] );
					} );

					it( 'should merge block to a previous list item', () => {
						setModelData( model, modelList( [
							'* b',
							'  * c',
							'  []d',
							'  e'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* b',
							'  * c',
							'    []d',
							'  e'
						] ) );

						sinon.assert.notCalled( outdentCommandExecuteSpy );
						sinon.assert.notCalled( splitAfterCommandExecuteSpy );
						sinon.assert.calledOnce( mergeBackwardCommandExecuteSpy );

						sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
						expect( eventInfo.stop.called ).to.be.true;

						// expect( changedBlocks ).to.deep.equal( [
						// 	modelRoot.getChild( 0 )
						// ] );
					} );

					it( 'should merge with previous list item and keep complex blocks intact', () => {
						setModelData( model, modelList( [
							'* a',
							'* []b',
							'  c',
							'  * d',
							'    e',
							'  * f',
							'    * g',
							'      h',
							'      * i',
							'        * j',
							'       k',
							'  l'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* a',
							'  []b',
							'  c',
							'  * d',
							'    e',
							'  * f',
							'    * g',
							'      h',
							'      * i',
							'        * j',
							'       k',
							'  l'
						] ) );

						sinon.assert.notCalled( outdentCommandExecuteSpy );
						sinon.assert.notCalled( splitAfterCommandExecuteSpy );
						sinon.assert.calledOnce( mergeBackwardCommandExecuteSpy );

						sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
						expect( eventInfo.stop.called ).to.be.true;

						// expect( changedBlocks ).to.deep.equal( [
						// 	modelRoot.getChild( 0 )
						// ] );
					} );

					it( 'should merge list item with first block empty with previous list item', () => {
						setModelData( model, modelList( [
							'* a',
							'* []',
							'  b'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* a',
							'  []',
							'  b'
						] ) );

						sinon.assert.notCalled( outdentCommandExecuteSpy );
						sinon.assert.notCalled( splitAfterCommandExecuteSpy );
						sinon.assert.calledOnce( mergeBackwardCommandExecuteSpy );

						sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
						expect( eventInfo.stop.called ).to.be.true;

						// expect( changedBlocks ).to.deep.equal( [
						// 	modelRoot.getChild( 0 )
						// ] );
					} );

					it( 'should merge indented list item with with previous list item as blocks', () => {
						setModelData( model, modelList( [
							'* a',
							'  * []a',
							'    b'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* a',
							'  []a',
							'  b'
						] ) );

						sinon.assert.notCalled( outdentCommandExecuteSpy );
						sinon.assert.notCalled( splitAfterCommandExecuteSpy );
						sinon.assert.calledOnce( mergeBackwardCommandExecuteSpy );

						sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
						expect( eventInfo.stop.called ).to.be.true;

						// expect( changedBlocks ).to.deep.equal( [
						// 	modelRoot.getChild( 0 )
						// ] );
					} );

					it( 'should merge indented list having block and indented list item with previous list item', () => {
						setModelData( model, modelList( [
							'* a',
							'  * []b',
							'    c',
							'    * d'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* a',
							'  []b',
							'  c',
							'  * d'
						] ) );

						sinon.assert.notCalled( outdentCommandExecuteSpy );
						sinon.assert.notCalled( splitAfterCommandExecuteSpy );
						sinon.assert.calledOnce( mergeBackwardCommandExecuteSpy );

						sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
						expect( eventInfo.stop.called ).to.be.true;
					} );

					it( 'should merge indented empty list item with previous list item', () => {
						setModelData( model, modelList( [
							'* a',
							'  * []',
							'    text'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* a',
							'  []',
							'  text'
						] ) );

						sinon.assert.notCalled( outdentCommandExecuteSpy );
						sinon.assert.notCalled( splitAfterCommandExecuteSpy );
						sinon.assert.calledOnce( mergeBackwardCommandExecuteSpy );

						sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
						expect( eventInfo.stop.called ).to.be.true;
					} );

					it( 'should merge list item with with previous indented empty list item', () => {
						setModelData( model, modelList( [
							'* a',
							'  * b',
							'* []c',
							'  d'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* a',
							'  * b',
							'  []c',
							'  d'
						] ) );

						sinon.assert.notCalled( outdentCommandExecuteSpy );
						sinon.assert.notCalled( splitAfterCommandExecuteSpy );
						sinon.assert.calledOnce( mergeBackwardCommandExecuteSpy );

						sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
						expect( eventInfo.stop.called ).to.be.true;
					} );
				} );
			} );

			describe( 'collapsed selection in the middle of the list item', () => {
				it( 'should merge block to a previous list item', () => {
					setModelData( model, modelList( [
						'* A',
						'  * B',
						'  # C',
						'    # D',
						'    []X',
						'    # Z',
						'    V',
						'* E',
						'* F'
					] ) );

					view.document.fire( eventInfo, domEventData );

					expect( getModelData( model ) ).to.equalMarkup( modelList( [
						'* A',
						'  * B',
						'  # C',
						'    # D',
						'      []X',
						'      # Z',
						'    V',
						'* E',
						'* F'
					] ) );
				} );
			} );

			describe( 'non-collapsed selection starting in first block of a list item', () => {
				describe( 'first position in empty block', () => {
					it( 'should merge two empty list items', () => {
						setModelData( model, modelList( [
							'* [',
							'* ]',
							'  '
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []',
							'  '
						] ) );
					} );

					it( 'should merge non empty list item', () => {
						setModelData( model, modelList( [
							'* [',
							'* ]text'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []text{id:001}'
						] ) );
					} );

					it( 'should merge non empty list item and delete text', () => {
						setModelData( model, modelList( [
							'* [',
							'* te]xt'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []xt{id:001}'
						] ) );
					} );

					it( 'should merge and adjust indentation of child list item when end selection is at the beginning of item', () => {
						setModelData( model, modelList( [
							'* [',
							'* a',
							'  * ]b'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []',
							'* b {id:002}'
						] ) );
					} );

					it( 'should merge and adjust indentation of child list items', () => {
						setModelData( model, modelList( [
							'* [',
							'* a',
							'  * b]c',
							'    * d'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []c{id:002}',
							'  * d{id:003}'
						] ) );
					} );

					it( 'should merge and adjust indentation of child list items when selection at the end of an item', () => {
						setModelData( model, modelList( [
							'* [',
							'* a',
							'  * bc]',
							'    * d'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []{id:000}',
							'  * d{id:003}'
						] ) );
					} );

					it( 'should delete all items till the end of selection and merge last list item', () => {
						setModelData( model, modelList( [
							'* [',
							'* a',
							'  * b',
							'* ]d'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []',
							'* d {id:003}'
						] ) );
					} );

					it( 'should delete all items and text till the end of selection and merge last list item', () => {
						setModelData( model, modelList( [
							'* [',
							'* a',
							'  * b',
							'* d]e'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []e{id:003}'
						] ) );
					} );

					it( 'should delete all following items till the end of selection and merge last list item', () => {
						setModelData( model, modelList( [
							'* [',
							'  text',
							'* a',
							'  * b',
							'* d]e'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []e{id:004}'
						] ) );
					} );

					it( 'should delete all following items till the end of selection and merge last list itemxx', () => {
						setModelData( model, modelList( [
							'* [',
							'  * b',
							'    ]c',
							'    * d',
							'      e'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []',
							'* c',
							'  * d {id:003}',
							'    e'
						] ) );
					} );

					it( 'should delete items till the end of selection and merge middle block with following blocks', () => {
						setModelData( model, modelList( [
							'* [',
							'  * b',
							'    c]d',
							'    * e',
							'      f'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []d{id:001}',
							'  * e{id:003}',
							'    f'
						] ) );
					} );

					it( 'should delete items till the end of selection and merge following blocks', () => {
						setModelData( model, modelList( [
							'* [',
							'  * b',
							'    cd]',
							'    * e',
							'      f',
							'    s'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []',
							'  * e {id:003}',
							'    f',
							'* s {id:001}'
						] ) );
					} );
				} );

				describe( 'first position in non-empty block', () => {
					it( 'should merge two list items', () => {
						setModelData( model, modelList( [
							'* [text',
							'* ano]ther',
							'  text'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []ther{id:001}',
							'  text'
						] ) );
					} );

					// Not related to merge command
					it( 'should merge two list items with selection in the middle', () => {
						setModelData( model, modelList( [
							'* te[xt',
							'* ano]ther'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* te[]ther'
						] ) );
					} );

					it( 'should merge non empty list item', () => {
						setModelData( model, modelList( [
							'* [',
							'* ]text'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []text{id:001}'
						] ) );
					} );

					it( 'should merge non empty list item and delete text', () => {
						setModelData( model, modelList( [
							'* [',
							'* te]xt'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []xt{id:001}'
						] ) );
					} );

					it( 'should merge and adjust indentation of child list item when end selection is at the beginning of item', () => {
						setModelData( model, modelList( [
							'* [',
							'* a',
							'  * ]b',
							'    * c'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []',
							'* b {id:002}',
							'  * c {id:003}'
						] ) );
					} );

					it( 'should merge and adjust indentation of child list items', () => {
						setModelData( model, modelList( [
							'* [',
							'* a',
							'  * b]c',
							'    * d'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []c{id:002}',
							'  * d{id:003}'
						] ) );
					} );

					it( 'should merge and adjust indentation of child list items when selection at the end of an item', () => {
						setModelData( model, modelList( [
							'* [',
							'* a',
							'  * bc]',
							'    * d'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []{id:000}',
							'  * d{id:003}'
						] ) );
					} );

					it( 'should delete all items till the end of selection and merge last list item', () => {
						setModelData( model, modelList( [
							'* [',
							'* a',
							'  * b',
							'* ]d'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []',
							'* d {id:003}'
						] ) );
					} );

					it( 'should delete all items and text till the end of selection and merge last list item', () => {
						setModelData( model, modelList( [
							'* [',
							'* a',
							'  * b',
							'* d]e'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []e{id:003}'
						] ) );
					} );

					it( 'should delete all items and text till the end of selection and adjust orphan elements', () => {
						setModelData( model, modelList( [
							'* [',
							'* a',
							'  * b]',
							'    c',
							'    * d',
							'      e',
							'  f',
							'  g'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []',
							'  c',
							'  * d {id:004}',
							'    e',
							'* f {id:001}',
							'  g'
						] ) );
					} );
				} );
			} );
		} );

		describe( 'selection outside list', () => {
			describe( 'collapsed selection', () => {
				it( 'no list editing commands should be executed outside list (empty paragraph)', () => {
					setModelData( model,
						'<paragraph>[]</paragraph>'
					);

					view.document.fire( eventInfo, domEventData );

					expect( getModelData( model ) ).to.equalMarkup(
						'<paragraph>[]</paragraph>'
					);

					expect( changedBlocks ).to.be.empty;

					sinon.assert.notCalled( outdentCommandExecuteSpy );
					sinon.assert.notCalled( splitAfterCommandExecuteSpy );
				} );

				it( 'no list editing commands should be executed outside list (selection at the beginning of text)', () => {
					setModelData( model,
						'<paragraph>[]text</paragraph>'
					);

					view.document.fire( eventInfo, domEventData );

					expect( getModelData( model ) ).to.equalMarkup(
						'<paragraph>[]text</paragraph>'
					);

					expect( changedBlocks ).to.be.empty;

					sinon.assert.notCalled( outdentCommandExecuteSpy );
					sinon.assert.notCalled( splitAfterCommandExecuteSpy );
				} );

				it( 'no list editing commands should be executed outside list (selection at the end of text)', () => {
					setModelData( model,
						'<paragraph>text[]</paragraph>'
					);

					view.document.fire( eventInfo, domEventData );

					expect( getModelData( model ) ).to.equalMarkup(
						'<paragraph>tex[]</paragraph>'
					);

					expect( changedBlocks ).to.be.empty;

					sinon.assert.notCalled( outdentCommandExecuteSpy );
					sinon.assert.notCalled( splitAfterCommandExecuteSpy );
				} );

				it( 'no list editing commands should be executed outside list (selection in the middle of text)', () => {
					setModelData( model,
						'<paragraph>te[]xt</paragraph>'
					);

					view.document.fire( eventInfo, domEventData );

					expect( getModelData( model ) ).to.equalMarkup(
						'<paragraph>t[]xt</paragraph>'
					);

					expect( changedBlocks ).to.be.empty;

					sinon.assert.notCalled( outdentCommandExecuteSpy );
					sinon.assert.notCalled( splitAfterCommandExecuteSpy );
				} );

				it( 'no list editing commands should be executed next to a list', () => {
					setModelData( model, modelList( [
						'1[]',
						'* 2'
					] ) );

					view.document.fire( eventInfo, domEventData );

					expect( getModelData( model ) ).to.equalMarkup( modelList( [
						'[]',
						'* 2'
					] ) );

					expect( changedBlocks ).to.be.empty;

					sinon.assert.notCalled( outdentCommandExecuteSpy );
					sinon.assert.notCalled( splitAfterCommandExecuteSpy );
				} );

				it( 'no list editing commands should be executed when merging two lists', () => {
					setModelData( model, modelList( [
						'* 1',
						'[]2',
						'* 3'
					] ) );

					view.document.fire( eventInfo, domEventData );

					expect( getModelData( model ) ).to.equalMarkup( modelList( [
						'* 1[]2',
						'* 3 {id:002}'
					] ) );

					expect( changedBlocks ).to.be.empty;

					sinon.assert.notCalled( outdentCommandExecuteSpy );
					sinon.assert.notCalled( splitAfterCommandExecuteSpy );
				} );

				it( 'no list editing commands should be executed when merging two lists - one nested', () => {
					setModelData( model, modelList( [
						'* 1',
						'[]2',
						'* 3',
						'  * 4'
					] ) );

					view.document.fire( eventInfo, domEventData );

					expect( getModelData( model ) ).to.equalMarkup( modelList( [
						'* 1[]2',
						'* 3 {id:002}',
						'  * 4 {id:003}'
					] ) );

					expect( changedBlocks ).to.be.empty;

					sinon.assert.notCalled( outdentCommandExecuteSpy );
					sinon.assert.notCalled( splitAfterCommandExecuteSpy );
				} );

				it( 'empty list should be deleted', () => {
					setModelData( model, modelList( [
						'* ',
						'[]2',
						'* 3'
					] ) );

					view.document.fire( eventInfo, domEventData );

					expect( getModelData( model ) ).to.equalMarkup( modelList( [
						'[]2',
						'* 3 {id:002}'
					] ) );

					expect( changedBlocks ).to.be.empty;

					sinon.assert.notCalled( outdentCommandExecuteSpy );
					sinon.assert.notCalled( splitAfterCommandExecuteSpy );
				} );
			} );

			describe( 'non-collapsed selection', () => {
				describe( 'outside list', () => {
					it( 'no list editing commands should be executed', () => {
						setModelData( model, modelList( [
							't[ex]t'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							't[]t'
						] ) );

						expect( changedBlocks ).to.be.empty;

						sinon.assert.notCalled( outdentCommandExecuteSpy );
						sinon.assert.notCalled( splitAfterCommandExecuteSpy );
					} );

					it( 'no list editing commands should be executed when outside list when next to a list', () => {
						setModelData( model, modelList( [
							't[ex]t',
							'* 1'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							't[]t',
							'* 1'
						] ) );

						expect( changedBlocks ).to.be.empty;

						sinon.assert.notCalled( outdentCommandExecuteSpy );
						sinon.assert.notCalled( splitAfterCommandExecuteSpy );
					} );
				} );

				describe( 'only start in a list', () => {
					it( 'no list editing commands should be executed when doing delete', () => {
						setModelData( model, modelList( [
							'* te[xt',
							'aa]'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* te[]'
						] ) );

						expect( changedBlocks ).to.be.empty;

						sinon.assert.notCalled( outdentCommandExecuteSpy );
						sinon.assert.notCalled( splitAfterCommandExecuteSpy );
					} );

					it( 'no list editing commands should be executed when doing delete (multi-block list)', () => {
						setModelData( model, modelList( [
							'* te[xt1',
							'  text2',
							'  * text3',
							'text4]'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* te[]'
						] ) );

						expect( changedBlocks ).to.be.empty;

						sinon.assert.notCalled( outdentCommandExecuteSpy );
						sinon.assert.notCalled( splitAfterCommandExecuteSpy );
					} );

					it( 'should delete everything till end of selection and merge remaining text', () => {
						setModelData( model, modelList( [
							'* text1',
							'  tex[t2',
							'  * text3',
							'tex]t4'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* text1',
							'  tex[]t4'
						] ) );

						expect( changedBlocks ).to.be.empty;
					} );
				} );

				describe( 'only end in a list', () => {
					it( 'should delete everything till end of selection', () => {
						setModelData( model, modelList( [
							'[',
							'* te]xt'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []xt {id:001}'
						] ) );

						expect( changedBlocks ).to.be.empty;
					} );

					it( 'should delete everything till the end of selection and adjust remaining block to item list', () => {
						setModelData( model, modelList( [
							'a[',
							'* b]b',
							'  c'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'a[]b',
							'* c'
						] ) );

						expect( changedBlocks ).to.be.empty;
					} );

					it( 'should delete everything till the end of selection and adjust remaining item list indentation', () => {
						setModelData( model, modelList( [
							'a[',
							'* b]b',
							'  * c'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'a[]b',
							'* c {id:002}'
						] ) );

						expect( changedBlocks ).to.be.empty;
					} );

					it( 'should delete selection and adjust remaining item list indentation (multi-block)', () => {
						setModelData( model, modelList( [
							'a[',
							'* b]b',
							'  * c',
							'    d'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'a[]b',
							'* c {id:002}',
							'  d'
						] ) );

						expect( changedBlocks ).to.be.empty;
					} );

					// TODO: skipped because below TODO
					it.skip( 'should remove selection and adjust remaining list', () => {
						setModelData( model, modelList( [
							'a[',
							'* b]b',
							'  * c',
							'  d'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'a[]b',
							'* c',
							'  d' // TODO: No way currently to adjust this block id <-
						] ) );

						expect( changedBlocks ).to.be.empty;
					} );

					it( 'should remove selection and adjust remaining list (multi-block)', () => {
						setModelData( model, modelList( [
							'a[',
							'* b',
							'  * c',
							'    d]d',
							'    * e',
							'      f'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'a[]d',
							'* e {id:004}',
							'  f'
						] ) );

						expect( changedBlocks ).to.be.empty;
					} );
				} );

				describe( 'spanning multiple lists', () => {
					it( 'should merge lists into one with one list item', () => {
						setModelData( model, modelList( [
							'* a[a',
							'b',
							'* c]c'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* a[]c'
						] ) );

						expect( changedBlocks ).to.be.empty;
					} );

					it( 'should merge lists into one with two blocks', () => {
						setModelData( model, modelList( [
							'* a',
							'  b[b',
							'c',
							'* d]d'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* a',
							'  b[]d'
						] ) );

						expect( changedBlocks ).to.be.empty;
					} );

					it( 'should merge two lists into one with two list items', () => {
						setModelData( model, modelList( [
							'* a[',
							'c',
							'* d]',
							'* e'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* a[]',
							'* e {id:003}'
						] ) );

						expect( changedBlocks ).to.be.empty;
					} );

					it( 'should merge two lists into one with two list items (multiple blocks)', () => {
						setModelData( model, modelList( [
							'* a[',
							'c',
							'* d]',
							'  e',
							'* f'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* a[]',
							'  e',
							'* f {id:004}'
						] ) );

						expect( changedBlocks ).to.be.empty;
					} );

					it( 'should merge two lists into one with two list items and adjust indentation', () => {
						setModelData( model, modelList( [
							'* a[',
							'c',
							'* d',
							'  * e]e',
							'    * f',
							'      g'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* a[]e',
							'  * f {id:004}',
							'    g'
						] ) );

						expect( changedBlocks ).to.be.empty;
					} );

					it( 'should merge two lists into one with deeper indendation', () => {
						setModelData( model, modelList( [
							'* a',
							'  * b[',
							'c',
							'* d',
							'  * e',
							'    * f]f',
							'      * g'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* a',
							'  * b[]f',
							'    * g {id:006}'
						] ) );

						expect( changedBlocks ).to.be.empty;
					} );

					it( 'should merge two lists into one with deeper indentation (multiple blocks)', () => {
						setModelData( model, modelList( [
							'* a',
							'  * b[',
							'c',
							'* d',
							'  * e]e',
							'    * f',
							'      g'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* a',
							'  * b[]e',
							'    * f {id:005}',
							'      g'
						] ) );

						expect( changedBlocks ).to.be.empty;
					} );

					it( 'should merge two lists into one and keep items after selection', () => {
						setModelData( model, modelList( [
							'* a[',
							'c',
							'* d',
							'  * e]e',
							'* f',
							'  g'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* a[]e',
							'* f {id:004}',
							'  g'
						] ) );

						expect( changedBlocks ).to.be.empty;
					} );

					it( 'should merge lists of different types to a single list and keep item lists types', () => {
						setModelData( model, modelList( [
							'* a',
							'* b[b',
							'c',
							'# d]d',
							'# d'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* a',
							'* b[]d',
							'# d {id:004}'
						] ) );

						expect( changedBlocks ).to.be.empty;
					} );

					it( 'should merge lists of mixed types to a single list and keep item lists types', () => {
						setModelData( model, modelList( [
							'* a',
							'# b[b',
							'c',
							'# d]d',
							'  * f'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* a',
							'# b[]d',
							'  * f {id:004}'
						] ) );

						expect( changedBlocks ).to.be.empty;
					} );
				} );
			} );
		} );
	} );

	describe( 'delete (forward)', () => {
		beforeEach( () => {
			domEventData = new DomEventData( view, {
				preventDefault: sinon.spy()
			}, {
				direction: 'forward',
				unit: 'codePoint',
				sequence: 1
			} );
		} );

		describe( 'single block list item', () => {
			describe( 'collapsed selection at the end of a list item', () => {
				describe( 'item after is empty', () => {
					it.skip( 'should remove list when in empty only element of a list', () => {
						setModelData( model, modelList( [
							'* []'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'[]'
						] ) );
					} );

					it( 'should remove next empty list item', () => {
						setModelData( model, modelList( [
							'* b[]',
							'* '
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* b[]'
						] ) );

						expect( eventInfo.stop.called ).to.be.true;
					} );

					it( 'should remove next empty list item when current is empty', () => {
						setModelData( model, modelList( [
							'* []',
							'* '
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []'
						] ) );

						expect( eventInfo.stop.called ).to.be.true;
					} );

					it( 'should remove current list item if empty and replace with indented', () => {
						setModelData( model, modelList( [
							'* []',
							'  * a'
						] ) );

						view.document.fire( eventInfo, domEventData );

						sinon.assert.calledOnce( mergeForwardCommandExecuteSpy );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []a {id:001}'
						] ) );

						expect( eventInfo.stop.called ).to.be.true;
					} );

					it( 'should remove next empty indented item list', () => {
						setModelData( model, modelList( [
							'* []',
							'  * '
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []'
						] ) );

						sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
						expect( eventInfo.stop.called ).to.be.true;
					} );

					it( 'should replace current empty list item with next list item', () => {
						setModelData( model, modelList( [
							'* ',
							'  * []',
							'* a'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* ',
							'  * []a{id:002}'
						] ) );

						sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
						expect( eventInfo.stop.called ).to.be.true;
					} );

					it( 'should remove next empty list item when current is also empty', () => {
						setModelData( model, modelList( [
							'* ',
							'  * []',
							'* '
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* ',
							'  * []'
						] ) );

						sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
						expect( eventInfo.stop.called ).to.be.true;
					} );
				} );

				describe( 'next list item is not empty', () => {
					it( 'should merge text from next list item with current list item text', () => {
						setModelData( model, modelList( [
							'* a[]',
							'* b'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* a[]b'
						] ) );

						sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
						expect( eventInfo.stop.called ).to.be.true;
					} );

					it( 'should delete next empty item list', () => {
						setModelData( model, modelList( [
							'* a[]',
							'* '
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* a[]'
						] ) );

						sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
						expect( eventInfo.stop.called ).to.be.true;
					} );

					it( 'should merge text of indented list item with current list item', () => {
						setModelData( model, modelList( [
							'* a[]',
							'  * b'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* a[]b'
						] ) );

						sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
						expect( eventInfo.stop.called ).to.be.true;
					} );

					it( 'should remove indented empty list item', () => {
						setModelData( model, modelList( [
							'* a[]',
							'  * '
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* a[]'
						] ) );

						sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
						expect( eventInfo.stop.called ).to.be.true;
					} );

					it( 'should merge text of lower indent list item', () => {
						setModelData( model, modelList( [
							'* a',
							'  * b[]',
							'* c'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* a',
							'  * b[]c'
						] ) );

						sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
						expect( eventInfo.stop.called ).to.be.true;
					} );

					it( 'should delete next empty list item with lower ident', () => {
						setModelData( model, modelList( [
							'* a',
							'  * b[]',
							'* '
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* a',
							'  * b[]'
						] ) );

						sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
						expect( eventInfo.stop.called ).to.be.true;
					} );

					it( 'should merge following item list of first block and adjust it\'s children', () => {
						setModelData( model, modelList( [
							'* a[]',
							'  * b',
							'    * c',
							'    * d',
							'      e',
							'    * f',
							'      * g',
							'        h'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* a[]b',
							'  * c {id:002}',
							'  * d {id:003}',
							'    e',
							'  * f {id:005}',
							'    * g {id:006}',
							'      h'
						] ) );

						sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
						expect( eventInfo.stop.called ).to.be.true;
					} );

					it( 'should merge following first block of an item list and make second block a first one', () => {
						setModelData( model, modelList( [
							'* a[]',
							'  * b',
							'    b2',
							'    * c',
							'    * d',
							'      e'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* a[]b',
							'  b2',
							'  * c {id:003}',
							'  * d {id:004}',
							'    e'
						] ) );

						sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
						expect( eventInfo.stop.called ).to.be.true;
					} );
				} );
			} );

			describe( 'non-collapsed selection starting in first block of a list item', () => {
				describe( 'first position in empty block', () => {
					it( 'should merge two empty list items', () => {
						setModelData( model, modelList( [
							'a',
							'* [',
							'* ]'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'a',
							'* []'
						] ) );
					} );

					it( 'should merge non empty list item', () => {
						setModelData( model, modelList( [
							'* [',
							'* ]text'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []text{id:001}'
						] ) );
					} );

					it( 'should merge non empty list item and delete text', () => {
						setModelData( model, modelList( [
							'* [',
							'* te]xt'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []xt{id:001}'
						] ) );
					} );

					it( 'should merge and adjust indentation of child list item when end selection is at the beginning of item', () => {
						setModelData( model, modelList( [
							'* [',
							'* a',
							'  * ]b'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []',
							'* b {id:002}'
						] ) );
					} );

					it( 'should merge and adjust indentation of child list items', () => {
						setModelData( model, modelList( [
							'* [',
							'* a',
							'  * b]c',
							'    * d'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []c{id:002}',
							'  * d{id:003}'
						] ) );
					} );

					it( 'should merge and adjust indentation of child list items when selection at the end of an item', () => {
						setModelData( model, modelList( [
							'* [',
							'* a',
							'  * bc]',
							'    * d'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []{id:000}',
							'  * d{id:003}'
						] ) );
					} );

					it( 'should delete all items till the end of selection and merge last list item', () => {
						setModelData( model, modelList( [
							'* [',
							'* a',
							'  * b',
							'* ]d'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []',
							'* d {id:003}'
						] ) );
					} );

					it( 'should delete all items and text till the end of selection and merge last list item', () => {
						setModelData( model, modelList( [
							'* [',
							'* a',
							'  * b',
							'* d]e'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []e{id:003}'
						] ) );
					} );
				} );

				describe( 'first position in non-empty block', () => {
					it( 'should merge two list items', () => {
						setModelData( model, modelList( [
							'* [text',
							'* ano]ther'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []ther{id:001}'
						] ) );
					} );

					it( 'should merge two list items if selection starts in the middle of text', () => {
						setModelData( model, modelList( [
							'* te[xt',
							'* ano]ther'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* te[]ther'
						] ) );
					} );

					it( 'should merge non empty list item', () => {
						setModelData( model, modelList( [
							'* text[',
							'* ]another'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* text[]another'
						] ) );
					} );

					it( 'should merge non empty list item and delete text', () => {
						setModelData( model, modelList( [
							'* text[',
							'* ano]ther'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* text[]ther'
						] ) );
					} );

					it( 'should merge and adjust indentation of child list item when end selection is at the beginning of item', () => {
						setModelData( model, modelList( [
							'* text[',
							'* a',
							'  * ]b',
							'    * c'
						] ) );

						view.document.fire( eventInfo, domEventData );
						// output is okay, fix expect
						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* text[]',
							'* b {id:002}',
							'  * c {id:003}'
						] ) );
					} );

					it( 'should merge and adjust indentation of child list items', () => {
						setModelData( model, modelList( [
							'* text[',
							'* a',
							'  * b]c',
							'    * d'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* text[]c',
							'  * d {id:003}'
						] ) );
					} );

					it( 'should merge and adjust indentation of child list items when selection at the end of an item', () => {
						setModelData( model, modelList( [
							'* text[',
							'* a',
							'  * bc]',
							'    * d'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* text[] {id:000}',
							'  * d {id:003}'
						] ) );
					} );

					it( 'should delete all items till the end of selection and merge last list item', () => {
						setModelData( model, modelList( [
							'* text[',
							'* a',
							'  * b',
							'* ]d'
						] ) );

						view.document.fire( eventInfo, domEventData );

						// output is okay, fix expect
						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* text[]',
							'* d {id:003}'
						] ) );
					} );

					it( 'should delete all items and text till the end of selection and merge last list item', () => {
						setModelData( model, modelList( [
							'* text[',
							'* a',
							'  * b',
							'* d]e'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* text[]e'
						] ) );
					} );
				} );
			} );
		} );

		describe( 'multi-block list item', () => {
			describe( 'collapsed selection at the end of a list item', () => {
				describe( 'item after is empty', () => {
					it( 'should remove empty list item', () => {
						setModelData( model, modelList( [
							'* a',
							'  b[]',
							'* '
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* a',
							'  b[]'
						] ) );

						sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
						expect( eventInfo.stop.called ).to.be.true;
					} );

					it.skip( 'should merge following complex list item with current one', () => {
						setModelData( model, modelList( [
							'* ',
							'  []',
							'* b',
							'  c',
							'  * d {id:d}',
							'    e',
							'  * f {id:f}',
							'    * g {id:g}',
							'      h',
							'      * i {id:i}',
							'        * j {id:j}',
							'       k',
							'  l'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* ',
							'  []b',
							'  c',
							'  * d {id:d}',
							'    e',
							'  * f {id:f}',
							'    * g {id:g}',
							'      h',
							'      * i {id:i}',
							'        * j {id:j}',
							'       k',
							'  l'
						] ) );

						sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
						expect( eventInfo.stop.called ).to.be.true;
					} );

					it( 'should merge and remove block of same list item', () => {
						setModelData( model, modelList( [
							'* []',
							'  a'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []a'
						] ) );

						sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
						expect( eventInfo.stop.called ).to.be.true;
					} );

					it( 'should merge indented list item with with currently selected list item', () => {
						setModelData( model, modelList( [
							'* []',
							'  * a',
							'    b'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []a{id:001}',
							'  b'
						] ) );

						sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
						expect( eventInfo.stop.called ).to.be.true;
					} );

					it( 'should merge indented list having block and indented list item with previous empty list item', () => {
						setModelData( model, modelList( [
							'* []',
							'  * a',
							'    b',
							'    * c'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []a {id:001}',
							'  b',
							'  * c {id:003}'
						] ) );

						sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
						expect( eventInfo.stop.called ).to.be.true;
					} );

					it( 'should merge indented list item with first block empty', () => {
						setModelData( model, modelList( [
							'* []',
							'  * ',
							'    text'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []',
							'  text'
						] ) );

						sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
						expect( eventInfo.stop.called ).to.be.true;
					} );

					it( 'should merge next outdented list item', () => {
						setModelData( model, modelList( [
							'* ',
							'  * []',
							'* a',
							'  b'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* ',
							'  * []a {id:002}',
							'    b'
						] ) );

						sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
						expect( eventInfo.stop.called ).to.be.true;
					} );

					it( 'should merge next outdented list item with first block empty', () => {
						setModelData( model, modelList( [
							'* ',
							'  * []',
							'* ',
							'  text'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* ',
							'  * []',
							'    text'
						] ) );

						sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
						expect( eventInfo.stop.called ).to.be.true;
					} );
				} );

				describe( 'list item after is not empty', () => {
					it( 'should merge with previous list item and keep blocks intact', () => {
						setModelData( model, modelList( [
							'* a[]',
							'* b',
							'  c'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* a[]b',
							'  c'
						] ) );

						sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
						expect( eventInfo.stop.called ).to.be.true;
					} );

					it( 'should merge all following outdented blocks', () => {
						setModelData( model, modelList( [
							'* b',
							'  * c',
							'    c2[]',
							'  d',
							'  e'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* b',
							'  * c',
							'    c2[]d',
							'    e'
						] ) );

						sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
						expect( eventInfo.stop.called ).to.be.true;
					} );

					it( 'should merge complex list item', () => {
						setModelData( model, modelList( [
							'* a',
							'  a2[]',
							'* b',
							'  c',
							'  * d',
							'    e',
							'  * f',
							'    * g',
							'      h',
							'      * i',
							'        * j',
							'       k',
							'  l'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* a',
							'  a2[]b',
							'  c',
							'  * d {id:004}',
							'    e',
							'  * f {id:006}',
							'    * g {id:007}',
							'      h',
							'      * i {id:009}',
							'        * j {id:010}',
							'       k',
							'  l'
						] ) );

						sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
						expect( eventInfo.stop.called ).to.be.true;
					} );

					it( 'should merge list item with next multi-block list item', () => {
						setModelData( model, modelList( [
							'* a',
							'  a2[]',
							'* b',
							'  b2'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* a',
							'  a2[]b',
							'  b2'
						] ) );

						sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
						expect( eventInfo.stop.called ).to.be.true;
					} );

					it( 'should merge outdented multi-block list item', () => {
						setModelData( model, modelList( [
							'* a',
							'  a2[]',
							'  * b',
							'    b2'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* a',
							'  a2[]b',
							'  b2'
						] ) );

						sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
						expect( eventInfo.stop.called ).to.be.true;
					} );

					it( 'should merge an outdented list item in an outdented list item', () => {
						setModelData( model, modelList( [
							'* a',
							'  * b',
							'    c[]',
							'    * d'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* a',
							'  * b',
							'    c[]d'
						] ) );

						sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
						expect( eventInfo.stop.called ).to.be.true;
					} );

					it( 'should merge indented empty list item', () => {
						setModelData( model, modelList( [
							'* a',
							'  * b',
							'    c[]',
							'    * '
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* a',
							'  * b',
							'    c[]'
						] ) );

						sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
						expect( eventInfo.stop.called ).to.be.true;
					} );

					it( 'should merge list item with with next outdented list item', () => {
						setModelData( model, modelList( [
							'* a',
							'  * b[]',
							'* c',
							'  d'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* a',
							'  * b[]c',
							'    d'
						] ) );

						sinon.assert.calledOnce( domEventData.domEvent.preventDefault );
						expect( eventInfo.stop.called ).to.be.true;
					} );
				} );
			} );

			describe( 'collapsed selection in the middle of the list item', () => {
				it( 'should merge next indented list item', () => {
					setModelData( model, modelList( [
						'* A',
						'  * B',
						'  # C',
						'    # D',
						'    X[]',
						'    # Z',
						'    V',
						'* E',
						'* F'
					] ) );

					view.document.fire( eventInfo, domEventData );

					expect( getModelData( model ) ).to.equalMarkup( modelList( [
						'* A',
						'  * B',
						'  # C',
						'    # D',
						'    X[]Z',
						'    V',
						'* E {id:007}',
						'* F {id:008}'
					] ) );
				} );
			} );

			describe( 'non-collapsed selection starting in first block of a list item', () => {
				describe( 'first position in empty block', () => {
					it( 'should merge two empty list items', () => {
						setModelData( model, modelList( [
							'* [',
							'* ]',
							'  '
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []',
							'  '
						] ) );
					} );

					it( 'should merge non empty list item', () => {
						setModelData( model, modelList( [
							'* [',
							'* ]text'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []text {id:001}'
						] ) );
					} );

					it( 'should merge non empty list item and delete text', () => {
						setModelData( model, modelList( [
							'* [',
							'* te]xt'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []xt {id:001}'
						] ) );
					} );

					it( 'should merge and adjust indentation of child list item when end selection is at the beginning of item', () => {
						setModelData( model, modelList( [
							'* [',
							'* a',
							'  * ]b'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []',
							'* b {id:002}'
						] ) );
					} );

					it( 'should merge and adjust indentation of child list items', () => {
						setModelData( model, modelList( [
							'* [',
							'* a',
							'  * b]c',
							'    * d'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []c {id:002}',
							'  * d {id:003}'
						] ) );
					} );

					it( 'should merge and adjust indentation of child list items when selection at the end of an item', () => {
						setModelData( model, modelList( [
							'* [',
							'* a',
							'  * bc]',
							'    * d'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* [] {id:000}',
							'  * d {id:003}'
						] ) );
					} );

					it( 'should delete all items till the end of selection and merge last list item', () => {
						setModelData( model, modelList( [
							'* [',
							'* a',
							'  * b',
							'* ]d'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []',
							'* d {id:003}'
						] ) );
					} );

					it( 'should delete all items and text till the end of selection and merge last list item', () => {
						setModelData( model, modelList( [
							'* [',
							'* a',
							'  * b',
							'* d]e'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []e{id:003}'
						] ) );
					} );

					it( 'should delete all following items till the end of selection and merge last list item', () => {
						setModelData( model, modelList( [
							'* [',
							'  text',
							'* a',
							'  * b',
							'* d]e'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []e {id:004}'
						] ) );
					} );

					it( 'should delete all following items till the end of selection and merge last list itemxx', () => {
						setModelData( model, modelList( [
							'* [',
							'  * b',
							'    ]c',
							'    * d',
							'      e'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []',
							'* c',
							'  * d {id:003}',
							'    e'
						] ) );
					} );

					it( 'should delete items till the end of selection and merge middle block with following blocks', () => {
						setModelData( model, modelList( [
							'* [',
							'  * b',
							'    c]d',
							'    * e',
							'      f'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []d {id:001}',
							'  * e {id:003}',
							'    f'
						] ) );
					} );

					it( 'should delete items till the end of selection and merge following blocks', () => {
						setModelData( model, modelList( [
							'* [',
							'  * b',
							'    cd]',
							'    * e',
							'      f',
							'    s'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []',
							'  * e {id:003}',
							'    f',
							'* s {id:001}'
						] ) );
					} );
				} );

				describe( 'first position in non-empty block', () => {
					it( 'should merge two list items', () => {
						setModelData( model, modelList( [
							'* [text',
							'* ano]ther',
							'  text'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []ther {id:001}',
							'  text'
						] ) );
					} );

					// Not related to merge command
					it( 'should merge two list items with selection in the middle', () => {
						setModelData( model, modelList( [
							'* te[xt',
							'* ano]ther'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* te[]ther'
						] ) );
					} );

					it( 'should merge non empty list item', () => {
						setModelData( model, modelList( [
							'* [',
							'* ]text'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []text {id:001}'
						] ) );
					} );

					it( 'should merge non empty list item and delete text', () => {
						setModelData( model, modelList( [
							'* [',
							'* te]xt'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []xt{id:001}'
						] ) );
					} );

					it( 'should merge and adjust indentation of child list item when end selection is at the beginning of item', () => {
						setModelData( model, modelList( [
							'* [',
							'* a',
							'  * ]b',
							'    * c'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []',
							'* b {id:002}',
							'  * c {id:003}'
						] ) );
					} );

					it( 'should merge and adjust indentation of child list items', () => {
						setModelData( model, modelList( [
							'* [',
							'* a',
							'  * b]c',
							'    * d'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []c{id:002}',
							'  * d{id:003}'
						] ) );
					} );

					it( 'should merge and adjust indentation of child list items when selection at the end of an item', () => {
						setModelData( model, modelList( [
							'* [',
							'* a',
							'  * bc]',
							'    * d'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* [] {id:000}',
							'  * d {id:003}'
						] ) );
					} );

					it( 'should delete all items till the end of selection and merge last list item', () => {
						setModelData( model, modelList( [
							'* [',
							'* a',
							'  * b',
							'* ]d'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []',
							'* d {id:003}'
						] ) );
					} );

					it( 'should delete all items and text till the end of selection and merge last list item', () => {
						setModelData( model, modelList( [
							'* [',
							'* a',
							'  * b',
							'* d]e'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []e{id:003}'
						] ) );
					} );

					it( 'should delete all items and text till the end of selection and adjust orphan elements', () => {
						setModelData( model, modelList( [
							'* [',
							'* a',
							'  * b]',
							'    c',
							'    * d',
							'      e',
							'  f',
							'  g'
						] ) );

						view.document.fire( eventInfo, domEventData );

						expect( getModelData( model ) ).to.equalMarkup( modelList( [
							'* []',
							'  c',
							'  * d {id:004}',
							'    e',
							'* f {id:001}',
							'  g'
						] ) );
					} );
				} );
			} );
		} );
	} );
} );
