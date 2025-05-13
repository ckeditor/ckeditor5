/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ListEditing from '../../../src/list/listediting.js';
import stubUid from '../_utils/uid.js';
import { modelList } from '../_utils/utils.js';

import IndentEditing from '@ckeditor/ckeditor5-indent/src/indentediting.js';
import BlockQuoteEditing from '@ckeditor/ckeditor5-block-quote/src/blockquoteediting.js';
import Table from '@ckeditor/ckeditor5-table/src/table.js';
import CodeBlockEditing from '@ckeditor/ckeditor5-code-block/src/codeblockediting.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import EventInfo from '@ckeditor/ckeditor5-utils/src/eventinfo.js';
import { Paragraph } from 'ckeditor5/src/paragraph.js';
import { modelTable } from '@ckeditor/ckeditor5-table/tests/_utils/utils.js';
import {
	getData as getModelData,
	setData as setModelData
} from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { DomEventData } from '@ckeditor/ckeditor5-engine';

describe( 'ListEditing integrations: tab key', () => {
	const blocksChangedByCommands = [];

	let element;
	let editor, model, view;
	let eventInfo, tabDomEventData, shiftTabDomEventData;
	let indentListcommand, outdentListcommand;
	let commandSpies;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		editor = await ClassicTestEditor.create( element, {
			plugins: [
				Paragraph, CodeBlockEditing, ListEditing, IndentEditing, BlockQuoteEditing, Table
			]
		} );

		model = editor.model;

		view = editor.editing.view;

		stubUid();

		eventInfo = new EventInfo( view.document, 'tab' );

		tabDomEventData = new DomEventData( view.document, {
			preventDefault: sinon.spy(),
			stopPropagation: sinon.spy()
		} );

		shiftTabDomEventData = new DomEventData( view.document, {
			preventDefault: sinon.spy(),
			stopPropagation: sinon.spy()
		}, { shiftKey: true } );

		indentListcommand = editor.commands.get( 'indentList' );
		outdentListcommand = editor.commands.get( 'outdentList' );

		commandSpies = {
			indentList: sinon.spy( indentListcommand, 'execute' ),
			outdentList: sinon.spy( outdentListcommand, 'execute' )
		};

		blocksChangedByCommands.length = 0;

		indentListcommand.on( 'afterExecute', ( evt, data ) => {
			blocksChangedByCommands.push( ...data );
		} );

		outdentListcommand.on( 'afterExecute', ( evt, data ) => {
			blocksChangedByCommands.push( ...data );
		} );
	} );

	afterEach( async () => {
		element.remove();

		await editor.destroy();
	} );

	describe( 'list tab key handling', () => {
		describe( 'collapsed selection', () => {
			it( 'shouldn\'t indent first list of a list', () => {
				runTest( {
					input: [
						'* A[]'
					],
					expected: [
						'* A[]'
					],
					domEventData: tabDomEventData,
					eventStopped: false,
					executedCommands: {
						outdentList: 0,
						indentList: 0
					},
					changedBlocks: [ ]
				} );
			} );

			it( 'shouldn\'t indent list item if proceeded by list item of lower indent', () => {
				runTest( {
					input: [
						'* A',
						'  * B[]'
					],
					expected: [
						'* A',
						'  * B[]'
					],
					domEventData: tabDomEventData,
					eventStopped: false,
					executedCommands: {
						outdentList: 0,
						indentList: 0
					},
					changedBlocks: [ ]
				} );
			} );

			it( 'shouldn\'t indent list item if proceeded by different item list type', () => {
				runTest( {
					input: [
						'* A',
						'# B[]'
					],
					expected: [
						'* A',
						'# B[]'
					],
					domEventData: tabDomEventData,
					eventStopped: false,
					executedCommands: {
						outdentList: 0,
						indentList: 0
					},
					changedBlocks: [ ]
				} );
			} );

			it( 'shouldn\'t indent list item if proceeded by a list item block of lower indent', () => {
				runTest( {
					input: [
						'* A',
						'  B',
						'  * C[]'
					],
					expected: [
						'* A',
						'  B',
						'  * C[]'
					],
					domEventData: tabDomEventData,
					eventStopped: false,
					executedCommands: {
						outdentList: 0,
						indentList: 0
					},
					changedBlocks: [ ]
				} );
			} );

			it( 'should indent list item if proceeded by list item with same indent', () => {
				runTest( {
					input: [
						'* A',
						'* B[]'
					],
					expected: [
						'* A',
						'  * B[]'
					],
					domEventData: tabDomEventData,
					eventStopped: true,
					executedCommands: {
						outdentList: 0,
						indentList: 1
					},
					changedBlocks: [ 1 ]
				} );
			} );

			it( 'should indent list item if proceeded by list item with higher indent', () => {
				runTest( {
					input: [
						'* A',
						'  * B',
						'* C[]'
					],
					expected: [
						'* A',
						'  * B',
						'  * C[]'
					],
					domEventData: tabDomEventData,
					eventStopped: true,
					executedCommands: {
						outdentList: 0,
						indentList: 1
					},
					changedBlocks: [ 2 ]
				} );
			} );

			it( 'should indent list item block', () => {
				runTest( {
					input: [
						'* A',
						'  B[]'
					],
					expected: [
						'* A',
						'  * B[] {id:a00}'
					],
					domEventData: tabDomEventData,
					eventStopped: true,
					executedCommands: {
						outdentList: 0,
						indentList: 1
					},
					changedBlocks: [ 1 ]
				} );
			} );

			it( 'should indent only selected list item block', () => {
				runTest( {
					input: [
						'* A',
						'  B[]',
						'  C'
					],
					expected: [
						'* A',
						'  * B[] {id:a00}',
						'  C'
					],
					domEventData: tabDomEventData,
					eventStopped: true,
					executedCommands: {
						outdentList: 0,
						indentList: 1
					},
					changedBlocks: [ 1 ]
				} );
			} );

			it( 'should indent list item with it\'s blocks', () => {
				runTest( {
					input: [
						'* A',
						'* B[]',
						'  C'
					],
					expected: [
						'* A',
						'  * B[]',
						'    C'
					],
					domEventData: tabDomEventData,
					eventStopped: true,
					executedCommands: {
						outdentList: 0,
						indentList: 1
					},
					changedBlocks: [ 1, 2 ]
				} );
			} );

			it( 'should indent list item with it\'s blocks and nested list items', () => {
				runTest( {
					input: [
						'* A',
						'* B[]',
						'  C',
						'  * D'
					],
					expected: [
						'* A',
						'  * B[]',
						'    C',
						'    * D'
					],
					domEventData: tabDomEventData,
					eventStopped: true,
					executedCommands: {
						outdentList: 0,
						indentList: 1
					},
					changedBlocks: [ 1, 2, 3 ]
				} );
			} );

			it( 'should indent list item with it\'s blocks and nested multi-block list items', () => {
				runTest( {
					input: [
						'* A',
						'* B[]',
						'  C',
						'  * D',
						'    E'
					],
					expected: [
						'* A',
						'  * B[]',
						'    C',
						'    * D',
						'      E'
					],
					domEventData: tabDomEventData,
					eventStopped: true,
					executedCommands: {
						outdentList: 0,
						indentList: 1
					},
					changedBlocks: [ 1, 2, 3, 4 ]
				} );
			} );
		} );

		describe( 'non-collapsed selection', () => {
			it( 'should indent all selected list items', () => {
				runTest( {
					input: [
						'* A',
						'* [B',
						'* C',
						'* D]'
					],
					expected: [
						'* A',
						'  * [B',
						'  * C',
						'  * D]'
					],
					domEventData: tabDomEventData,
					eventStopped: true,
					executedCommands: {
						outdentList: 0,
						indentList: 1
					},
					changedBlocks: [ 1, 2, 3 ]
				} );
			} );

			it( 'should indent all selected list items with blocks', () => {
				runTest( {
					input: [
						'* A',
						'* [B',
						'  C',
						'* D]'
					],
					expected: [
						'* A',
						'  * [B',
						'    C',
						'  * D]'
					],
					domEventData: tabDomEventData,
					eventStopped: true,
					executedCommands: {
						outdentList: 0,
						indentList: 1
					},
					changedBlocks: [ 1, 2, 3 ]
				} );
			} );

			it( 'should indent blocks to the same list item', () => {
				runTest( {
					input: [
						'* A',
						'  [B',
						'  C]'
					],
					expected: [
						'* A',
						'  * [B {id:a00}',
						'    C]'
					],
					domEventData: tabDomEventData,
					eventStopped: true,
					executedCommands: {
						outdentList: 0,
						indentList: 1
					},
					changedBlocks: [ 1, 2 ]
				} );
			} );

			it( 'should indent selection starts in the middle block of list item and spans multiple items', () => {
				runTest( {
					input: [
						'* 0',
						'* 1',
						'  [2',
						'* 3]',
						'  4'
					],
					expected: [
						'* 0',
						'  * 1',
						'    [2',
						'  * 3]',
						'    4'
					],
					domEventData: tabDomEventData,
					eventStopped: true,
					executedCommands: {
						outdentList: 0,
						indentList: 1
					},
					changedBlocks: [ 1, 2, 3, 4 ]
				} );
			} );

			it( 'shouldn\'t indent if at least one item cannot be indented (start of a list)', () => {
				runTest( {
					input: [
						'* [A',
						'  B',
						'  C]'
					],
					expected: [
						'* [A',
						'  B',
						'  C]'
					],
					domEventData: tabDomEventData,
					eventStopped: false,
					executedCommands: {
						outdentList: 0,
						indentList: 0
					},
					changedBlocks: [ ]
				} );
			} );

			it( 'shouldn\'t indent if at least one item cannot be indented (list item with max indent)', () => {
				runTest( {
					input: [
						'* A',
						'  * [B',
						'    C]'
					],
					expected: [
						'* A',
						'  * [B',
						'    C]'
					],
					domEventData: tabDomEventData,
					eventStopped: false,
					executedCommands: {
						outdentList: 0,
						indentList: 0
					},
					changedBlocks: [ ]
				} );
			} );
		} );
	} );

	describe( 'list tab + shift keys handling', () => {
		describe( 'collapsed selection', () => {
			it( 'document list listener should not capture event', () => {
				runTest( {
					input: [
						'A[]'
					],
					expected: [
						'A[]'
					],
					domEventData: shiftTabDomEventData,
					eventStopped: false,
					executedCommands: {
						outdentList: 0,
						indentList: 0
					},
					changedBlocks: [ ]
				} );
			} );

			it( 'should outdent list item and delete list', () => {
				runTest( {
					input: [
						'* A[]'
					],
					expected: [
						'A[]'
					],
					domEventData: shiftTabDomEventData,
					eventStopped: true,
					executedCommands: {
						outdentList: 1,
						indentList: 0
					},
					changedBlocks: [ 0 ]
				} );
			} );

			it( 'should outdent list item and make next item first in a list', () => {
				runTest( {
					input: [
						'* A[]',
						'* B'
					],
					expected: [
						'A[]',
						'* B'
					],
					domEventData: shiftTabDomEventData,
					eventStopped: true,
					executedCommands: {
						outdentList: 1,
						indentList: 0
					},
					changedBlocks: [ 0 ]
				} );
			} );

			it( 'should outdent list item and split list into two lists', () => {
				runTest( {
					input: [
						'* A',
						'* B[]',
						'* C'
					],
					expected: [
						'* A',
						'B[]',
						'* C'
					],
					domEventData: shiftTabDomEventData,
					eventStopped: true,
					executedCommands: {
						outdentList: 1,
						indentList: 0
					},
					changedBlocks: [ 1 ]
				} );
			} );

			it( 'should outdent list item, split list into two lists and fix indent', () => {
				runTest( {
					input: [
						'* A',
						'* B[]',
						'  * C'
					],
					expected: [
						'* A',
						'B[]',
						'* C'
					],
					domEventData: shiftTabDomEventData,
					eventStopped: true,
					executedCommands: {
						outdentList: 1,
						indentList: 0
					},
					changedBlocks: [ 1, 2 ]
				} );
			} );

			it( 'should outdent list item, split list into two lists and fix indent of multi-block list item', () => {
				runTest( {
					input: [
						'* A',
						'* B[]',
						'  * C',
						'    D',
						'    * E'
					],
					expected: [
						'* A',
						'B[]',
						'* C',
						'  D',
						'  * E'
					],
					domEventData: shiftTabDomEventData,
					eventStopped: true,
					executedCommands: {
						outdentList: 1,
						indentList: 0
					},
					changedBlocks: [ 1, 2, 3, 4 ]
				} );
			} );

			it( 'should outdent list item', () => {
				runTest( {
					input: [
						'* A',
						'  * B[]'
					],
					expected: [
						'* A',
						'* B[]'
					],
					domEventData: shiftTabDomEventData,
					eventStopped: true,
					executedCommands: {
						outdentList: 1,
						indentList: 0
					},
					changedBlocks: [ 1 ]
				} );
			} );

			it( 'should outdent other type of list item and take it out of list', () => {
				runTest( {
					input: [
						'* A',
						'# B[]'
					],
					expected: [
						'* A',
						'B[]'
					],
					domEventData: shiftTabDomEventData,
					eventStopped: true,
					executedCommands: {
						outdentList: 1,
						indentList: 0
					},
					changedBlocks: [ 1 ]
				} );
			} );

			it( 'should outdent child list item', () => {
				runTest( {
					input: [
						'* A',
						'  * B[]'
					],
					expected: [
						'* A',
						'* B[]'
					],
					domEventData: shiftTabDomEventData,
					eventStopped: true,
					executedCommands: {
						outdentList: 1,
						indentList: 0
					},
					changedBlocks: [ 1 ]
				} );
			} );

			it( 'should outdent child list item of multi-block list item', () => {
				runTest( {
					input: [
						'* A',
						'  B',
						'  * C[]'
					],
					expected: [
						'* A',
						'  B',
						'* C[]'
					],
					domEventData: shiftTabDomEventData,
					eventStopped: true,
					executedCommands: {
						outdentList: 1,
						indentList: 0
					},
					changedBlocks: [ 2 ]
				} );
			} );

			it( 'should outdent nth child list item', () => {
				runTest( {
					input: [
						'* A',
						'  * B',
						'  * C[]'
					],
					expected: [
						'* A',
						'  * B',
						'* C[]'
					],
					domEventData: shiftTabDomEventData,
					eventStopped: true,
					executedCommands: {
						outdentList: 1,
						indentList: 0
					},
					changedBlocks: [ 2 ]
				} );
			} );

			it( 'should outdent block to list item and keep following blocks', () => {
				runTest( {
					input: [
						'* A',
						'  B[]',
						'  C',
						'  D'
					],
					expected: [
						'* A',
						'* B[] {id:a00}',
						'  C',
						'  D'
					],
					domEventData: shiftTabDomEventData,
					eventStopped: true,
					executedCommands: {
						outdentList: 1,
						indentList: 0
					},
					changedBlocks: [ 1, 2, 3 ]
				} );
			} );

			it( 'should outdent list item which should inherit following list items on same indent', () => {
				runTest( {
					input: [
						'* A',
						'  * B[]',
						'  * C'
					],
					expected: [
						'* A',
						'* B[]',
						'  * C'
					],
					domEventData: shiftTabDomEventData,
					eventStopped: true,
					executedCommands: {
						outdentList: 1,
						indentList: 0
					},
					changedBlocks: [ 1 ]
				} );
			} );

			it( 'should outdent list out of list with blocks', () => {
				runTest( {
					input: [
						'* A',
						'* B[]',
						'  C'
					],
					expected: [
						'* A',
						'B[]',
						'C'
					],
					domEventData: shiftTabDomEventData,
					eventStopped: true,
					executedCommands: {
						outdentList: 1,
						indentList: 0
					},
					changedBlocks: [ 1, 2 ]
				} );
			} );

			it( 'should outdent list item out of list with blocks and fix remaining list items indent', () => {
				runTest( {
					input: [
						'* A',
						'* B[]',
						'  C',
						'  * D',
						'    E'
					],
					expected: [
						'* A',
						'B[]',
						'C',
						'* D',
						'  E'
					],
					domEventData: shiftTabDomEventData,
					eventStopped: true,
					executedCommands: {
						outdentList: 1,
						indentList: 0
					},
					changedBlocks: [ 1, 2, 3, 4 ]
				} );
			} );
		} );

		describe( 'non-collapsed selection', () => {
			it( 'should outdent if selection is below list', () => {
				runTest( {
					input: [
						'* [A',
						'* B',
						'text]'
					],
					expected: [
						'[A',
						'B',
						'text]'
					],
					domEventData: shiftTabDomEventData,
					eventStopped: true,
					executedCommands: {
						outdentList: 1,
						indentList: 0
					},
					changedBlocks: [ 0, 1 ]
				} );
			} );

			it( 'should not outdent if selection is above list', () => {
				runTest( {
					input: [
						'[text',
						'* A',
						'* B]'
					],
					expected: [
						'[text',
						'* A',
						'* B]'
					],
					domEventData: shiftTabDomEventData,
					eventStopped: false,
					executedCommands: {
						outdentList: 0,
						indentList: 0
					},
					changedBlocks: [ ]
				} );
			} );

			it( 'should not outdent if selection spans many lists', () => {
				runTest( {
					input: [
						'* [A',
						'text',
						'* B]'
					],
					expected: [
						'[A',
						'text',
						'* B]'
					],
					domEventData: shiftTabDomEventData,
					eventStopped: true,
					executedCommands: {
						outdentList: 1,
						indentList: 0
					},
					changedBlocks: [ 0 ]
				} );
			} );

			it( 'should outdent flat list', () => {
				runTest( {
					input: [
						'* [A',
						'* B',
						'* C]'
					],
					expected: [
						'[A',
						'B',
						'C]'
					],
					domEventData: shiftTabDomEventData,
					eventStopped: true,
					executedCommands: {
						outdentList: 1,
						indentList: 0
					},
					changedBlocks: [ 0, 1, 2 ]
				} );
			} );

			it( 'should outdent nested list', () => {
				runTest( {
					input: [
						'* [A',
						'  * B',
						'* C',
						'* D]'
					],
					expected: [
						'[A',
						'* B',
						'C',
						'D]'
					],
					domEventData: shiftTabDomEventData,
					eventStopped: true,
					executedCommands: {
						outdentList: 1,
						indentList: 0
					},
					changedBlocks: [ 0, 1, 2, 3 ]
				} );
			} );

			it( 'should outdent multi-block list', () => {
				runTest( {
					input: [
						'* [A',
						'  B',
						'* C',
						'  * D',
						'* E',
						'  F]'
					],
					expected: [
						'[A',
						'B',
						'C',
						'* D',
						'E',
						'F]'
					],
					domEventData: shiftTabDomEventData,
					eventStopped: true,
					executedCommands: {
						outdentList: 1,
						indentList: 0
					},
					changedBlocks: [ 0, 1, 2, 3, 4, 5 ]
				} );
			} );

			it( 'should outdenst list item nested items', () => {
				runTest( {
					input: [
						'* A',
						'  * [B',
						'    * C]'
					],
					expected: [
						'* A',
						'* [B',
						'  * C]'
					],
					domEventData: shiftTabDomEventData,
					eventStopped: true,
					executedCommands: {
						outdentList: 1,
						indentList: 0
					},
					changedBlocks: [ 1, 2 ]
				} );
			} );

			it( 'should outdent item blocks to seperate list item', () => {
				runTest( {
					input: [
						'* A',
						'  [B',
						'  C]'
					],
					expected: [
						'* A',
						'* [B {id:a00}',
						'  C]'
					],
					domEventData: shiftTabDomEventData,
					eventStopped: true,
					executedCommands: {
						outdentList: 1,
						indentList: 0
					},
					changedBlocks: [ 1, 2 ]
				} );
			} );

			it( 'should outdent list item, nestesd list item and a block', () => {
				runTest( {
					input: [
						'* A',
						'  * [B',
						'  C]'
					],
					expected: [
						'A',
						'* [B',
						'C]'
					],
					domEventData: shiftTabDomEventData,
					eventStopped: true,
					executedCommands: {
						outdentList: 1,
						indentList: 0
					},
					changedBlocks: [ 0, 1, 2 ]
				} );
			} );
		} );
	} );

	describe( 'code block integration with list', () => {
		beforeEach( () => {
			const indentCodeBlockCommand = editor.commands.get( 'indentCodeBlock' );
			const outdentCodeBlockcommand = editor.commands.get( 'outdentCodeBlock' );

			commandSpies.indentCodeBlock = sinon.spy( indentCodeBlockCommand, 'execute' );
			commandSpies.outdentCodeBlock = sinon.spy( outdentCodeBlockcommand, 'execute' );
		} );

		describe( 'tab key handling', () => {
			it( 'should indent code block when in a list item that cannot be indented', () => {
				runTest( {
					input: [
						'* <codeBlock language="language-plaintext">[]foo</codeBlock>'
					],
					expected: [
						'* <codeBlock language="language-plaintext">	[]foo</codeBlock>'
					],
					domEventData: tabDomEventData,
					eventStopped: true,
					executedCommands: {
						outdentList: 0,
						indentList: 0,
						outdentCodeBlock: 0,
						indentCodeBlock: 1
					},
					changedBlocks: [ ]
				} );
			} );

			it( 'should indent code block when in a list item that can be indented', () => {
				runTest( {
					input: [
						'* foo',
						'* <codeBlock language="language-plaintext">[]bar</codeBlock>'
					],
					expected: [
						'* foo',
						'* <codeBlock language="language-plaintext">	[]bar</codeBlock>'
					],
					domEventData: tabDomEventData,
					eventStopped: true,
					executedCommands: {
						outdentList: 0,
						indentList: 0,
						outdentCodeBlock: 0,
						indentCodeBlock: 1
					},
					changedBlocks: [ ]
				} );
			} );

			it( 'should indent a code block when in a list item block', () => {
				runTest( {
					input: [
						'* foo',
						'  <codeBlock language="language-plaintext">[]foo</codeBlock>'
					],
					expected: [
						'* foo',
						'  <codeBlock language="language-plaintext">	[]foo</codeBlock>'
					],
					domEventData: tabDomEventData,
					eventStopped: true,
					executedCommands: {
						outdentList: 0,
						indentList: 0,
						outdentCodeBlock: 0,
						indentCodeBlock: 1
					},
					changedBlocks: [ ]
				} );
			} );

			it( 'should not indent a code block when multiple items are selected', () => {
				runTest( {
					input: [
						'* f[oo',
						'  <codeBlock language="language-plaintext">foo</codeBlock>',
						'* ba]r'
					],
					expected: [
						'* f[oo',
						'  <codeBlock language="language-plaintext">foo</codeBlock>',
						'* ba]r'
					],
					domEventData: tabDomEventData,
					eventStopped: false,
					executedCommands: {
						outdentList: 0,
						indentList: 0,
						outdentCodeBlock: 0,
						indentCodeBlock: 0
					},
					changedBlocks: [ ]
				} );
			} );

			it( 'should indent list items when selection spans code block in the middle', () => {
				runTest( {
					input: [
						'* foo',
						'* b[ar',
						'  <codeBlock language="language-plaintext">foo</codeBlock>',
						'* ya]r'
					],
					expected: [
						'* foo',
						'  * b[ar',
						'    <codeBlock language="language-plaintext">foo</codeBlock>',
						'  * ya]r'
					],
					domEventData: tabDomEventData,
					eventStopped: true,
					executedCommands: {
						outdentList: 0,
						indentList: 1,
						outdentCodeBlock: 0,
						indentCodeBlock: 0
					},
					changedBlocks: [ 1, 2, 3 ]
				} );
			} );

			it( 'should indent list item when selection starts above and ends at codeblock', () => {
				runTest( {
					input: [
						'* foo',
						'* b[ar',
						'  <codeBlock language="language-plaintext">fo]o</codeBlock>'
					],
					expected: [
						'* foo',
						'  * b[ar {id:001}',
						'    <codeBlock language="language-plaintext">fo]o</codeBlock>'
					],
					domEventData: tabDomEventData,
					eventStopped: true,
					executedCommands: {
						outdentList: 0,
						indentList: 1,
						outdentCodeBlock: 0,
						indentCodeBlock: 0
					},
					changedBlocks: [ 1, 2 ]
				} );
			} );

			it( 'should indent code block when selection starts at code block and ends below', () => {
				runTest( {
					input: [
						'* foo',
						'* <codeBlock language="language-plaintext">ba[r</codeBlock>',
						'* yar]'
					],
					expected: [
						'* foo',
						'* <codeBlock language="language-plaintext">	ba[r</codeBlock>',
						'* yar]'
					],
					domEventData: tabDomEventData,
					eventStopped: true,
					executedCommands: {
						outdentList: 0,
						indentList: 0,
						outdentCodeBlock: 0,
						indentCodeBlock: 1
					},
					changedBlocks: [ ]
				} );
			} );

			it( 'should indent code block when selection starts at code block and ends outside list', () => {
				runTest( {
					input: [
						'* foo',
						'* <codeBlock language="language-plaintext">ba[r</codeBlock>',
						'* yar',
						'tar]'
					],
					expected: [
						'* foo',
						'* <codeBlock language="language-plaintext">	ba[r</codeBlock>',
						'* yar',
						'tar]'
					],
					domEventData: tabDomEventData,
					eventStopped: true,
					executedCommands: {
						outdentList: 0,
						indentList: 0,
						outdentCodeBlock: 0,
						indentCodeBlock: 1
					},
					changedBlocks: [ ]
				} );
			} );
		} );

		describe( 'tab + shift keys handling', () => {
			it( 'should outdent code block', () => {
				const customSetModelData = () => {
					setModelData(
						model,
						modelList( [
							'* <codeBlock language="language-plaintext">[]foo</codeBlock>'
						] ) );

					model.change( writer => {
						writer.insertText( '	', model.document.getRoot().getChild( 0 ) );
					} );
				};

				runTest( {
					expected: [
						'* <codeBlock language="language-plaintext">[]foo</codeBlock>'
					],
					domEventData: shiftTabDomEventData,
					eventStopped: true,
					executedCommands: {
						outdentList: 0,
						indentList: 0,
						outdentCodeBlock: 1,
						indentCodeBlock: 0
					},
					changedBlocks: [ ],
					customSetModelData
				} );
			} );

			it( 'should outdent list item if a code block does not have indent', () => {
				runTest( {
					input: [
						'* <codeBlock language="language-plaintext">[]foo</codeBlock>'
					],
					expected: [
						'<codeBlock language="language-plaintext">[]foo</codeBlock>'
					],
					domEventData: shiftTabDomEventData,
					eventStopped: true,
					executedCommands: {
						outdentList: 1,
						indentList: 0,
						outdentCodeBlock: 0,
						indentCodeBlock: 0
					},
					changedBlocks: [ 0 ]
				} );
			} );

			it( 'should outdent list items if a selection starts before code block and ends at a code block', () => {
				const customSetModelData = () => {
					setModelData(
						model,
						modelList( [
							'* foo',
							'* b[ar',
							'* <codeBlock language="language-plaintext">y]ar</codeBlock>'
						] ) );

					model.change( writer => {
						writer.insertText( '	', model.document.getRoot().getChild( 2 ) );
					} );
				};

				runTest( {
					expected: [
						'* foo',
						'b[ar',
						'<codeBlock language="language-plaintext">	y]ar</codeBlock>'
					],
					domEventData: shiftTabDomEventData,
					eventStopped: true,
					executedCommands: {
						outdentList: 1,
						indentList: 0,
						outdentCodeBlock: 0,
						indentCodeBlock: 0
					},
					changedBlocks: [ 1, 2 ],
					customSetModelData
				} );
			} );

			it( 'should outdent a code block if a selection starts at a code block and ends after it', () => {
				const customSetModelData = () => {
					setModelData(
						model,
						modelList( [
							'* foo',
							'* <codeBlock language="language-plaintext">b[ar</codeBlock>',
							'* y]ar'
						] ) );

					model.change( writer => {
						writer.insertText( '	', model.document.getRoot().getChild( 1 ) );
					} );
				};

				runTest( {
					expected: [
						'* foo',
						'* <codeBlock language="language-plaintext">b[ar</codeBlock>',
						'* y]ar'
					],
					domEventData: shiftTabDomEventData,
					eventStopped: true,
					executedCommands: {
						outdentList: 0,
						indentList: 0,
						outdentCodeBlock: 1,
						indentCodeBlock: 0
					},
					changedBlocks: [ ],
					customSetModelData
				} );
			} );
		} );
	} );

	describe( 'table integration with list', () => {
		it( 'TableKeyboard tab observer should capture tab press event when in a cell', () => {
			const inputTable = modelTable( [
				[ '[foo]', 'bar' ]
			] );

			const outputTable = modelTable( [
				[ 'foo', '[bar]' ]
			] );

			runTest( {
				input: [
					'* ' + inputTable
				],
				expected: [
					'* ' + outputTable
				],
				domEventData: tabDomEventData,
				eventStopped: true,
				executedCommands: {
					outdentList: 0,
					indentList: 0
				},
				changedBlocks: [ ]
			} );
		} );

		it( 'TableKeyboard tab observer should capture tab press event with shift when in a cell', () => {
			const inputTable = modelTable( [
				[ 'foo', '[bar]' ]
			] );

			const outputTable = modelTable( [
				[ '[foo]', 'bar' ]
			] );

			runTest( {
				input: [
					'* ' + inputTable
				],
				expected: [
					'* ' + outputTable
				],
				domEventData: shiftTabDomEventData,
				eventStopped: true,
				executedCommands: {
					outdentList: 0,
					indentList: 0
				},
				changedBlocks: [ ]
			} );
		} );

		it( 'TableKeyboard tab observer should capture tab press event with shift when whole table is selected', () => {
			const inputTable = modelTable( [
				[ 'foo', 'bar' ]
			] );

			const outputTable = modelTable( [
				[ '[foo]', 'bar' ]
			] );

			runTest( {
				input: [
					'* [' + inputTable + ']'
				],
				expected: [
					'* ' + outputTable
				],
				domEventData: tabDomEventData,
				eventStopped: true,
				executedCommands: {
					outdentList: 0,
					indentList: 0
				},
				changedBlocks: [ ]
			} );
		} );

		it( 'should indent list items if selection spans a table', () => {
			const inputTable = modelTable( [
				[ 'foo', 'bar' ]
			] );

			const outputTable = modelTable( [
				[ 'foo', 'bar' ]
			] );

			runTest( {
				input: [
					'* foo',
					'* ba[r',
					'* ' + inputTable,
					'* ya]r'
				],
				expected: [
					'* foo',
					'  * ba[r',
					'  * ' + outputTable,
					'  * ya]r'
				],
				domEventData: tabDomEventData,
				eventStopped: true,
				executedCommands: {
					outdentList: 0,
					indentList: 1
				},
				changedBlocks: [ 1, 2, 3 ]
			} );
		} );

		it( 'nothing should happen if selection spans a table but one of the list items cannot be indented', () => {
			const inputTable = modelTable( [
				[ 'foo', 'bar' ]
			] );

			const outputTable = modelTable( [
				[ 'foo', 'bar' ]
			] );

			runTest( {
				input: [
					'* fo[o',
					'* bar',
					'* ' + inputTable,
					'* ya]r'
				],
				expected: [
					'* fo[o',
					'* bar',
					'* ' + outputTable,
					'* ya]r'
				],
				domEventData: tabDomEventData,
				eventStopped: false,
				executedCommands: {
					outdentList: 0,
					indentList: 0
				},
				changedBlocks: [ ]
			} );
		} );

		it( 'should outdent list items if a selection spans table', () => {
			const inputTable = modelTable( [
				[ 'foo', 'bar' ]
			] );

			const outputTable = modelTable( [
				[ 'foo', 'bar' ]
			] );

			runTest( {
				input: [
					'* foo',
					'* ba[r',
					'* ' + inputTable,
					'* ya]r'
				],
				expected: [
					'* foo',
					'ba[r',
					outputTable,
					'ya]r'
				],
				domEventData: shiftTabDomEventData,
				eventStopped: true,
				executedCommands: {
					outdentList: 1,
					indentList: 0
				},
				changedBlocks: [ 1, 2, 3 ]
			} );
		} );

		it( 'table listener should capture event when list cannot be indented', () => {
			const innerList = modelList( [
				'* A[]'
			] );

			const innerListOutput = modelList( [
				'* A {id:a00}'
			] );

			const inputTable = modelTable( [
				[ innerList, 'bar' ]
			] );

			const outputTable = modelTable( [
				[ innerListOutput, '[bar]' ]
			] );

			runTest( {
				input: [
					'* ' + inputTable
				],
				expected: [
					'* ' + outputTable
				],
				domEventData: tabDomEventData,
				eventStopped: true,
				executedCommands: {
					outdentList: 0,
					indentList: 0
				},
				changedBlocks: [ ]
			} );
		} );

		it( 'should indent list item in a table', () => {
			const innerList = modelList( [
				'* A',
				'* B[]'
			] );

			const innerListOutput = modelList( [
				'* A {id:a00}',
				'  * B[]'
			] );

			const inputTable = modelTable( [
				[ innerList, 'bar' ]
			] );

			const outputTable = modelTable( [
				[ innerListOutput, 'bar' ]
			] );

			runTest( {
				input: [
					'* ' + inputTable
				],
				expected: [
					'* ' + outputTable
				],
				domEventData: tabDomEventData,
				eventStopped: true,
				executedCommands: {
					outdentList: 0,
					indentList: 1
				},
				changedBlocks: [ 1 ]
			} );
		} );

		it( 'should outdent list item in a table', () => {
			const innerList = modelList( [
				'* A[]'
			] );

			const inputTable = modelTable( [
				[ innerList, 'bar' ]
			] );

			const outputTable = modelTable( [
				[ 'A[]', 'bar' ]
			] );

			runTest( {
				input: [
					'* ' + inputTable
				],
				expected: [
					'* ' + outputTable
				],
				domEventData: shiftTabDomEventData,
				eventStopped: true,
				executedCommands: {
					outdentList: 1,
					indentList: 0
				},
				changedBlocks: [ 0 ]
			} );
		} );
	} );

	// @param {Iterable.<String>} input
	// @param {Iterable.<String>} expected
	// @param {module:engine/view/observer/domeventdata~DomEventData} domEventData
	// @param {Boolean|Object.<String,Boolean>} eventStopped Boolean when preventDefault() and stop() were called/not called together.
	// Object, when mixed behavior was expected.
	// @param {Object.<String,Number>} executedCommands Numbers of command executions.
	// @param {Array.<Number>} changedBlocks Indexes of changed blocks.
	// @param {Function} customSetModelData Function to alter how model data is set.
	function runTest( { input, expected, domEventData, eventStopped, executedCommands = {}, changedBlocks = [], customSetModelData } ) {
		if ( customSetModelData ) {
			customSetModelData();
		} else {
			setModelData( model, modelList( input ) );
		}

		view.document.fire( eventInfo, domEventData );

		expect( getModelData( model ) ).to.equalMarkup( modelList( expected ) );

		if ( typeof eventStopped === 'object' ) {
			expect( domEventData.domEvent.stopPropagation.called ).to.equal( eventStopped.stopPropagation, 'stopPropagation() call' );
			expect( domEventData.domEvent.preventDefault.called ).to.equal( eventStopped.preventDefault, 'preventDefault() call' );
			expect( !!eventInfo.stop.called ).to.equal( eventStopped.stop, 'eventInfo.stop() call' );
		} else {
			expect( domEventData.domEvent.stopPropagation.callCount ).to.equal( eventStopped ? 1 : 0, 'stopPropagation() call' );
			expect( domEventData.domEvent.preventDefault.callCount ).to.equal( eventStopped ? 1 : 0, 'preventDefault() call' );
			expect( eventInfo.stop.called ).to.equal( eventStopped ? true : undefined, 'eventInfo.stop() call' );
		}

		for ( const name in executedCommands ) {
			expect( commandSpies[ name ].callCount ).to.equal( executedCommands[ name ], `${ name } command call count` );
		}

		expect( blocksChangedByCommands.map( block => block.index ) ).to.deep.equal( changedBlocks, 'changed blocks\' indexes' );
	}
} );
