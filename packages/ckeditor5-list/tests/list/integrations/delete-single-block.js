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

describe( 'ListEditing (multiBlock=false) integrations: backspace & delete', () => {
	const blocksChangedByCommands = [];

	let element;
	let editor, model, view;
	let eventInfo, domEventData;
	let splitAfterCommand, outdentCommand,
		commandSpies,
		splitAfterCommandExecuteSpy, outdentCommandExecuteSpy;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		editor = await ClassicTestEditor.create( element, {
			plugins: [
				ListEditing, Paragraph, Delete, Widget
			],
			list: {
				multiBlock: false
			}
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
		modelList.defaultBlock = 'listItem';

		eventInfo = new BubblingEventInfo( view.document, 'delete' );

		splitAfterCommand = editor.commands.get( 'splitListItemAfter' );
		outdentCommand = editor.commands.get( 'outdentList' );

		splitAfterCommandExecuteSpy = sinon.spy();
		outdentCommandExecuteSpy = sinon.spy();

		splitAfterCommand.on( 'execute', splitAfterCommandExecuteSpy );
		outdentCommand.on( 'execute', outdentCommandExecuteSpy );

		commandSpies = {
			outdent: outdentCommandExecuteSpy,
			splitAfter: splitAfterCommandExecuteSpy
		};

		blocksChangedByCommands.length = 0;

		outdentCommand.on( 'afterExecute', ( evt, data ) => {
			blocksChangedByCommands.push( ...data );
		} );

		splitAfterCommand.on( 'afterExecute', ( evt, data ) => {
			blocksChangedByCommands.push( ...data );
		} );
	} );

	afterEach( async () => {
		element.remove();
		modelList.defaultBlock = 'paragraph';

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
						splitAfter: 0
					}
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
								splitAfter: 0
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
								'* []a{id:002}'
							],
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
								'* a[]b'
							],
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
						} );
					} );

					it( 'should merge empty list item with with previous list item as a block', () => {
						runTest( {
							input: [
								'* a',
								'* []'
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
								splitAfter: 0
							}
						} );
					} );

					it( 'should merge indented list item with with parent list item as a block', () => {
						runTest( {
							input: [
								'* a',
								'  * []b'
							],
							expected: [
								'* a[]b'
							],
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
						} );
					} );

					it( 'should merge indented empty list item with with parent list item as a block', () => {
						runTest( {
							input: [
								'* a',
								'  * []'
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
								splitAfter: 0
							}
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
								'  * b[]c'
							],
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
								'  * b[]'
							],
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
						} );
					} );

					it( 'should keep merged list item\'s children', () => {
						runTest( {
							input: [
								'* a',
								'  * []b',
								'    * c',
								'    * d',
								'    * e',
								'      * f'
							],
							expected: [
								'* a[]b',
								'  * c {id:002}',
								'  * d {id:003}',
								'  * e {id:004}',
								'    * f {id:005}'
							],
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
								'* []a{id:002}'
							],
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
								'* a[]b'
							],
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
						} );
					} );

					it( 'should merge empty list item with with previous list item as a block', () => {
						runTest( {
							input: [
								'* a',
								'* []'
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
								splitAfter: 0
							}
						} );
					} );

					it( 'should merge indented list item with with parent list item as a block', () => {
						runTest( {
							input: [
								'* a',
								'  * []b'
							],
							expected: [
								'* a[]b'
							],
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
						} );
					} );

					it( 'should merge indented empty list item with with parent list item as a block', () => {
						runTest( {
							input: [
								'* a',
								'  * []'
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
								splitAfter: 0
							}
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
								'  * b[]c'
							],
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
								'  * b[]'
							],
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
						} );
					} );

					it( 'should keep merged list item\'s children', () => {
						runTest( {
							input: [
								'* a',
								'  * []b',
								'    * c',
								'    * d',
								'    * e',
								'      * f'
							],
							expected: [
								'* a[]b',
								'  * c {id:002}',
								'  * d {id:003}',
								'  * e {id:004}',
								'    * f {id:005}'
							],
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
								'  * b {id:002}'
							],
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
								'  * b {id:002}',
								'    * c {id:003}'
							],
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
						splitAfter: 0
					}
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
							splitAfter: 0
						}
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
							splitAfter: 0
						}
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
							splitAfter: 0
						}
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
							splitAfter: 0
						}
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
							splitAfter: 0
						}
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
							splitAfter: 0
						}
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
							splitAfter: 0
						}
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
							splitAfter: 0
						}
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
								splitAfter: 0
							}
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
								splitAfter: 0
							}
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
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
						} );
					} );

					it( 'should merge two lists into one and keep items after selection', () => {
						runTest( {
							input: [
								'* a[',
								'c',
								'* d',
								'  * e]e',
								'* f'
							],
							expected: [
								'* a[]e',
								'* f {id:004}'
							],
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
						splitAfter: 0
					}
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
								'[]'
							],
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
								'* []a{id:002}'
							],
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
						} );
					} );

					it( 'should merge following item list of first block and adjust it\'s children', () => {
						runTest( {
							input: [
								'* a[]',
								'  * b',
								'    * c',
								'    * d',
								'    * e',
								'      * f'
							],
							expected: [
								'* a[]b',
								'  * c {id:002}',
								'  * d {id:003}',
								'  * e {id:004}',
								'    * f {id:005}'
							],
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
								'  * b {id:002}'
							],
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
								'  * b {id:002}',
								'    * c {id:003}'
							],
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
						splitAfter: 0
					}
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
							splitAfter: 0
						}
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
							splitAfter: 0
						}
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
							splitAfter: 0
						}
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
							splitAfter: 0
						}
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
							splitAfter: 0
						}
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
							splitAfter: 0
						}
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
								splitAfter: 0
							}
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
								splitAfter: 0
							}
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
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
								'* c {id:a00}'
							],
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
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
							eventStopped: {
								preventDefault: true,
								stop: false
							},
							executedCommands: {
								outdent: 0,
								splitAfter: 0
							}
						} );
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
