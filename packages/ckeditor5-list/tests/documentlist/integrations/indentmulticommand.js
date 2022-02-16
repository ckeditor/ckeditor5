/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import DocumentListEditing from '../../../src/documentlist/documentlistediting';

import IndentEditing from '@ckeditor/ckeditor5-indent/src/indentediting';
import IndentBlock from '@ckeditor/ckeditor5-indent/src/indentblock';
import BlockQuoteEditing from '@ckeditor/ckeditor5-block-quote/src/blockquoteediting';
import TableEditing from '@ckeditor/ckeditor5-table/src/tableediting';
import TableKeyboard from '@ckeditor/ckeditor5-table/src/tablekeyboard';
import CodeBlockEditing from '@ckeditor/ckeditor5-code-block/src/codeblockediting';
import { Paragraph } from 'ckeditor5/src/paragraph';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import { modelTable } from '@ckeditor/ckeditor5-table/tests/_utils/utils';

import { modelList } from '../_utils/utils';

import {
	getData as getModelData,
	setData as setModelData
} from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import stubUid from '../_utils/uid';

describe( 'DocumentListEditing integrations: tab key', () => {
	const blocksChangedByCommands = [];

	let element;
	let editor, model;
	let indentListcommand, outdentListcommand,
		commandSpies;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		editor = await ClassicTestEditor.create( element, {
			plugins: [
				Paragraph, CodeBlockEditing, DocumentListEditing, IndentEditing, IndentBlock,
				BlockQuoteEditing, TableEditing, TableKeyboard
			]
		} );

		model = editor.model;

		stubUid();

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

	describe( 'list with indent block', () => {
		describe( 'collapsed selection', () => {
			it( 'should execute indentBlock command if cannot indent list item (start of a list)', () => {
				runTest( {
					input: [
						'* A[]'
					],
					expected: [
						'* <paragraph blockIndent="40px">A[]</paragraph>'
					],
					commandName: 'indent',
					eventStopped: false,
					executedCommands: {
						outdentList: 0,
						indentList: 0
					},
					changedBlocks: [ ]
				} );
			} );

			it( 'should execute indentBlock command if cannot indent list item (nested list item)', () => {
				runTest( {
					input: [
						'* A',
						'  * B[]'
					],
					expected: [
						'* A',
						'  * <paragraph blockIndent="40px">B[]</paragraph>'
					],
					commandName: 'indent',
					eventStopped: false,
					executedCommands: {
						outdentList: 0,
						indentList: 0
					},
					changedBlocks: [ ]
				} );
			} );

			it( 'should execute indentBlock command if cannot indent list item (nested list item)', () => {
				runTest( {
					input: [
						'* A',
						'# B[]'
					],
					expected: [
						'* A',
						'# B[]'
					],
					commandName: 'indent',
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
					commandName: 'indent',
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
					commandName: 'indent',
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
					commandName: 'indent',
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
					commandName: 'indent',
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
					commandName: 'indent',
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
					commandName: 'indent',
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
					commandName: 'indent',
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
					commandName: 'indent',
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
					commandName: 'indent',
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
					commandName: 'indent',
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
					commandName: 'indent',
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
					commandName: 'indent',
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
					commandName: 'indent',
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
					commandName: 'indent',
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
					commandName: 'outdent',
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
					commandName: 'outdent',
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
					commandName: 'outdent',
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
					commandName: 'outdent',
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
					commandName: 'outdent',
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
					commandName: 'outdent',
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
					commandName: 'outdent',
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
					commandName: 'outdent',
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
					commandName: 'outdent',
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
					commandName: 'outdent',
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
					commandName: 'outdent',
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
					commandName: 'outdent',
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
					commandName: 'outdent',
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
					commandName: 'outdent',
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
					commandName: 'outdent',
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
					commandName: 'outdent',
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
					commandName: 'outdent',
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
					commandName: 'outdent',
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
					commandName: 'outdent',
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
					commandName: 'outdent',
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
					commandName: 'outdent',
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
					commandName: 'outdent',
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
					commandName: 'outdent',
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
					commandName: 'outdent',
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
			it( 'should indent code block when in a list item', () => {
				runTest( {
					input: [
						'* <codeBlock language="language-plaintext">[]foo</codeBlock>'
					],
					expected: [
						'* <codeBlock language="language-plaintext">	[]foo</codeBlock>'
					],
					commandName: 'indent',
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

			it( 'should indent code block when in a list item block', () => {
				runTest( {
					input: [
						'* foo',
						'  <codeBlock language="language-plaintext">[]foo</codeBlock>'
					],
					expected: [
						'* foo',
						'  <codeBlock language="language-plaintext">	[]foo</codeBlock>'
					],
					commandName: 'indent',
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

			it( 'should not indent code block when multiple items are selected', () => {
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
					commandName: 'indent',
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
					commandName: 'outdent',
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
				commandName: 'indent',
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
				commandName: 'outdent',
				eventStopped: true,
				executedCommands: {
					outdentList: 0,
					indentList: 0
				},
				changedBlocks: [ ]
			} );
		} );
	} );

	// @param {Iterable.<String>} input
	// @param {Iterable.<String>} expected
	// @param {Boolean|Object.<String,Boolean>} eventStopped Boolean when preventDefault() and stop() were called/not called together.
	// Object, when mixed behavior was expected.
	// @param {Object.<String,Number>} executedCommands Numbers of command executions.
	// @param {Array.<Number>} changedBlocks Indexes of changed blocks.
	function runTest( { input, expected, commandName, executedCommands = {}, changedBlocks = [], customSetModelData } ) {
		if ( customSetModelData ) {
			customSetModelData();
		} else {
			setModelData( model, modelList( input ) );
		}

		editor.commands.get( commandName ).execute();

		expect( getModelData( model ) ).to.equalMarkup( modelList( expected ) );

		for ( const name in executedCommands ) {
			expect( commandSpies[ name ].callCount ).to.equal( executedCommands[ name ], `${ name } command call count` );
		}

		expect( blocksChangedByCommands.map( block => block.index ) ).to.deep.equal( changedBlocks, 'changed blocks\' indexes' );
	}
} );
