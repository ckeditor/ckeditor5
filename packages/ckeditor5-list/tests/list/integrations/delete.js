/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ListEditing from '../../../src/list/listediting.js';

import Delete from '@ckeditor/ckeditor5-typing/src/delete.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Widget from '@ckeditor/ckeditor5-widget/src/widget.js';
import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import {
	getData as getModelData,
	setData as setModelData
} from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { DomEventData } from '@ckeditor/ckeditor5-engine';

import stubUid from '../_utils/uid.js';
import { modelList } from '../_utils/utils.js';
import BubblingEventInfo from '@ckeditor/ckeditor5-engine/src/view/observer/bubblingeventinfo.js';

describe( 'ListEditing integrations: backspace & delete', () => {
	const blocksChangedByCommands = [];

	let element;
	let editor, model, view;
	let eventInfo, domEventData;
	let mergeBackwardCommand, mergeForwardCommand, splitAfterCommand, outdentCommand,
		commandSpies,
		mergeBackwardCommandExecuteSpy, mergeForwardCommandExecuteSpy, splitAfterCommandExecuteSpy, outdentCommandExecuteSpy;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		editor = await ClassicTestEditor.create( element, {
			plugins: [
				ListEditing, Paragraph, Delete, Widget
			]
		} );

		model = editor.model;
		view = editor.editing.view;

		model.schema.extend( 'paragraph', {
			allowAttributes: 'foo'
		} );

		model.schema.register( 'blockWidget', {
			isObject: true,
			isBlock: true,
			allowIn: '$root',
			allowAttributesOf: '$container'
		} );

		editor.conversion.for( 'downcast' ).elementToElement( {
			model: 'blockWidget',
			view: ( modelItem, { writer } ) => {
				return toWidget( writer.createContainerElement( 'blockwidget', { class: 'block-widget' } ), writer );
			}
		} );

		editor.model.schema.register( 'inlineWidget', {
			isObject: true,
			isInline: true,
			allowWhere: '$text',
			allowAttributesOf: '$text'
		} );

		// The view element has no children.
		editor.conversion.for( 'downcast' ).elementToElement( {
			model: 'inlineWidget',
			view: ( modelItem, { writer } ) => toWidget(
				writer.createContainerElement( 'inlinewidget', { class: 'inline-widget' } ), writer, { label: 'inline widget' }
			)
		} );

		stubUid();

		eventInfo = new BubblingEventInfo( view.document, 'delete' );

		splitAfterCommand = editor.commands.get( 'splitListItemAfter' );
		outdentCommand = editor.commands.get( 'outdentList' );
		mergeBackwardCommand = editor.commands.get( 'mergeListItemBackward' );
		mergeForwardCommand = editor.commands.get( 'mergeListItemForward' );

		splitAfterCommandExecuteSpy = sinon.spy();
		outdentCommandExecuteSpy = sinon.spy();
		mergeBackwardCommandExecuteSpy = sinon.spy();
		mergeForwardCommandExecuteSpy = sinon.spy();

		splitAfterCommand.on( 'execute', splitAfterCommandExecuteSpy );
		outdentCommand.on( 'execute', outdentCommandExecuteSpy );
		mergeBackwardCommand.on( 'execute', mergeBackwardCommandExecuteSpy );
		mergeForwardCommand.on( 'execute', mergeForwardCommandExecuteSpy );

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
		element.remove();

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
			it( 'should not engage when the selection is in the middle of a text', () => {
				runTest( {
					input: [
						'* a[]b'
					],
					expected: [
						'* []b'
					],
					eventStopped: {
						preventDefault: true,
						stop: false
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
							changedBlocks: [ 0 ]
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
							changedBlocks: [ 0 ]
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
							changedBlocks: [ 0 ]
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
							changedBlocks: [ 1 ]
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
							changedBlocks: [ 1 ]
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
							changedBlocks: [ 0 ]
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
							changedBlocks: [ 0 ]
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
							changedBlocks: [ 0 ]
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
							changedBlocks: [ 1 ]
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
							changedBlocks: [ 1 ]
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
							changedBlocks: [ 0 ]
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
							changedBlocks: [ 0 ]
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
							changedBlocks: [ 0, 1 ]
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
							changedBlocks: [ 0, 1 ]
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
							changedBlocks: [ 0, 1 ]
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
							changedBlocks: [ 0 ]
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
							changedBlocks: [ 0 ]
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
							changedBlocks: [ 0 ]
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
							changedBlocks: [ 0 ]
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
							changedBlocks: [ 0 ]
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
							changedBlocks: [ 0 ]
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
							changedBlocks: [ 0, 1, 2 ]
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
							changedBlocks: [ 0, 1 ]
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
							changedBlocks: [ 0, 1 ]
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
							changedBlocks: [ 0 ]
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
							changedBlocks: [ 0 ]
						} );
					} );
				} );
			} );
		} );

		describe( 'multi-block list item', () => {
			describe( 'collapsed selection at the beginning of a list item', () => {
				describe( 'no item before', () => {
					it( 'should split the list item and then outdent if selection anchored in a first empty of many blocks', () => {
						runTest( {
							input: [
								'* []',
								'  a',
								'  b'
							],
							expected: [
								'[]',
								'* a {id:a00}',
								'  b'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 1,
								splitAfter: 1,
								mergeBackward: 0,
								mergeForward: 0
							},
							changedBlocks: [ 1, 2, 0 ]
						} );
					} );
				} );

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
							changedBlocks: [ 0, 1 ]
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
								'      k',
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
								'      k',
								'  l'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 1,
								mergeForward: 0
							},
							changedBlocks: [ 0, 1, 10 ]
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
							changedBlocks: [ 0, 1 ]
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
							changedBlocks: [ 0, 1 ]
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
							changedBlocks: [ 0, 1, 2 ]
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
							changedBlocks: [ 0, 1 ]
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
							changedBlocks: [ 1, 2 ]
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
							changedBlocks: [ 1, 2 ]
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
							changedBlocks: [ 1, 2 ]
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
							changedBlocks: [ 2 ]
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
							changedBlocks: [ 1, 2, 11 ]
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
							changedBlocks: [ 1, 2 ]
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
							changedBlocks: [ 1, 2 ]
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
							changedBlocks: [ 1, 2, 3 ]
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
							changedBlocks: [ 1, 2 ]
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
							changedBlocks: [ 2, 3 ]
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
						changedBlocks: [ 4, 5 ]
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
							changedBlocks: [ 0, 1 ]
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
							changedBlocks: [ 0 ]
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
							changedBlocks: [ 0 ]
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
							changedBlocks: [ 0, 1 ]
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
							changedBlocks: [ 0, 1 ]
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
							changedBlocks: [ 0, 1 ]
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
							changedBlocks: [ 0 ]
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
							changedBlocks: [ 0 ]
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
							changedBlocks: [ 0 ]
						} );
					} );

					it( 'should delete all following items till the end of selection and merge last list itemx', () => {
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
							changedBlocks: [ 0, 1, 2, 3 ]
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
							changedBlocks: [ 0, 1, 2 ]
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
							changedBlocks: [ 0, 1, 2, 3 ]
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
							changedBlocks: [ 0, 1 ]
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
							changedBlocks: [ 0 ]
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
							changedBlocks: [ 0 ]
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
							changedBlocks: [ 0 ]
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
							changedBlocks: [ 0, 1, 2 ]
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
							changedBlocks: [ 0, 1 ]
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
							changedBlocks: [ 0, 1 ]
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
							changedBlocks: [ 0 ]
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
							changedBlocks: [ 0 ]
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
							changedBlocks: [ 0, 1, 2, 3 ]
						} );
					} );
				} );
			} );
		} );

		describe( 'selection outside list', () => {
			it( 'should not engage for a <li> that is not a document list item', () => {
				model.schema.register( 'thirdPartyListItem', { inheritAllFrom: '$block' } );

				editor.conversion.for( 'downcast' ).elementToElement( {
					model: 'thirdPartyListItem',
					view: ( modelItem, { writer } ) => writer.createContainerElement( 'li' )
				} );

				runTest( {
					input: [
						'<thirdPartyListItem>a</thirdPartyListItem>',
						'<thirdPartyListItem>[]b</thirdPartyListItem>'
					],
					expected: [
						'<thirdPartyListItem>a[]b</thirdPartyListItem>'
					],
					eventStopped: {
						preventDefault: true,
						stop: false
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
							preventDefault: true,
							stop: false
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
							preventDefault: true,
							stop: false
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
							preventDefault: true,
							stop: false
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
							preventDefault: true,
							stop: false
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
							preventDefault: true,
							stop: false
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
							preventDefault: true,
							stop: false
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
							preventDefault: true,
							stop: false
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
							preventDefault: true,
							stop: false
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
								preventDefault: true,
								stop: false
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
								preventDefault: true,
								stop: false
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
								preventDefault: true,
								stop: false
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
								preventDefault: true,
								stop: false
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
								preventDefault: true,
								stop: false
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
							changedBlocks: [ 0 ]
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
							changedBlocks: [ 0, 1 ]
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
							// Note: Technically speaking "c" should also be included but wasn't; was fixed by model post-fixer.
							changedBlocks: [ 0 ]
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
							// Note: Technically speaking "c" and "d" should also be included but weren't; fixed by model post-fixer.
							changedBlocks: [ 0 ]
						} );
					} );

					it( 'should remove selection and adjust remaining list', () => {
						runTest( {
							input: [
								'a[',
								'* b]b',
								'  * c',
								'  d'
							],
							expected: [
								'a[]b',
								'* c {id:002}',
								'* d {id:001}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							// Note: Technically speaking "c" and "d" should also be included but weren't; fixed by model post-fixer.
							changedBlocks: [ 0 ]
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
							changedBlocks: [ 0, 1, 2 ]
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
							changedBlocks: [ 0 ]
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
							changedBlocks: [ 0 ]
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
							changedBlocks: [ 0, 1 ]
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
							changedBlocks: [ 0, 1, 2 ]
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
							changedBlocks: [ 1, 2 ]
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
							changedBlocks: [ 0 ]
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

		describe( 'around widgets', () => {
			describe( 'block widgets', () => {
				it( 'should delete a paragraph and select a block widget in a list that precedes it', () => {
					runTest( {
						input: [
							'* <blockWidget></blockWidget>',
							'[]'
						],
						expected: [
							'* [<blockWidget></blockWidget>]'
						],
						eventStopped: true,
						executedCommands: {
							outdent: 0,
							splitAfter: 0,
							mergeBackward: 0,
							mergeForward: 0
						},
						changedBlocks: []
					} );
				} );

				it( 'should select a block widget in a list that precedes a non-empty paragraph', () => {
					runTest( {
						input: [
							'* <blockWidget></blockWidget>',
							'[]foo'
						],
						expected: [
							'* [<blockWidget></blockWidget>]',
							'foo'
						],
						eventStopped: true,
						executedCommands: {
							outdent: 0,
							splitAfter: 0,
							mergeBackward: 0,
							mergeForward: 0
						},
						changedBlocks: []
					} );
				} );

				it( 'should delete a paragraph and select a block widget at a deeper level (2nd block) in a list that precedes it', () => {
					runTest( {
						input: [
							'* a',
							'  <blockWidget></blockWidget>',
							'[]'
						],
						expected: [
							'* a',
							'  [<blockWidget></blockWidget>]'
						],
						eventStopped: true,
						executedCommands: {
							outdent: 0,
							splitAfter: 0,
							mergeBackward: 0,
							mergeForward: 0
						},
						changedBlocks: []
					} );
				} );

				it( 'should delete a paragraph and select a block widget at a deeper level (1st block) in a list that precedes it', () => {
					runTest( {
						input: [
							'* a',
							'  * <blockWidget></blockWidget>',
							'[]'
						],
						expected: [
							'* a',
							'  * [<blockWidget></blockWidget>]'
						],
						eventStopped: true,
						executedCommands: {
							outdent: 0,
							splitAfter: 0,
							mergeBackward: 0,
							mergeForward: 0
						},
						changedBlocks: []
					} );
				} );

				it( 'should merge an item into the previous one despite a block widget precededing it', () => {
					runTest( {
						input: [
							'* a',
							'  <blockWidget></blockWidget>',
							'* []'
						],
						expected: [
							'* a',
							'  <blockWidget></blockWidget>',
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

				it( 'should merge an item into the previous one despite a block widget precededing it at a deeper level', () => {
					runTest( {
						input: [
							'* a',
							'  * <blockWidget></blockWidget>',
							'* []'
						],
						expected: [
							'* a',
							'  * <blockWidget></blockWidget>',
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

				it( 'should merge an item into the previous one (down) despite a block widget precededing it at a lower level', () => {
					runTest( {
						input: [
							'* a',
							'  * <blockWidget></blockWidget>',
							'    * []'
						],
						expected: [
							'* a',
							'  * <blockWidget></blockWidget>',
							'    []'
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

				it( 'should delete an item block and select a block widget that precedes it', () => {
					runTest( {
						input: [
							'* a',
							'  b',
							'  <blockWidget></blockWidget>',
							'  []'
						],
						expected: [
							'* a',
							'  b',
							'  [<blockWidget></blockWidget>]'
						],
						eventStopped: true,
						executedCommands: {
							outdent: 0,
							splitAfter: 0,
							mergeBackward: 0,
							mergeForward: 0
						},
						changedBlocks: []
					} );
				} );

				it( 'should delete a block widget and keep the selection in the same item block', () => {
					runTest( {
						input: [
							'* a',
							'  [<blockWidget></blockWidget>]'
						],
						expected: [
							'* a',
							'  []'
						],
						eventStopped: {
							preventDefault: true,
							stop: false
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

				it( 'should delete a block widget and keep the selection in the same block (multiple blocks)', () => {
					runTest( {
						input: [
							'* a',
							'  [<blockWidget></blockWidget>]',
							'  b'
						],
						expected: [
							'* a',
							'  []',
							'  b'
						],
						eventStopped: {
							preventDefault: true,
							stop: false
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

				it( 'should delete a block widget and keep the selection in the same block (nested item follows)', () => {
					runTest( {
						input: [
							'* a',
							'  [<blockWidget></blockWidget>]',
							'  * b'
						],
						expected: [
							'* a',
							'  []',
							'  * b {id:002}'
						],
						eventStopped: {
							preventDefault: true,
							stop: false
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

				it( 'should delete a block widget and keep the selection in the same list item', () => {
					runTest( {
						input: [
							'* a',
							'  * [<blockWidget></blockWidget>]'
						],
						expected: [
							'* a',
							'  * []'
						],
						eventStopped: {
							preventDefault: true,
							stop: false
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

				it( 'should delete a block widget andkeep the selection in the same list item (multiple blocks)', () => {
					runTest( {
						input: [
							'* a',
							'  * [<blockWidget></blockWidget>]',
							'  b'
						],
						expected: [
							'* a',
							'  * []',
							'  b'
						],
						eventStopped: {
							preventDefault: true,
							stop: false
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

				it( 'should remove list when its entire cotent is selected (including a block widget), same indentation levels', () => {
					runTest( {
						input: [
							'* [a',
							'  <blockWidget></blockWidget>]'
						],
						expected: [
							'[]'
						],
						eventStopped: {
							preventDefault: true,
							stop: false
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

				it( 'should remove multiple list item blocks (including a block widget) within the selection, block follows', () => {
					runTest( {
						input: [
							'* [a',
							'  <blockWidget></blockWidget>]',
							'  b'
						],
						expected: [
							'* []',
							'  b'
						],
						eventStopped: {
							preventDefault: true,
							stop: false
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

				it( 'should remove multiple list item blocks (including a block widget) within the selection, nested block follows', () => {
					runTest( {
						input: [
							'* [a',
							'  <blockWidget></blockWidget>]',
							'  * b'
						],
						expected: [
							'* []',
							'  * b {id:002}'
						],
						eventStopped: {
							preventDefault: true,
							stop: false
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

				it( 'should remove list when its entire cotent is selected (including a block widget), mixed indentation levels', () => {
					runTest( {
						input: [
							'* [a',
							'  * <blockWidget></blockWidget>]'
						],
						expected: [
							'[]'
						],
						eventStopped: {
							preventDefault: true,
							stop: false
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

				it( 'should remove multiple list item blocks (including a block widget) within the selection, mixed indent levels', () => {
					runTest( {
						input: [
							'* [a',
							'  * <blockWidget></blockWidget>]',
							'  * b'
						],
						expected: [
							'* []',
							'  * b {id:002}'
						],
						eventStopped: {
							preventDefault: true,
							stop: false
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

				it( 'should remove multiple list item blocks (including a block widget) within the selection, ' +
				'mixed indent levels, following block', () => {
					runTest( {
						input: [
							'* [a',
							'  * <blockWidget></blockWidget>]',
							'  b'
						],
						expected: [
							'* []',
							'  b'
						],
						eventStopped: {
							preventDefault: true,
							stop: false
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

				it( 'should remove multiple list item blocks (including a block widget) within the selection, ' +
				'mixed indent levels, following block at a deeper level', () => {
					runTest( {
						input: [
							'* [a',
							'  * <blockWidget></blockWidget>]',
							'    b'
						],
						expected: [
							'* []',
							'  * b'
						],
						eventStopped: {
							preventDefault: true,
							stop: false
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

				it( 'should remove a block widget and keep the selection in the same block', () => {
					runTest( {
						input: [
							'* a<inlineWidget></inlineWidget>',
							'  [<blockWidget></blockWidget>]',
							'  <inlineWidget></inlineWidget>b'
						],
						expected: [
							'* a<inlineWidget></inlineWidget>',
							'  []',
							'  <inlineWidget></inlineWidget>b'
						],
						eventStopped: {
							preventDefault: true,
							stop: false
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

			describe( 'inline images', () => {
				it( 'should remove an inline widget if only content of a block', () => {
					runTest( {
						input: [
							'* <paragraph>[<inlineWidget></inlineWidget>]</paragraph>'
						],
						expected: [
							'* []'
						],
						eventStopped: {
							preventDefault: true,
							stop: false
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

				it( 'should merge a paragraph into preceding list containing an inline widget', () => {
					runTest( {
						input: [
							'* a<inlineWidget></inlineWidget>',
							'[]'
						],
						expected: [
							'* a<inlineWidget></inlineWidget>[]'
						],
						eventStopped: {
							preventDefault: true,
							stop: false
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

				it( 'should merge an empty list item into preceding list item containing an inline widget', () => {
					runTest( {
						input: [
							'* a<inlineWidget></inlineWidget>',
							'* []'
						],
						expected: [
							'* a<inlineWidget></inlineWidget>',
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

				it( 'should remove an inline widget in a list item block containing other content (before)', () => {
					runTest( {
						input: [
							'* a[<inlineWidget></inlineWidget>]'
						],
						expected: [
							'* a[]'
						],
						eventStopped: {
							preventDefault: true,
							stop: false
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

				it( 'should remove an inline widget in a list item block containing other content (after)', () => {
					runTest( {
						input: [
							'* [<inlineWidget></inlineWidget>]a'
						],
						expected: [
							'* []a'
						],
						eventStopped: {
							preventDefault: true,
							stop: false
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

				it( 'should remove an inline widget in a middle list item block', () => {
					runTest( {
						input: [
							'* a',
							'  <paragraph>[<inlineWidget></inlineWidget>]</paragraph>',
							'  b'
						],
						expected: [
							'* a',
							'  []',
							'  b'
						],
						eventStopped: {
							preventDefault: true,
							stop: false
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

				it( 'should remove an inline widget in a nested list item block', () => {
					runTest( {
						input: [
							'* a',
							'  * <paragraph>[<inlineWidget></inlineWidget>]</paragraph>',
							'  b'
						],
						expected: [
							'* a',
							'  * []',
							'  b'
						],
						eventStopped: {
							preventDefault: true,
							stop: false
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
			it( 'should not engage when the selection is in the middle of a text', () => {
				runTest( {
					input: [
						'* a[]b'
					],
					expected: [
						'* a[]'
					],
					eventStopped: {
						preventDefault: true,
						stop: false
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

			describe( 'collapsed selection at the end of a list item', () => {
				describe( 'item after is empty', () => {
					it( 'should not remove list when in empty only element of a list', () => {
						runTest( {
							input: [
								'* []'
							],
							expected: [
								'* []'
							],
							eventStopped: {
								preventDefault: true,
								stop: false
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
							changedBlocks: [ 0 ]
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
							changedBlocks: [ 0 ]
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
							changedBlocks: [ 0 ]
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
							changedBlocks: [ 0 ]
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
							changedBlocks: [ 0 ]
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
							changedBlocks: [ 0 ]
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
							changedBlocks: [ 0 ]
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
							changedBlocks: [ 0 ]
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
							changedBlocks: [ 0, 1, 2, 3, 4, 5, 6 ]
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
							changedBlocks: [ 0, 1, 2, 3, 4 ]
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
							changedBlocks: [ 0 ]
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
							changedBlocks: [ 0 ]
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
							changedBlocks: [ 0, 1 ]
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
							changedBlocks: [ 0, 1 ]
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
							changedBlocks: [ 0, 1 ]
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
							changedBlocks: [ 0 ]
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
							changedBlocks: [ 0 ]
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
							changedBlocks: [ 0 ]
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
							changedBlocks: [ 0 ]
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
							changedBlocks: [ 0 ]
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
							changedBlocks: [ 0 ]
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
							changedBlocks: [ 0, 1, 2 ]
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
							changedBlocks: [ 0, 1 ]
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
							changedBlocks: [ 0, 1 ]
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
							changedBlocks: [ 0 ]
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
							changedBlocks: [ 0 ]
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

					it( 'should merge following complex list item with current one', () => {
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
								'* []b {id:002}',
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
							changedBlocks: [ 1, 2, 11 ]
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
							eventStopped: {
								preventDefault: true,
								stop: false
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
							changedBlocks: [ 0, 1 ]
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
							changedBlocks: [ 0, 1, 2 ]
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
							changedBlocks: [ 0, 1 ]
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
							changedBlocks: [ 1, 2 ]
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
							changedBlocks: [ 1, 2 ]
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
							changedBlocks: [ 0, 1 ]
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
							changedBlocks: [ 2, 3 ]
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
							changedBlocks: [ 1, 2, 11 ]
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
							changedBlocks: [ 1, 2 ]
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
							changedBlocks: [ 1, 2 ]
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
							changedBlocks: [ 2 ]
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
							changedBlocks: [ 2 ]
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
							changedBlocks: [ 1, 2 ]
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
						changedBlocks: [ 4 ]
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
							changedBlocks: [ 0, 1 ]
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
							changedBlocks: [ 0 ]
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
							changedBlocks: [ 0 ]
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
							changedBlocks: [ 0, 1 ]
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
							changedBlocks: [ 0, 1 ]
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
							changedBlocks: [ 0, 1 ]
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
							changedBlocks: [ 0 ]
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
							changedBlocks: [ 0 ]
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
							changedBlocks: [ 0 ]
						} );
					} );

					it( 'should delete all following items till the end of selection and merge last list itemx', () => {
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
							changedBlocks: [ 0, 1, 2, 3 ]
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
							changedBlocks: [ 0, 1, 2 ]
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
							changedBlocks: [ 0, 1, 2, 3 ]
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
							changedBlocks: [ 0, 1 ]
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
							changedBlocks: [ 0 ]
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
							changedBlocks: [ 0 ]
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
							changedBlocks: [ 0 ]
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
							changedBlocks: [ 0, 1, 2 ]
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
							changedBlocks: [ 0, 1 ]
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
							changedBlocks: [ 0, 1 ]
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
							changedBlocks: [ 0 ]
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
							changedBlocks: [ 0 ]
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
							changedBlocks: [ 0, 1, 2, 3 ]
						} );
					} );
				} );
			} );
		} );

		describe( 'selection outside list', () => {
			it( 'should not engage for a <li> that is not a document list item', () => {
				model.schema.register( 'thirdPartyListItem', { inheritAllFrom: '$block' } );

				editor.conversion.for( 'downcast' ).elementToElement( {
					model: 'thirdPartyListItem',
					view: ( modelItem, { writer } ) => writer.createContainerElement( 'li' )
				} );

				runTest( {
					input: [
						'<thirdPartyListItem>a[]</thirdPartyListItem>',
						'<thirdPartyListItem>b</thirdPartyListItem>'
					],
					expected: [
						'<thirdPartyListItem>a[]b</thirdPartyListItem>'
					],
					eventStopped: {
						preventDefault: true,
						stop: false
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
							preventDefault: true,
							stop: false
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
							'[]ext'
						],
						eventStopped: {
							preventDefault: true,
							stop: false
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
							'text[]'
						],
						eventStopped: {
							preventDefault: true,
							stop: false
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
							'te[]t'
						],
						eventStopped: {
							preventDefault: true,
							stop: false
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
							'* 1',
							'[]2'
						],
						expected: [
							'* 1',
							'[]'
						],
						eventStopped: {
							preventDefault: true,
							stop: false
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
							'* 1',
							'2[]',
							'* '
						],
						expected: [
							'* 1',
							'2[]'
						],
						eventStopped: {
							preventDefault: true,
							stop: false
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
								preventDefault: true,
								stop: false
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
								preventDefault: true,
								stop: false
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
								preventDefault: true,
								stop: false
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
								preventDefault: true,
								stop: false
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
								preventDefault: true,
								stop: false
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
							changedBlocks: [ 0 ]
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
							changedBlocks: [ 0, 1 ]
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
							// Note: Technically speaking "c" should also be included but wasn't; was fixed by model post-fixer.
							changedBlocks: [ 0 ]
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
							// Note: Technically speaking "c" and "d" should also be included but weren't; fixed by model post-fixer.
							changedBlocks: [ 0 ]
						} );
					} );

					it( 'should remove selection and adjust remaining list', () => {
						runTest( {
							input: [
								'a[',
								'* b]b',
								'  * c',
								'  d'
							],
							expected: [
								'a[]b',
								'* c {id:002}',
								'* d {id:001}'
							],
							eventStopped: true,
							executedCommands: {
								outdent: 0,
								splitAfter: 0,
								mergeBackward: 0,
								mergeForward: 1
							},
							// Note: Technically speaking "c" and "d" should also be included but weren't; fixed by model post-fixer.
							changedBlocks: [ 0 ]
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
							changedBlocks: [ 0, 1, 2 ]
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
							changedBlocks: [ 0 ]
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
							changedBlocks: [ 0 ]
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
							changedBlocks: [ 0, 1 ]
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
							changedBlocks: [ 0, 1, 2 ]
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
							changedBlocks: [ 1, 2 ]
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
							changedBlocks: [ 0 ]
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

		describe( 'around widgets', () => {
			describe( 'block widgets', () => {
				it( 'should delete a paragraph and select a block widget in a list that follows it', () => {
					runTest( {
						input: [
							'[]',
							'* <blockWidget></blockWidget>'
						],
						expected: [
							'* [<blockWidget></blockWidget>] {id:001}'
						],
						eventStopped: true,
						executedCommands: {
							outdent: 0,
							splitAfter: 0,
							mergeBackward: 0,
							mergeForward: 0
						},
						changedBlocks: []
					} );
				} );

				it( 'should select a block widget in a list that follows a non-empty paragraph', () => {
					runTest( {
						input: [
							'foo[]',
							'* <blockWidget></blockWidget>'
						],
						expected: [
							'foo',
							'* [<blockWidget></blockWidget>]'
						],
						eventStopped: true,
						executedCommands: {
							outdent: 0,
							splitAfter: 0,
							mergeBackward: 0,
							mergeForward: 0
						},
						changedBlocks: []
					} );
				} );

				it( 'should delete a paragraph and select a block widget (1st block) in a list that follows it', () => {
					runTest( {
						input: [
							'[]',
							'* <blockWidget></blockWidget>',
							'  a'
						],
						expected: [
							'* [<blockWidget></blockWidget>] {id:001}',
							'  a'
						],
						eventStopped: true,
						executedCommands: {
							outdent: 0,
							splitAfter: 0,
							mergeBackward: 0,
							mergeForward: 0
						},
						changedBlocks: []
					} );
				} );

				it.skip( 'should merge an item into the next one despite a block widget following it', () => {
					runTest( {
						input: [
							'* []',
							'* <blockWidget></blockWidget>',
							'  a'
						],
						expected: [
							'* [<blockWidget></blockWidget>] {id:001}',
							'  a'
						],
						eventStopped: true,
						executedCommands: {
							outdent: 0,
							splitAfter: 0,
							mergeBackward: 0,
							mergeForward: 0
						},
						changedBlocks: []
					} );
				} );

				it.skip( 'should merge an item into the next one despite a block widget following it at a deeper level', () => {
					runTest( {
						input: [
							'* a',
							'* []',
							'  * <blockWidget></blockWidget>'
						],
						expected: [
							'* a',
							'  * [<blockWidget></blockWidget>] {id:002}'
						],
						eventStopped: true,
						executedCommands: {
							outdent: 0,
							splitAfter: 0,
							mergeBackward: 0,
							mergeForward: 0
						},
						changedBlocks: []
					} );
				} );

				it.skip( 'should merge an item into the next one despite a block widget following it at an even deeper level', () => {
					runTest( {
						input: [
							'* a',
							'  * []',
							'    * <blockWidget></blockWidget>'
						],
						expected: [
							'* a',
							'  * [<blockWidget></blockWidget>] {id:002}'
						],
						eventStopped: true,
						executedCommands: {
							outdent: 0,
							splitAfter: 0,
							mergeBackward: 0,
							mergeForward: 0
						},
						changedBlocks: []
					} );
				} );

				it( 'should delete an item block and select a block widget that follows it', () => {
					runTest( {
						input: [
							'* a',
							'  []',
							'  <blockWidget></blockWidget>',
							'  b'
						],
						expected: [
							'* a',
							'  [<blockWidget></blockWidget>]',
							'  b'
						],
						eventStopped: true,
						executedCommands: {
							outdent: 0,
							splitAfter: 0,
							mergeBackward: 0,
							mergeForward: 0
						},
						changedBlocks: []
					} );
				} );

				it.skip( 'should delete a block widget and move the selection to the list item block that follows it', () => {
					runTest( {
						input: [
							'* a',
							'  [<blockWidget></blockWidget>]'
						],
						expected: [
							'* a',
							'  []'
						],
						eventStopped: true,
						executedCommands: {
							outdent: 0,
							splitAfter: 0,
							mergeBackward: 0,
							mergeForward: 1
						},
						changedBlocks: []
					} );
				} );

				it.skip( 'should delete a block widget and move the selection to the block that follows it (multiple blocks)', () => {
					runTest( {
						input: [
							'* a',
							'  [<blockWidget></blockWidget>]',
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
							mergeBackward: 0,
							mergeForward: 1
						},
						changedBlocks: []
					} );
				} );

				it.skip( 'should delete a block widget and move the selection to the block that follows it (nested item follows)', () => {
					runTest( {
						input: [
							'* a',
							'  [<blockWidget></blockWidget>]',
							'  * b'
						],
						expected: [
							'* a',
							'  []',
							'  * b {id:002}'
						],
						eventStopped: true,
						executedCommands: {
							outdent: 0,
							splitAfter: 0,
							mergeBackward: 0,
							mergeForward: 1
						},
						changedBlocks: []
					} );
				} );

				it.skip( 'should delete a block widget and move the selection down to the (shallower) block that follows it', () => {
					runTest( {
						input: [
							'* a',
							'  * [<blockWidget></blockWidget>]'
						],
						expected: [
							'* a',
							'  * []'
						],
						eventStopped: true,
						executedCommands: {
							outdent: 0,
							splitAfter: 0,
							mergeBackward: 0,
							mergeForward: 1
						},
						changedBlocks: []
					} );
				} );

				it.skip( 'should delete a block widget and move the selection down to the block that follows it (multiple blocks)', () => {
					runTest( {
						input: [
							'* a',
							'  * [<blockWidget></blockWidget>]',
							'  b'
						],
						expected: [
							'* a',
							'  * []',
							'  b'
						],
						eventStopped: true,
						executedCommands: {
							outdent: 0,
							splitAfter: 0,
							mergeBackward: 0,
							mergeForward: 1
						},
						changedBlocks: []
					} );
				} );

				it( 'should remove list when its entire cotent is selected (including a block widget), same indentation levels', () => {
					runTest( {
						input: [
							'* [a',
							'  <blockWidget></blockWidget>]'
						],
						expected: [
							'[]'
						],
						eventStopped: {
							preventDefault: true,
							stop: false
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

				it( 'should remove multiple list item blocks (including a block widget) within the selection, block follows', () => {
					runTest( {
						input: [
							'* [a',
							'  <blockWidget></blockWidget>]',
							'  b'
						],
						expected: [
							'* []',
							'  b'
						],
						eventStopped: {
							preventDefault: true,
							stop: false
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

				it( 'should remove multiple list item blocks (including a block widget) within the selection, nested block follows', () => {
					runTest( {
						input: [
							'* [a',
							'  <blockWidget></blockWidget>]',
							'  * b'
						],
						expected: [
							'* []',
							'  * b {id:002}'
						],
						eventStopped: {
							preventDefault: true,
							stop: false
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

				it( 'should remove list when its entire cotent is selected (including a block widget), mixed indentation levels', () => {
					runTest( {
						input: [
							'* [a',
							'  * <blockWidget></blockWidget>]'
						],
						expected: [
							'[]'
						],
						eventStopped: {
							preventDefault: true,
							stop: false
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

				it( 'should remove multiple list item blocks (including a block widget) within the selection, mixed indent levels', () => {
					runTest( {
						input: [
							'* [a',
							'  * <blockWidget></blockWidget>]',
							'  * b'
						],
						expected: [
							'* []',
							'  * b {id:002}'
						],
						eventStopped: {
							preventDefault: true,
							stop: false
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

				it( 'should remove multiple list item blocks (including a block widget) within the selection, ' +
				'mixed indent levels, following block', () => {
					runTest( {
						input: [
							'* [a',
							'  * <blockWidget></blockWidget>]',
							'  b'
						],
						expected: [
							'* []',
							'  b'
						],
						eventStopped: {
							preventDefault: true,
							stop: false
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

				it( 'should remove multiple list item blocks (including a block widget) within the selection, ' +
				'mixed indent levels, following block at a deeper level', () => {
					runTest( {
						input: [
							'* [a',
							'  * <blockWidget></blockWidget>]',
							'    b'
						],
						expected: [
							'* []',
							'  * b'
						],
						eventStopped: {
							preventDefault: true,
							stop: false
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

				it( 'should remove a block widget surrounded by block containing inline images at boundaries', () => {
					runTest( {
						input: [
							'* a<inlineWidget></inlineWidget>',
							'  [<blockWidget></blockWidget>]',
							'  <inlineWidget></inlineWidget>b'
						],
						expected: [
							'* a<inlineWidget></inlineWidget>',
							'  []',
							'  <inlineWidget></inlineWidget>b'
						],
						eventStopped: {
							preventDefault: true,
							stop: false
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

				// #11346.
				it( 'should remove a widget that is a list item', () => {
					runTest( {
						input: [
							'* a',
							'* [<blockWidget></blockWidget>]',
							'* b'
						],
						expected: [
							'* a',
							'* []',
							'* b'
						],
						eventStopped: {
							preventDefault: true,
							stop: false
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

				// #11346.
				it( 'should remove a widget that is a list item in a nested structure', () => {
					runTest( {
						input: [
							'* a',
							'  * aa',
							'  * [<blockWidget></blockWidget>]',
							'  * ac',
							'* b'
						],
						expected: [
							'* a',
							'  * aa',
							'  * []',
							'  * ac',
							'* b'
						],
						eventStopped: {
							preventDefault: true,
							stop: false
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

			describe( 'inline images', () => {
				it( 'should remove an inline widget if only content of a block', () => {
					runTest( {
						input: [
							'* <paragraph>[<inlineWidget></inlineWidget>]</paragraph>'
						],
						expected: [
							'* []'
						],
						eventStopped: {
							preventDefault: true,
							stop: false
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

				it( 'should merge a paragraph into following list containing an inline widget', () => {
					runTest( {
						input: [
							'[]',
							'* a<inlineWidget></inlineWidget>'
						],
						expected: [
							'* []a<inlineWidget></inlineWidget> {id:001}'
						],
						eventStopped: {
							preventDefault: true,
							stop: false
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

				it( 'should merge an empty list item into following list item containing an inline widget', () => {
					runTest( {
						input: [
							'* []',
							'* a<inlineWidget></inlineWidget>'
						],
						expected: [
							'* []a<inlineWidget></inlineWidget> {id:001}'
						],
						eventStopped: true,
						executedCommands: {
							outdent: 0,
							splitAfter: 0,
							mergeBackward: 0,
							mergeForward: 1
						},
						changedBlocks: [ 0 ]
					} );
				} );

				it( 'should remove an inline widget in a list item block containing other content (before)', () => {
					runTest( {
						input: [
							'* a[<inlineWidget></inlineWidget>]'
						],
						expected: [
							'* a[]'
						],
						eventStopped: {
							preventDefault: true,
							stop: false
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

				it( 'should remove an inline widget in a list item block containing other content (after)', () => {
					runTest( {
						input: [
							'* [<inlineWidget></inlineWidget>]a'
						],
						expected: [
							'* []a'
						],
						eventStopped: {
							preventDefault: true,
							stop: false
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

				it( 'should remove an inline widget in a middle list item block', () => {
					runTest( {
						input: [
							'* a',
							'  <paragraph>[<inlineWidget></inlineWidget>]</paragraph>',
							'  b'
						],
						expected: [
							'* a',
							'  []',
							'  b'
						],
						eventStopped: {
							preventDefault: true,
							stop: false
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

				it( 'should remove an inline widget in a nested list item block', () => {
					runTest( {
						input: [
							'* a',
							'  * <paragraph>[<inlineWidget></inlineWidget>]</paragraph>',
							'  b'
						],
						expected: [
							'* a',
							'  * []',
							'  b'
						],
						eventStopped: {
							preventDefault: true,
							stop: false
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
		} );
	} );

	// @param {Iterable.<String>} input
	// @param {Iterable.<String>} expected
	// @param {Boolean|Object.<String,Boolean>} eventStopped Boolean when preventDefault() and stop() were called/not called together.
	// Object, when mixed behavior was expected.
	// @param {Object.<String,Number>} executedCommands Numbers of command executions.
	// @param {Array.<Number>} changedBlocks Indexes of changed blocks.
	function runTest( { input, expected, eventStopped, executedCommands = {}, changedBlocks = [] } ) {
		setModelData( model, modelList( input ) );

		view.document.fire( eventInfo, domEventData );

		expect( getModelData( model ) ).to.equalMarkup( modelList( expected ) );

		if ( typeof eventStopped === 'object' ) {
			expect( domEventData.domEvent.preventDefault.called ).to.equal( eventStopped.preventDefault, 'preventDefault() call' );
			expect( !!eventInfo.stop.called ).to.equal( eventStopped.stop, 'eventInfo.stop() call' );
		} else {
			expect( domEventData.domEvent.preventDefault.callCount ).to.equal( eventStopped ? 1 : 0, 'preventDefault() call' );
			expect( eventInfo.stop.called ).to.equal( eventStopped ? true : undefined, 'eventInfo.stop() call' );
		}

		for ( const name in executedCommands ) {
			expect( commandSpies[ name ].callCount ).to.equal( executedCommands[ name ], `${ name } command call count` );
		}

		expect( blocksChangedByCommands.map( block => block.index ) ).to.deep.equal( changedBlocks, 'changed blocks\' indexes' );
	}
} );
