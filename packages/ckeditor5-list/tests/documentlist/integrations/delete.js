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
	const blocksChangedByCommands = [];

	let editor, model, view;
	let eventInfo, domEventData;
	let mergeBackwardCommand, mergeForwardCommand, splitAfterCommand, outdentCommand,
		commandSpies,
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
		// modelRoot = model.document.getRoot();

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
		outdentCommand = editor.commands.get( 'outdentList' );
		mergeBackwardCommand = editor.commands.get( 'mergeListItemBackward' );
		mergeForwardCommand = editor.commands.get( 'mergeListItemForward' );

		splitAfterCommandExecuteSpy = sinon.spy( splitAfterCommand, 'execute' );
		outdentCommandExecuteSpy = sinon.spy( outdentCommand, 'execute' );
		mergeBackwardCommandExecuteSpy = sinon.spy( mergeBackwardCommand, 'execute' );
		mergeForwardCommandExecuteSpy = sinon.spy( mergeForwardCommand, 'execute' );

		commandSpies = {
			outdent: outdentCommandExecuteSpy,
			splitAfter: splitAfterCommandExecuteSpy,
			mergeBackward: mergeBackwardCommandExecuteSpy,
			mergeForward: mergeForwardCommandExecuteSpy
		};

		blocksChangedByCommands.length = 0;

		outdentCommand.on( 'afterExecute', ( evt, data ) => {
			blocksChangedByCommands.push( ...data );
		} );

		splitAfterCommand.on( 'afterExecute', ( evt, data ) => {
			blocksChangedByCommands.push( ...data );
		} );

		mergeBackwardCommand.on( 'afterExecute', ( evt, data ) => {
			blocksChangedByCommands.push( ...data );
		} );

		mergeForwardCommand.on( 'afterExecute', ( evt, data ) => {
			blocksChangedByCommands.push( ...data );
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
						runTest( {
							input: [
								'* []'
							],
							expected: [
								'[]'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 1,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 0
							},
							changedBlocks: [ 0 ]
						} );
					} );

					it( 'should merge non empty list item with with previous list item as a block', () => {
						runTest( {
							input: [
								'* ',
								'* []b'
							],
							expected: [
								'* []b {id:001}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 1,
								mergeForward: 0
							},
							changedBlocks: [ 0, 1 ]
						} );
					} );

					it( 'should merge empty list item with with previous empty list item', () => {
						runTest( {
							input: [
								'* ',
								'* []'
							],
							expected: [
								'* []'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 1,
								mergeForward: 0
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge indented list item with with previous empty list item', () => {
						runTest( {
							input: [
								'* ',
								'  * []a'
							],
							expected: [
								'* []a {id:001}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 1,
								mergeForward: 0
							},
							changedBlocks: [ 0 ]
						} );
					} );

					it( 'should merge indented empty list item with with previous empty list item', () => {
						runTest( {
							input: [
								'* ',
								'  * []'
							],
							expected: [
								'* []'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 1,
								mergeForward: 0
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge list item with with previous indented empty list item', () => {
						runTest( {
							input: [
								'* ',
								'  * ',
								'* []a'
							],
							expected: [
								'* ',
								'  * []a{id:002}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 1,
								mergeForward: 0
							},
							changedBlocks: [ 1, 2 ]
						} );
					} );

					it( 'should merge empty list item with with previous indented empty list item', () => {
						runTest( {
							input: [
								'* ',
								'  * ',
								'* []'
							],
							expected: [
								'* ',
								'  * []'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 1,
								mergeForward: 0
							},
							changedBlocks: [ 2 ]
						} );
					} );
				} );

				describe( 'item before is not empty', () => {
					it( 'should merge non empty list item with with previous list item as a block', () => {
						runTest( {
							input: [
								'* a',
								'* []b'
							],
							expected: [
								'* a',
								'  []b'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 1,
								mergeForward: 0
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge empty list item with with previous list item as a block', () => {
						runTest( {
							input: [
								'* a',
								'* []'
							],
							expected: [
								'* a',
								'  []'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 1,
								mergeForward: 0
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge indented list item with with parent list item as a block', () => {
						runTest( {
							input: [
								'* a',
								'  * []b'
							],
							expected: [
								'* a',
								'  []b'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 1,
								mergeForward: 0
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge indented empty list item with with parent list item as a block', () => {
						runTest( {
							input: [
								'* a',
								'  * []'
							],
							expected: [
								'* a',
								'  []'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 1,
								mergeForward: 0
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge list item with with previous list item with higher indent as a block', () => {
						runTest( {
							input: [
								'* a',
								'  * b',
								'* []c'
							],
							expected: [
								'* a',
								'  * b',
								'  []c'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 1,
								mergeForward: 0
							},
							changedBlocks: [ 2 ]
						} );
					} );

					it( 'should merge empty list item with with previous list item with higher indent as a block', () => {
						runTest( {
							input: [
								'* a',
								'  * b',
								'* []'
							],
							expected: [
								'* a',
								'  * b',
								'  []'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 1,
								mergeForward: 0
							},
							changedBlocks: [ 2 ]
						} );
					} );

					it( 'should keep merged list item\'s children', () => {
						runTest( {
							input: [
								'* a',
								'  * []b',
								'    * c',
								'    * d',
								'      e',
								'    * f',
								'      * g',
								'        h'
							],
							expected: [
								'* a',
								'  []b',
								'  * c',
								'  * d',
								'    e',
								'  * f',
								'    * g',
								'      h'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 1,
								mergeForward: 0
							},
							changedBlocks: [ 1, 2, 3, 4, 5, 6, 7 ]
						} );
					} );
				} );
			} );

			describe( 'collapsed selection at the end of a list item', () => {
				describe( 'item after is empty', () => {
					it( 'should merge non empty list item with with previous list item as a block', () => {
						runTest( {
							input: [
								'* ',
								'* []b'
							],
							expected: [
								'* []b{id:001}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 1,
								mergeForward: 0
							},
							changedBlocks: [ 1 ]
						} );
					} );

					// Default behaviour of backspace?
					it( 'should merge empty list item with with previous empty list item', () => {
						runTest( {
							input: [
								'* ',
								'* []'
							],
							expected: [
								'* []'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 1,
								mergeForward: 0
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge indented list item with with previous empty list item', () => {
						runTest( {
							input: [
								'* ',
								'  * []a'
							],
							expected: [
								'* []a {id:001}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 1,
								mergeForward: 0
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge indented empty list item with with previous empty list item', () => {
						runTest( {
							input: [
								'* ',
								'  * []'
							],
							expected: [
								'* []'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 1,
								mergeForward: 0
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge list item with with previous indented empty list item', () => {
						runTest( {
							input: [
								'* ',
								'  * ',
								'* []a'
							],
							expected: [
								'* ',
								'  * []a{id:002}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 1,
								mergeForward: 0
							},
							changedBlocks: [ 2 ]
						} );
					} );

					it( 'should merge empty list item with with previous indented empty list item', () => {
						runTest( {
							input: [
								'* ',
								'  * ',
								'* []'
							],
							expected: [
								'* ',
								'  * []'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 1,
								mergeForward: 0
							},
							changedBlocks: [ 2 ]
						} );
					} );
				} );

				describe( 'item before is not empty', () => {
					it( 'should merge non empty list item with with previous list item as a block', () => {
						runTest( {
							input: [
								'* a',
								'* []b'
							],
							expected: [
								'* a',
								'  []b'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 1,
								mergeForward: 0
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge empty list item with with previous list item as a block', () => {
						runTest( {
							input: [
								'* a',
								'* []'
							],
							expected: [
								'* a',
								'  []'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 1,
								mergeForward: 0
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge indented list item with with parent list item as a block', () => {
						runTest( {
							input: [
								'* a',
								'  * []b'
							],
							expected: [
								'* a',
								'  []b'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 1,
								mergeForward: 0
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge indented empty list item with with parent list item as a block', () => {
						runTest( {
							input: [
								'* a',
								'  * []'
							],
							expected: [
								'* a',
								'  []'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 1,
								mergeForward: 0
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge list item with with previous list item with higher indent as a block', () => {
						runTest( {
							input: [
								'* a',
								'  * b',
								'* []c'
							],
							expected: [
								'* a',
								'  * b',
								'  []c'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 1,
								mergeForward: 0
							},
							changedBlocks: [ 2 ]
						} );
					} );

					it( 'should merge empty list item with with previous list item with higher indent as a block', () => {
						runTest( {
							input: [
								'* a',
								'  * b',
								'* []'
							],
							expected: [
								'* a',
								'  * b',
								'  []'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 1,
								mergeForward: 0
							},
							changedBlocks: [ 2 ]
						} );
					} );

					it( 'should keep merged list item\'s children', () => {
						runTest( {
							input: [
								'* a',
								'  * []b',
								'    * c',
								'    * d',
								'      e',
								'    * f',
								'      * g',
								'        h'
							],
							expected: [
								'* a',
								'  []b',
								'  * c',
								'  * d',
								'    e',
								'  * f',
								'    * g',
								'      h'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 1,
								mergeForward: 0
							},
							changedBlocks: [ 1, 2, 3, 4, 5, 6, 7 ]
						} );
					} );
				} );
			} );

			describe( 'non-collapsed selection starting in first block of a list item', () => {
				describe( 'first position in empty block', () => {
					it( 'should merge two empty list items', () => {
						runTest( {
							input: [
								'a',
								'* [',
								'* ]'
							],
							expected: [
								'a',
								'* []'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 2 ]
						} );
					} );

					it( 'should merge non empty list item', () => {
						runTest( {
							input: [
								'* [',
								'* ]text'
							],
							expected: [
								'* []text{id:001}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge non empty list item and delete text', () => {
						runTest( {
							input: [
								'* [',
								'* te]xt'
							],
							expected: [
								'* []xt{id:001}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge and adjust indentation of child list item when end selection is at the beginning of item', () => {
						runTest( {
							input: [
								'* [',
								'* a',
								'  * ]b'
							],
							expected: [
								'* []',
								'* b {id:002}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge and adjust indentation of child list items', () => {
						runTest( {
							input: [
								'* [',
								'* a',
								'  * b]c',
								'    * d'
							],
							expected: [
								'* []c{id:002}',
								'  * d{id:003}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 0, 1, 2 ]
						} );
					} );

					it( 'should merge and adjust indentation of child list items when selection at the end of an item', () => {
						runTest( {
							input: [
								'* [',
								'* a',
								'  * bc]',
								'    * d'
							],
							expected: [
								'* []{id:000}',
								'  * d{id:003}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 0, 1, 2, 3 ]
						} );
					} );

					it( 'should delete all items till the end of selection and merge last list item', () => {
						runTest( {
							input: [
								'* [',
								'* a',
								'  * b',
								'* ]d'
							],
							expected: [
								'* []',
								'* d {id:003}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 0, 1, 2 ]
						} );
					} );

					it( 'should delete all items and text till the end of selection and merge last list item', () => {
						runTest( {
							input: [
								'* [',
								'* a',
								'  * b',
								'* d]e'
							],
							expected: [
								'* []e{id:003}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 0, 1, 2 ]
						} );
					} );
				} );

				describe( 'first position in non-empty block', () => {
					it( 'should merge two list items', () => {
						runTest( {
							input: [
								'* [text',
								'* ano]ther'
							],
							expected: [
								'* []ther{id:001}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge two list items if selection is in the middle', () => {
						runTest( {
							input: [
								'* te[xt',
								'* ano]ther'
							],
							expected: [
								'* te[]ther'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge non empty list item', () => {
						runTest( {
							input: [
								'* text[',
								'* ]another'
							],
							expected: [
								'* text[]another'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge non empty list item and delete text', () => {
						runTest( {
							input: [
								'* text[',
								'* ano]ther'
							],
							expected: [
								'* text[]ther'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge and adjust indentation of child list item when end selection is at the beginning of item', () => {
						runTest( {
							input: [
								'* text[',
								'* a',
								'  * ]b',
								'    * c'
							],
							expected: [
								'* text[]',
								'* b {id:002}',
								'  * c{id:003}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge and adjust indentation of child list items', () => {
						runTest( {
							input: [
								'* text[',
								'* a',
								'  * b]c',
								'    * d'
							],
							expected: [
								'* text[]c',
								'  * d{id:003}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge and adjust indentation of child list items when selection at the end of an item', () => {
						runTest( {
							input: [
								'* text[',
								'* a',
								'  * bc]',
								'    * d'
							],
							expected: [
								'* text[]{id:000}',
								'  * d{id:003}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should delete all items till the end of selection and merge last list item', () => {
						runTest( {
							input: [
								'* text[',
								'* a',
								'  * b',
								'* ]d'
							],
							expected: [
								'* text[]',
								'* d {id:003}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should delete all items and text till the end of selection and merge last list item', () => {
						runTest( {
							input: [
								'* text[',
								'* a',
								'  * b',
								'* d]e'
							],
							expected: [
								'* text[]e'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );
				} );
			} );
		} );

		describe( 'multi-block list item', () => {
			describe( 'collapsed selection at the beginning of a list item', () => {
				describe( 'item before is empty', () => {
					it( 'should merge with previous list item and keep blocks intact', () => {
						runTest( {
							input: [
								'* ',
								'* []b',
								'  c'
							],
							expected: [
								'* []b{id:001}',
								'  c'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 1,
								mergeForward: 0
							},
							changedBlocks: [ 0 ]
						} );
					} );

					it( 'should merge with previous list item and keep complex blocks intact ', () => {
						runTest( {
							input: [
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
							],
							expected: [
								'* []b {id:001}',
								'  c',
								'  * d {id:003}',
								'    e',
								'  * f {id:005}',
								'    * g {id:006}',
								'      h',
								'      * i {id:008}',
								'        * j {id:009}',
								'       k',
								'  l'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 1,
								mergeForward: 0
							},
							changedBlocks: [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ]
						} );
					} );

					it( 'should merge list item with first block empty with previous empty list item', () => {
						runTest( {
							input: [
								'* ',
								'* []',
								'  a'
							],
							expected: [
								'* []',
								'  a'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 1,
								mergeForward: 0
							},
							changedBlocks: [ 0 ]
						} );
					} );

					it( 'should merge indented list item with with previous empty list item', () => {
						runTest( {
							input: [
								'* ',
								'  * []a',
								'    b'
							],
							expected: [
								'* []a {id:001}',
								'  b'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 1,
								mergeForward: 0
							},
							changedBlocks: [ 0, 1, 2 ]
						} );
					} );

					it( 'should merge indented list having block and indented list item with previous empty list item', () => {
						runTest( {
							input: [
								'* ',
								'  * []a',
								'    b',
								'    * c'
							],
							expected: [
								'* []a {id:001}',
								'  b',
								'  * c {id:003}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 1,
								mergeForward: 0
							},
							changedBlocks: [ 0, 1, 2, 3 ]
						} );
					} );

					it( 'should merge indented empty list item with previous empty list item', () => {
						runTest( {
							input: [
								'* ',
								'  * []',
								'    text'
							],
							expected: [
								'* []',
								'  text'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 1,
								mergeForward: 0
							},
							changedBlocks: [ 0, 1, 2 ]
						} );
					} );

					it( 'should merge list item with with previous indented empty list item', () => {
						runTest( {
							input: [
								'* ',
								'  * ',
								'* []a',
								'  b'
							],
							expected: [
								'* ',
								'  * []a{id:002}',
								'    b'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 1,
								mergeForward: 0
							},
							changedBlocks: [ 2, 3 ]
						} );
					} );

					it( 'should merge empty list item with with previous indented empty list item', () => {
						runTest( {
							input: [
								'* ',
								'  * ',
								'* []',
								'  text'
							],
							expected: [
								'* ',
								'  * []',
								'    text'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 1,
								mergeForward: 0
							},
							changedBlocks: [ 1 ]
						} );
					} );
				} );

				describe( 'item before is not empty', () => {
					it( 'should merge with previous list item and keep blocks intact', () => {
						runTest( {
							input: [
								'* a',
								'* []b',
								'  c'
							],
							expected: [
								'* a',
								'  []b',
								'  c'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 1,
								mergeForward: 0
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge block to a previous list item', () => {
						runTest( {
							input: [
								'* b',
								'  * c',
								'  []d',
								'  e'
							],
							expected: [
								'* b',
								'  * c',
								'    []d',
								'  e'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 1,
								mergeForward: 0
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge with previous list item and keep complex blocks intact', () => {
						runTest( {
							input: [
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
							],
							expected: [
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
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 1,
								mergeForward: 0
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge list item with first block empty with previous list item', () => {
						runTest( {
							input: [
								'* a',
								'* []',
								'  b'
							],
							expected: [
								'* a',
								'  []',
								'  b'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 1,
								mergeForward: 0
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge indented list item with with previous list item as blocks', () => {
						runTest( {
							input: [
								'* a',
								'  * []a',
								'    b'
							],
							expected: [
								'* a',
								'  []a',
								'  b'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 1,
								mergeForward: 0
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge indented list having block and indented list item with previous list item', () => {
						runTest( {
							input: [
								'* a',
								'  * []b',
								'    c',
								'    * d'
							],
							expected: [
								'* a',
								'  []b',
								'  c',
								'  * d'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 1,
								mergeForward: 0
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge indented empty list item with previous list item', () => {
						runTest( {
							input: [
								'* a',
								'  * []',
								'    text'
							],
							expected: [
								'* a',
								'  []',
								'  text'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 1,
								mergeForward: 0
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge list item with with previous indented empty list item', () => {
						runTest( {
							input: [
								'* a',
								'  * b',
								'* []c',
								'  d'
							],
							expected: [
								'* a',
								'  * b',
								'  []c',
								'  d'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 1,
								mergeForward: 0
							},
							changedBlocks: [ 1 ]
						} );
					} );
				} );
			} );

			describe( 'collapsed selection in the middle of the list item', () => {
				it( 'should merge block to a previous list item', () => {
					runTest( {
						input: [
							'* A',
							'  * B',
							'  # C',
							'    # D',
							'    []X',
							'    # Z',
							'    V',
							'* E',
							'* F'
						],
						expected: [
							'* A',
							'  * B',
							'  # C',
							'    # D',
							'      []X',
							'      # Z',
							'    V',
							'* E',
							'* F'
						],
						eventStopped: true,
						executedCommands: {
							outdent: 0,
							splitAfter: 0,
							mergeBackward: 1,
							mergeForward: 0
						},
						changedBlocks: [ 1 ]
					} );
				} );
			} );

			describe( 'non-collapsed selection starting in first block of a list item', () => {
				describe( 'first position in empty block', () => {
					it( 'should merge two empty list items', () => {
						runTest( {
							input: [
								'* [',
								'* ]',
								'  '
							],
							expected: [
								'* []',
								'  '
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge non empty list item', () => {
						runTest( {
							input: [
								'* [',
								'* ]text'
							],
							expected: [
								'* []text{id:001}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge non empty list item and delete text', () => {
						runTest( {
							input: [
								'* [',
								'* te]xt'
							],
							expected: [
								'* []xt{id:001}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge and adjust indentation of child list item when end selection is at the beginning of item', () => {
						runTest( {
							input: [
								'* [',
								'* a',
								'  * ]b'
							],
							expected: [
								'* []',
								'* b {id:002}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge and adjust indentation of child list items', () => {
						runTest( {
							input: [
								'* [',
								'* a',
								'  * b]c',
								'    * d'
							],
							expected: [
								'* []c{id:002}',
								'  * d{id:003}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge and adjust indentation of child list items when selection at the end of an item', () => {
						runTest( {
							input: [
								'* [',
								'* a',
								'  * bc]',
								'    * d'
							],
							expected: [
								'* []{id:000}',
								'  * d{id:003}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should delete all items till the end of selection and merge last list item', () => {
						runTest( {
							input: [
								'* [',
								'* a',
								'  * b',
								'* ]d'
							],
							expected: [
								'* []',
								'* d {id:003}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should delete all items and text till the end of selection and merge last list item', () => {
						runTest( {
							input: [
								'* [',
								'* a',
								'  * b',
								'* d]e'
							],
							expected: [
								'* []e{id:003}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should delete all following items till the end of selection and merge last list item', () => {
						runTest( {
							input: [
								'* [',
								'  text',
								'* a',
								'  * b',
								'* d]e'
							],
							expected: [
								'* []e{id:004}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should delete all following items till the end of selection and merge last list itemxx', () => {
						runTest( {
							input: [
								'* [',
								'  * b',
								'    ]c',
								'    * d',
								'      e'
							],
							expected: [
								'* []',
								'* c',
								'  * d {id:003}',
								'    e'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should delete items till the end of selection and merge middle block with following blocks', () => {
						runTest( {
							input: [
								'* [',
								'  * b',
								'    c]d',
								'    * e',
								'      f'
							],
							expected: [
								'* []d{id:001}',
								'  * e{id:003}',
								'    f'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should delete items till the end of selection and merge following blocks', () => {
						runTest( {
							input: [
								'* [',
								'  * b',
								'    cd]',
								'    * e',
								'      f',
								'    s'
							],
							expected: [
								'* []',
								'  * e {id:003}',
								'    f',
								'* s {id:001}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );
				} );

				describe( 'first position in non-empty block', () => {
					it( 'should merge two list items', () => {
						runTest( {
							input: [
								'* [text',
								'* ano]ther',
								'  text'
							],
							expected: [
								'* []ther{id:001}',
								'  text'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					// Not related to merge command
					it( 'should merge two list items with selection in the middle', () => {
						runTest( {
							input: [
								'* te[xt',
								'* ano]ther'
							],
							expected: [
								'* te[]ther'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge non empty list item', () => {
						runTest( {
							input: [
								'* [',
								'* ]text'
							],
							expected: [
								'* []text{id:001}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge non empty list item and delete text', () => {
						runTest( {
							input: [
								'* [',
								'* te]xt'
							],
							expected: [
								'* []xt{id:001}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge and adjust indentation of child list item when end selection is at the beginning of item', () => {
						runTest( {
							input: [
								'* [',
								'* a',
								'  * ]b',
								'    * c'
							],
							expected: [
								'* []',
								'* b {id:002}',
								'  * c {id:003}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge and adjust indentation of child list items', () => {
						runTest( {
							input: [
								'* [',
								'* a',
								'  * b]c',
								'    * d'
							],
							expected: [
								'* []c{id:002}',
								'  * d{id:003}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge and adjust indentation of child list items when selection at the end of an item', () => {
						runTest( {
							input: [
								'* [',
								'* a',
								'  * bc]',
								'    * d'
							],
							expected: [
								'* []{id:000}',
								'  * d{id:003}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should delete all items till the end of selection and merge last list item', () => {
						runTest( {
							input: [
								'* [',
								'* a',
								'  * b',
								'* ]d'
							],
							expected: [
								'* []',
								'* d {id:003}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should delete all items and text till the end of selection and merge last list item', () => {
						runTest( {
							input: [
								'* [',
								'* a',
								'  * b',
								'* d]e'
							],
							expected: [
								'* []e{id:003}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should delete all items and text till the end of selection and adjust orphan elements', () => {
						runTest( {
							input: [
								'* [',
								'* a',
								'  * b]',
								'    c',
								'    * d',
								'      e',
								'  f',
								'  g'
							],
							expected: [
								'* []',
								'  c',
								'  * d {id:004}',
								'    e',
								'* f {id:001}',
								'  g'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );
				} );
			} );
		} );

		describe( 'selection outside list', () => {
			describe( 'collapsed selection', () => {
				it( 'no list editing commands should be executed outside list (empty paragraph)', () => {
					runTest( {
						input: [
							'[]'
						],
						expected: [
							'[]'
						],
						eventStopped: {
							preventDefault: 1,
							stop: undefined
						},
						executedCommands: {
							outdent: 0,
							splitAfter: 0,
							mergeBackward: 0,
							mergeForward: 0
						},
						changedBlocks: []
					} );
				} );

				it( 'no list editing commands should be executed outside list (selection at the beginning of text)', () => {
					runTest( {
						input: [
							'[]text'
						],
						expected: [
							'[]text'
						],
						eventStopped: {
							preventDefault: 1,
							stop: undefined
						},
						executedCommands: {
							outdent: 0,
							splitAfter: 0,
							mergeBackward: 0,
							mergeForward: 0
						},
						changedBlocks: []
					} );
				} );

				it( 'no list editing commands should be executed outside list (selection at the end of text)', () => {
					runTest( {
						input: [
							'text[]'
						],
						expected: [
							'tex[]'
						],
						eventStopped: {
							preventDefault: 1,
							stop: undefined
						},
						executedCommands: {
							outdent: 0,
							splitAfter: 0,
							mergeBackward: 0,
							mergeForward: 0
						},
						changedBlocks: []
					} );
				} );

				it( 'no list editing commands should be executed outside list (selection in the middle of text)', () => {
					runTest( {
						input: [
							'te[]xt'
						],
						expected: [
							't[]xt'
						],
						eventStopped: {
							preventDefault: 1,
							stop: undefined
						},
						executedCommands: {
							outdent: 0,
							splitAfter: 0,
							mergeBackward: 0,
							mergeForward: 0
						},
						changedBlocks: []
					} );
				} );

				it( 'no list editing commands should be executed next to a list', () => {
					runTest( {
						input: [
							'1[]',
							'* 2'
						],
						expected: [
							'[]',
							'* 2'
						],
						eventStopped: {
							preventDefault: 1,
							stop: undefined
						},
						executedCommands: {
							outdent: 0,
							splitAfter: 0,
							mergeBackward: 0,
							mergeForward: 0
						},
						changedBlocks: []
					} );
				} );

				it( 'no list editing commands should be executed when merging two lists', () => {
					runTest( {
						input: [
							'* 1',
							'[]2',
							'* 3'
						],
						expected: [
							'* 1[]2',
							'* 3 {id:002}'
						],
						eventStopped: {
							preventDefault: 1,
							stop: undefined
						},
						executedCommands: {
							outdent: 0,
							splitAfter: 0,
							mergeBackward: 0,
							mergeForward: 0
						},
						changedBlocks: []
					} );
				} );

				it( 'no list editing commands should be executed when merging two lists - one nested', () => {
					runTest( {
						input: [
							'* 1',
							'[]2',
							'* 3',
							'  * 4'
						],
						expected: [
							'* 1[]2',
							'* 3 {id:002}',
							'  * 4 {id:003}'
						],
						eventStopped: {
							preventDefault: 1,
							stop: undefined
						},
						executedCommands: {
							outdent: 0,
							splitAfter: 0,
							mergeBackward: 0,
							mergeForward: 0
						},
						changedBlocks: []
					} );
				} );

				it( 'empty list should be deleted', () => {
					runTest( {
						input: [
							'* ',
							'[]2',
							'* 3'
						],
						expected: [
							'[]2',
							'* 3 {id:002}'
						],
						eventStopped: {
							preventDefault: 1,
							stop: undefined
						},
						executedCommands: {
							outdent: 0,
							splitAfter: 0,
							mergeBackward: 0,
							mergeForward: 0
						},
						changedBlocks: []
					} );
				} );
			} );

			describe( 'non-collapsed selection', () => {
				describe( 'outside list', () => {
					it( 'no list editing commands should be executed', () => {
						runTest( {
							input: [
								't[ex]t'
							],
							expected: [
								't[]t'
							],
							eventStopped: {
								preventDefault: 1,
								stop: undefined
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 0
							},
							changedBlocks: []
						} );
					} );

					it( 'no list editing commands should be executed when outside list when next to a list', () => {
						runTest( {
							input: [
								't[ex]t',
								'* 1'
							],
							expected: [
								't[]t',
								'* 1'
							],
							eventStopped: {
								preventDefault: 1,
								stop: undefined
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 0
							},
							changedBlocks: []
						} );
					} );
				} );

				describe( 'only start in a list', () => {
					it( 'no list editing commands should be executed when doing delete', () => {
						runTest( {
							input: [
								'* te[xt',
								'aa]'
							],
							expected: [
								'* te[]'
							],
							eventStopped: {
								preventDefault: 1,
								stop: undefined
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 0
							},
							changedBlocks: []
						} );
					} );

					it( 'no list editing commands should be executed when doing delete (multi-block list)', () => {
						runTest( {
							input: [
								'* te[xt1',
								'  text2',
								'  * text3',
								'text4]'
							],
							expected: [
								'* te[]'
							],
							eventStopped: {
								preventDefault: 1,
								stop: undefined
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 0
							},
							changedBlocks: []
						} );
					} );

					it( 'should delete everything till end of selection and merge remaining text', () => {
						runTest( {
							input: [
								'* text1',
								'  tex[t2',
								'  * text3',
								'tex]t4'
							],
							expected: [
								'* text1',
								'  tex[]t4'
							],
							eventStopped: {
								preventDefault: 1,
								stop: undefined
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 0
							},
							changedBlocks: []
						} );
					} );
				} );

				describe( 'only end in a list', () => {
					it( 'should delete everything till end of selection', () => {
						runTest( {
							input: [
								'[',
								'* te]xt'
							],
							expected: [
								'* []xt {id:001}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should delete everything till the end of selection and adjust remaining block to item list', () => {
						runTest( {
							input: [
								'a[',
								'* b]b',
								'  c'
							],
							expected: [
								'a[]b',
								'* c'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should delete everything till the end of selection and adjust remaining item list indentation', () => {
						runTest( {
							input: [
								'a[',
								'* b]b',
								'  * c'
							],
							expected: [
								'a[]b',
								'* c {id:002}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should delete selection and adjust remaining item list indentation (multi-block)', () => {
						runTest( {
							input: [
								'a[',
								'* b]b',
								'  * c',
								'    d'
							],
							expected: [
								'a[]b',
								'* c {id:002}',
								'  d'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					// TODO: skipped because below TODO
					it.skip( 'should remove selection and adjust remaining list', () => {
						runTest( {
							input: [
								'a[',
								'* b]b',
								'  * c',
								'  d'
							],
							expected: [
								'a[]b',
								'* c',
								'  d' // TODO: No way currently to adjust this block id <-
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should remove selection and adjust remaining list (multi-block)', () => {
						runTest( {
							input: [
								'a[',
								'* b',
								'  * c',
								'    d]d',
								'    * e',
								'      f'
							],
							expected: [
								'a[]d',
								'* e {id:004}',
								'  f'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );
				} );

				describe( 'spanning multiple lists', () => {
					it( 'should merge lists into one with one list item', () => {
						runTest( {
							input: [
								'* a[a',
								'b',
								'* c]c'
							],
							expected: [
								'* a[]c'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge lists into one with two blocks', () => {
						runTest( {
							input: [
								'* a',
								'  b[b',
								'c',
								'* d]d'
							],
							expected: [
								'* a',
								'  b[]d'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge two lists into one with two list items', () => {
						runTest( {
							input: [
								'* a[',
								'c',
								'* d]',
								'* e'
							],
							expected: [
								'* a[]',
								'* e {id:003}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge two lists into one with two list items (multiple blocks)', () => {
						runTest( {
							input: [
								'* a[',
								'c',
								'* d]',
								'  e',
								'* f'
							],
							expected: [
								'* a[]',
								'  e',
								'* f {id:004}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge two lists into one with two list items and adjust indentation', () => {
						runTest( {
							input: [
								'* a[',
								'c',
								'* d',
								'  * e]e',
								'    * f',
								'      g'
							],
							expected: [
								'* a[]e',
								'  * f {id:004}',
								'    g'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge two lists into one with deeper indendation', () => {
						runTest( {
							input: [
								'* a',
								'  * b[',
								'c',
								'* d',
								'  * e',
								'    * f]f',
								'      * g'
							],
							expected: [
								'* a',
								'  * b[]f',
								'    * g {id:006}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge two lists into one with deeper indentation (multiple blocks)', () => {
						runTest( {
							input: [
								'* a',
								'  * b[',
								'c',
								'* d',
								'  * e]e',
								'    * f',
								'      g'
							],
							expected: [
								'* a',
								'  * b[]e',
								'    * f {id:005}',
								'      g'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge two lists into one and keep items after selection', () => {
						runTest( {
							input: [
								'* a[',
								'c',
								'* d',
								'  * e]e',
								'* f',
								'  g'
							],
							expected: [
								'* a[]e',
								'* f {id:004}',
								'  g'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge lists of different types to a single list and keep item lists types', () => {
						runTest( {
							input: [
								'* a',
								'* b[b',
								'c',
								'# d]d',
								'# d'
							],
							expected: [
								'* a',
								'* b[]d',
								'# d {id:004}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge lists of mixed types to a single list and keep item lists types', () => {
						runTest( {
							input: [
								'* a',
								'# b[b',
								'c',
								'# d]d',
								'  * f'
							],
							expected: [
								'* a',
								'# b[]d',
								'  * f {id:004}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
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
					it( 'should remove list when in empty only element of a list', () => {
						runTest( {
							input: [
								'* []'
							],
							expected: [
								'[]'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should remove next empty list item', () => {
						runTest( {
							input: [
								'* b[]',
								'* '
							],
							expected: [
								'* b[]'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should remove next empty list item when current is empty', () => {
						runTest( {
							input: [
								'* []',
								'* '
							],
							expected: [
								'* []'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should remove current list item if empty and replace with indented', () => {
						runTest( {
							input: [
								'* []',
								'  * a'
							],
							expected: [
								'* []a {id:001}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should remove next empty indented item list', () => {
						runTest( {
							input: [
								'* []',
								'  * '
							],
							expected: [
								'* []'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should replace current empty list item with next list item', () => {
						runTest( {
							input: [
								'* ',
								'  * []',
								'* a'
							],
							expected: [
								'* ',
								'  * []a{id:002}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should remove next empty list item when current is also empty', () => {
						runTest( {
							input: [
								'* ',
								'  * []',
								'* '
							],
							expected: [
								'* ',
								'  * []'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );
				} );

				describe( 'next list item is not empty', () => {
					it( 'should merge text from next list item with current list item text', () => {
						runTest( {
							input: [
								'* a[]',
								'* b'
							],
							expected: [
								'* a[]b'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should delete next empty item list', () => {
						runTest( {
							input: [
								'* a[]',
								'* '
							],
							expected: [
								'* a[]'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge text of indented list item with current list item', () => {
						runTest( {
							input: [
								'* a[]',
								'  * b'
							],
							expected: [
								'* a[]b'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should remove indented empty list item', () => {
						runTest( {
							input: [
								'* a[]',
								'  * '
							],
							expected: [
								'* a[]'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge text of lower indent list item', () => {
						runTest( {
							input: [
								'* a',
								'  * b[]',
								'* c'
							],
							expected: [
								'* a',
								'  * b[]c'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should delete next empty list item with lower ident', () => {
						runTest( {
							input: [
								'* a',
								'  * b[]',
								'* '
							],
							expected: [
								'* a',
								'  * b[]'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge following item list of first block and adjust it\'s children', () => {
						runTest( {
							input: [
								'* a[]',
								'  * b',
								'    * c',
								'    * d',
								'      e',
								'    * f',
								'      * g',
								'        h'
							],
							expected: [
								'* a[]b',
								'  * c {id:002}',
								'  * d {id:003}',
								'    e',
								'  * f {id:005}',
								'    * g {id:006}',
								'      h'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge following first block of an item list and make second block a first one', () => {
						runTest( {
							input: [
								'* a[]',
								'  * b',
								'    b2',
								'    * c',
								'    * d',
								'      e'
							],
							expected: [
								'* a[]b',
								'  b2',
								'  * c {id:003}',
								'  * d {id:004}',
								'    e'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );
				} );
			} );

			describe( 'non-collapsed selection starting in first block of a list item', () => {
				describe( 'first position in empty block', () => {
					it( 'should merge two empty list items', () => {
						runTest( {
							input: [
								'a',
								'* [',
								'* ]'
							],
							expected: [
								'a',
								'* []'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge non empty list item', () => {
						runTest( {
							input: [
								'* [',
								'* ]text'
							],
							expected: [
								'* []text{id:001}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge non empty list item and delete text', () => {
						runTest( {
							input: [
								'* [',
								'* te]xt'
							],
							expected: [
								'* []xt{id:001}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge and adjust indentation of child list item when end selection is at the beginning of item', () => {
						runTest( {
							input: [
								'* [',
								'* a',
								'  * ]b'
							],
							expected: [
								'* []',
								'* b {id:002}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge and adjust indentation of child list items', () => {
						runTest( {
							input: [
								'* [',
								'* a',
								'  * b]c',
								'    * d'
							],
							expected: [
								'* []c{id:002}',
								'  * d{id:003}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge and adjust indentation of child list items when selection at the end of an item', () => {
						runTest( {
							input: [
								'* [',
								'* a',
								'  * bc]',
								'    * d'
							],
							expected: [
								'* []{id:000}',
								'  * d{id:003}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should delete all items till the end of selection and merge last list item', () => {
						runTest( {
							input: [
								'* [',
								'* a',
								'  * b',
								'* ]d'
							],
							expected: [
								'* []',
								'* d {id:003}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should delete all items and text till the end of selection and merge last list item', () => {
						runTest( {
							input: [
								'* [',
								'* a',
								'  * b',
								'* d]e'
							],
							expected: [
								'* []e{id:003}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );
				} );

				describe( 'first position in non-empty block', () => {
					it( 'should merge two list items', () => {
						runTest( {
							input: [
								'* [text',
								'* ano]ther'
							],
							expected: [
								'* []ther{id:001}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge two list items if selection starts in the middle of text', () => {
						runTest( {
							input: [
								'* te[xt',
								'* ano]ther'
							],
							expected: [
								'* te[]ther'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge non empty list item', () => {
						runTest( {
							input: [
								'* text[',
								'* ]another'
							],
							expected: [
								'* text[]another'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge non empty list item and delete text', () => {
						runTest( {
							input: [
								'* text[',
								'* ano]ther'
							],
							expected: [
								'* text[]ther'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge and adjust indentation of child list item when end selection is at the beginning of item', () => {
						runTest( {
							input: [
								'* text[',
								'* a',
								'  * ]b',
								'    * c'
							],
							expected: [
								'* text[]',
								'* b {id:002}',
								'  * c {id:003}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge and adjust indentation of child list items', () => {
						runTest( {
							input: [
								'* text[',
								'* a',
								'  * b]c',
								'    * d'
							],
							expected: [
								'* text[]c',
								'  * d {id:003}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge and adjust indentation of child list items when selection at the end of an item', () => {
						runTest( {
							input: [
								'* text[',
								'* a',
								'  * bc]',
								'    * d'
							],
							expected: [
								'* text[] {id:000}',
								'  * d {id:003}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should delete all items till the end of selection and merge last list item', () => {
						runTest( {
							input: [
								'* text[',
								'* a',
								'  * b',
								'* ]d'
							],
							expected: [
								'* text[]',
								'* d {id:003}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should delete all items and text till the end of selection and merge last list item', () => {
						runTest( {
							input: [
								'* text[',
								'* a',
								'  * b',
								'* d]e'
							],
							expected: [
								'* text[]e'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );
				} );
			} );
		} );

		describe( 'multi-block list item', () => {
			describe( 'collapsed selection at the end of a list item', () => {
				describe( 'item after is empty', () => {
					it( 'should remove empty list item', () => {
						runTest( {
							input: [
								'* a',
								'  b[]',
								'* '
							],
							expected: [
								'* a',
								'  b[]'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it.skip( 'should merge following complex list item with current one', () => {
						runTest( {
							input: [
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
							],
							expected: [
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
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge and remove block of same list item', () => {
						runTest( {
							input: [
								'* []',
								'  a'
							],
							expected: [
								'* []a'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge indented list item with with currently selected list item', () => {
						runTest( {
							input: [
								'* []',
								'  * a',
								'    b'
							],
							expected: [
								'* []a{id:001}',
								'  b'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge indented list having block and indented list item with previous empty list item', () => {
						runTest( {
							input: [
								'* []',
								'  * a',
								'    b',
								'    * c'
							],
							expected: [
								'* []a {id:001}',
								'  b',
								'  * c {id:003}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge indented list item with first block empty', () => {
						runTest( {
							input: [
								'* []',
								'  * ',
								'    text'
							],
							expected: [
								'* []',
								'  text'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge next outdented list item', () => {
						runTest( {
							input: [
								'* ',
								'  * []',
								'* a',
								'  b'
							],
							expected: [
								'* ',
								'  * []a {id:002}',
								'    b'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge next outdented list item with first block empty', () => {
						runTest( {
							input: [
								'* ',
								'  * []',
								'* ',
								'  text'
							],
							expected: [
								'* ',
								'  * []',
								'    text'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );
				} );

				describe( 'list item after is not empty', () => {
					it( 'should merge with previous list item and keep blocks intact', () => {
						runTest( {
							input: [
								'* a[]',
								'* b',
								'  c'
							],
							expected: [
								'* a[]b',
								'  c'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge all following outdented blocks', () => {
						runTest( {
							input: [
								'* b',
								'  * c',
								'    c2[]',
								'  d',
								'  e'
							],
							expected: [
								'* b',
								'  * c',
								'    c2[]d',
								'    e'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge complex list item', () => {
						runTest( {
							input: [
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
							],
							expected: [
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
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge list item with next multi-block list item', () => {
						runTest( {
							input: [
								'* a',
								'  a2[]',
								'* b',
								'  b2'
							],
							expected: [
								'* a',
								'  a2[]b',
								'  b2'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge outdented multi-block list item', () => {
						runTest( {
							input: [
								'* a',
								'  a2[]',
								'  * b',
								'    b2'
							],
							expected: [
								'* a',
								'  a2[]b',
								'  b2'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge an outdented list item in an outdented list item', () => {
						runTest( {
							input: [
								'* a',
								'  * b',
								'    c[]',
								'    * d'
							],
							expected: [
								'* a',
								'  * b',
								'    c[]d'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge indented empty list item', () => {
						runTest( {
							input: [
								'* a',
								'  * b',
								'    c[]',
								'    * '
							],
							expected: [
								'* a',
								'  * b',
								'    c[]'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge list item with with next outdented list item', () => {
						runTest( {
							input: [
								'* a',
								'  * b[]',
								'* c',
								'  d'
							],
							expected: [
								'* a',
								'  * b[]c',
								'    d'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );
				} );
			} );

			describe( 'collapsed selection in the middle of the list item', () => {
				it( 'should merge next indented list item', () => {
					runTest( {
						input: [
							'* A',
							'  * B',
							'  # C',
							'    # D',
							'    X[]',
							'    # Z',
							'    V',
							'* E',
							'* F'
						],
						expected: [
							'* A',
							'  * B',
							'  # C',
							'    # D',
							'    X[]Z',
							'    V',
							'* E {id:007}',
							'* F {id:008}'
						],
						eventStopped: true,
						executedCommands: {
							outdent: 0,
							splitAfter: 0,
							mergeBackward: 0,
							mergeForward: 1
						},
						changedBlocks: [ 1 ]
					} );
				} );
			} );

			describe( 'non-collapsed selection starting in first block of a list item', () => {
				describe( 'first position in empty block', () => {
					it( 'should merge two empty list items', () => {
						runTest( {
							input: [
								'* [',
								'* ]',
								'  '
							],
							expected: [
								'* []',
								'  '
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge non empty list item', () => {
						runTest( {
							input: [
								'* [',
								'* ]text'
							],
							expected: [
								'* []text {id:001}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge non empty list item and delete text', () => {
						runTest( {
							input: [
								'* [',
								'* te]xt'
							],
							expected: [
								'* []xt {id:001}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge and adjust indentation of child list item when end selection is at the beginning of item', () => {
						runTest( {
							input: [
								'* [',
								'* a',
								'  * ]b'
							],
							expected: [
								'* []',
								'* b {id:002}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge and adjust indentation of child list items', () => {
						runTest( {
							input: [
								'* [',
								'* a',
								'  * b]c',
								'    * d'
							],
							expected: [
								'* []c {id:002}',
								'  * d {id:003}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge and adjust indentation of child list items when selection at the end of an item', () => {
						runTest( {
							input: [
								'* [',
								'* a',
								'  * bc]',
								'    * d'
							],
							expected: [
								'* [] {id:000}',
								'  * d {id:003}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should delete all items till the end of selection and merge last list item', () => {
						runTest( {
							input: [
								'* [',
								'* a',
								'  * b',
								'* ]d'
							],
							expected: [
								'* []',
								'* d {id:003}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should delete all items and text till the end of selection and merge last list item', () => {
						runTest( {
							input: [
								'* [',
								'* a',
								'  * b',
								'* d]e'
							],
							expected: [
								'* []e{id:003}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should delete all following items till the end of selection and merge last list item', () => {
						runTest( {
							input: [
								'* [',
								'  text',
								'* a',
								'  * b',
								'* d]e'
							],
							expected: [
								'* []e {id:004}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should delete all following items till the end of selection and merge last list itemxx', () => {
						runTest( {
							input: [
								'* [',
								'  * b',
								'    ]c',
								'    * d',
								'      e'
							],
							expected: [
								'* []',
								'* c',
								'  * d {id:003}',
								'    e'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should delete items till the end of selection and merge middle block with following blocks', () => {
						runTest( {
							input: [
								'* [',
								'  * b',
								'    c]d',
								'    * e',
								'      f'
							],
							expected: [
								'* []d {id:001}',
								'  * e {id:003}',
								'    f'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should delete items till the end of selection and merge following blocks', () => {
						runTest( {
							input: [
								'* [',
								'  * b',
								'    cd]',
								'    * e',
								'      f',
								'    s'
							],
							expected: [
								'* []',
								'  * e {id:003}',
								'    f',
								'* s {id:001}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );
				} );

				describe( 'first position in non-empty block', () => {
					it( 'should merge two list items', () => {
						runTest( {
							input: [
								'* [text',
								'* ano]ther',
								'  text'
							],
							expected: [
								'* []ther {id:001}',
								'  text'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					// Not related to merge command
					it( 'should merge two list items with selection in the middle', () => {
						runTest( {
							input: [
								'* te[xt',
								'* ano]ther'
							],
							expected: [
								'* te[]ther'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge non empty list item', () => {
						runTest( {
							input: [
								'* [',
								'* ]text'
							],
							expected: [
								'* []text {id:001}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge non empty list item and delete text', () => {
						runTest( {
							input: [
								'* [',
								'* te]xt'
							],
							expected: [
								'* []xt{id:001}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge and adjust indentation of child list item when end selection is at the beginning of item', () => {
						runTest( {
							input: [
								'* [',
								'* a',
								'  * ]b',
								'    * c'
							],
							expected: [
								'* []',
								'* b {id:002}',
								'  * c {id:003}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge and adjust indentation of child list items', () => {
						runTest( {
							input: [
								'* [',
								'* a',
								'  * b]c',
								'    * d'
							],
							expected: [
								'* []c{id:002}',
								'  * d{id:003}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge and adjust indentation of child list items when selection at the end of an item', () => {
						runTest( {
							input: [
								'* [',
								'* a',
								'  * bc]',
								'    * d'
							],
							expected: [
								'* [] {id:000}',
								'  * d {id:003}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should delete all items till the end of selection and merge last list item', () => {
						runTest( {
							input: [
								'* [',
								'* a',
								'  * b',
								'* ]d'
							],
							expected: [
								'* []',
								'* d {id:003}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should delete all items and text till the end of selection and merge last list item', () => {
						runTest( {
							input: [
								'* [',
								'* a',
								'  * b',
								'* d]e'
							],
							expected: [
								'* []e{id:003}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should delete all items and text till the end of selection and adjust orphan elements', () => {
						runTest( {
							input: [
								'* [',
								'* a',
								'  * b]',
								'    c',
								'    * d',
								'      e',
								'  f',
								'  g'
							],
							expected: [
								'* []',
								'  c',
								'  * d {id:004}',
								'    e',
								'* f {id:001}',
								'  g'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							changedBlocks: [ 1 ]
						} );
					} );
				} );
			} );
		} );
	} );

	function runTest( { input, expected, eventStopped, executedCommands = {} } ) {
	// function runTest( { input, expected, eventStopped, executedCommands = {}, changedBlocks = [] } ) {
		setModelData( model, modelList( input ) );

		view.document.fire( eventInfo, domEventData );

		expect( getModelData( model ) ).to.equalMarkup( modelList( expected ) );

		if ( typeof eventStopped === 'object' ) {
			expect( domEventData.domEvent.preventDefault.callCount ).to.equal( eventStopped.preventDefault, 'preventDefault() call' );
			expect( eventInfo.stop.called ).to.equal( eventStopped.stop, 'eventInfo.stop() call' );
		} else {
			if ( eventStopped ) {
				expect( domEventData.domEvent.preventDefault.callCount ).to.equal( 1, 'preventDefault() call' );
				expect( eventInfo.stop.called ).to.equal( true, 'eventInfo.stop() call' );
			} else {
				expect( domEventData.domEvent.preventDefault.callCount ).to.equal( 0, 'preventDefault() call' );
				expect( eventInfo.stop.called ).to.equal( undefined, 'eventInfo.stop() call' );
			}
		}

		for ( const name in executedCommands ) {
			expect( commandSpies[ name ].callCount ).to.equal( executedCommands[ name ], `${ name } command call count` );
		}

		// TODO: Enable it once all commands return this info.
		// expect( blocksChangedByCommands.length ).to.equal( changedBlocks.length, 'changed blocks length' );
		// expect( blocksChangedByCommands.map( block => block.index ) ).to.deep.equal( changedBlocks ), 'changed blocks\' indexes' );
	}
} );
