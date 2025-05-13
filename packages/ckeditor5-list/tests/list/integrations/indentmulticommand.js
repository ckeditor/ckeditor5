/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ListEditing from '../../../src/list/listediting.js';
import stubUid from '../_utils/uid.js';
import { modelList } from '../_utils/utils.js';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import IndentEditing from '@ckeditor/ckeditor5-indent/src/indentediting.js';
import IndentBlock from '@ckeditor/ckeditor5-indent/src/indentblock.js';
import BlockQuoteEditing from '@ckeditor/ckeditor5-block-quote/src/blockquoteediting.js';
import CodeBlockEditing from '@ckeditor/ckeditor5-code-block/src/codeblockediting.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { Paragraph } from 'ckeditor5/src/paragraph.js';
import {
	getData as getModelData,
	setData as setModelData
} from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

describe( 'Indent MultiCommand integrations', () => {
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
				Paragraph, CodeBlockEditing, ListEditing, IndentEditing, IndentBlock,
				BlockQuoteEditing
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
		beforeEach( () => {
			const indentBlockCommand = editor.commands.get( 'indentBlock' );
			const outdentBlockCommand = editor.commands.get( 'outdentBlock' );

			commandSpies.indentBlock = sinon.spy( indentBlockCommand, 'execute' );
			commandSpies.outdentBlock = sinon.spy( outdentBlockCommand, 'execute' );
		} );

		describe( 'indent command', () => {
			describe( 'collapsed selection', () => {
				it( 'no command should be executed when cannot indent a list item (start of a list)', () => {
					runTest( {
						input: [
							'* A[]'
						],
						expected: [
							'* <paragraph>A[]</paragraph>'
						],
						commandName: 'indent',
						executedCommands: {
							outdentList: 0,
							indentList: 0,
							outdentBlock: 0,
							indentBlock: 0
						},
						changedBlocks: [ ]
					} );
				} );

				it( 'no command should be executed when cannot indent list item a (nested list item)', () => {
					runTest( {
						input: [
							'* A',
							'  * B[]'
						],
						expected: [
							'* A',
							'  * <paragraph>B[]</paragraph>'
						],
						commandName: 'indent',
						executedCommands: {
							outdentList: 0,
							indentList: 0,
							outdentBlock: 0,
							indentBlock: 0
						},
						changedBlocks: [ ]
					} );
				} );

				it( 'no command should be executed when cannot indent a list item (start of a different list)', () => {
					runTest( {
						input: [
							'* A',
							'# B[]'
						],
						expected: [
							'* A',
							'# <paragraph>B[]</paragraph>'
						],
						commandName: 'indent',
						executedCommands: {
							outdentList: 0,
							indentList: 0,
							outdentBlock: 0,
							indentBlock: 0
						},
						changedBlocks: [ ]
					} );
				} );

				it( 'no command should be executed when a list item can\'t be indented (list item after block)', () => {
					runTest( {
						input: [
							'* A',
							'  B',
							'  * C[]'
						],
						expected: [
							'* A',
							'  B',
							'  * <paragraph>C[]</paragraph>'
						],
						commandName: 'indent',
						executedCommands: {
							outdentList: 0,
							indentList: 0,
							outdentBlock: 0,
							indentBlock: 0
						},
						changedBlocks: [ ]
					} );
				} );

				it( 'should indent a list item if preceded by a list item with the same indent', () => {
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
						executedCommands: {
							outdentList: 0,
							indentList: 1,
							outdentBlock: 0,
							indentBlock: 0
						},
						changedBlocks: [ 1 ]
					} );
				} );

				it( 'should indent a list item if preceded by a list item with higher indent', () => {
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
						executedCommands: {
							outdentList: 0,
							indentList: 1,
							outdentBlock: 0,
							indentBlock: 0
						},
						changedBlocks: [ 2 ]
					} );
				} );

				it( 'should indent a list item block', () => {
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
						executedCommands: {
							outdentList: 0,
							indentList: 1,
							outdentBlock: 0,
							indentBlock: 0
						},
						changedBlocks: [ 1 ]
					} );
				} );

				it( 'should indent only a selected list item block', () => {
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
						executedCommands: {
							outdentList: 0,
							indentList: 1,
							outdentBlock: 0,
							indentBlock: 0
						},
						changedBlocks: [ 1 ]
					} );
				} );

				it( 'should indent a list item with its blocks', () => {
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
						executedCommands: {
							outdentList: 0,
							indentList: 1,
							outdentBlock: 0,
							indentBlock: 0
						},
						changedBlocks: [ 1, 2 ]
					} );
				} );

				it( 'should indent a list item with its blocks and nested list items', () => {
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
						executedCommands: {
							outdentList: 0,
							indentList: 1,
							outdentBlock: 0,
							indentBlock: 0
						},
						changedBlocks: [ 1, 2, 3 ]
					} );
				} );

				it( 'should indent a list item with its blocks and nested multi-block list items', () => {
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
						executedCommands: {
							outdentList: 0,
							indentList: 1,
							outdentBlock: 0,
							indentBlock: 0
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
						executedCommands: {
							outdentList: 0,
							indentList: 1,
							outdentBlock: 0,
							indentBlock: 0
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
						executedCommands: {
							outdentList: 0,
							indentList: 1,
							outdentBlock: 0,
							indentBlock: 0
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
						executedCommands: {
							outdentList: 0,
							indentList: 1,
							outdentBlock: 0,
							indentBlock: 0
						},
						changedBlocks: [ 1, 2 ]
					} );
				} );

				it( 'should indent when a selection spans a block and a list item', () => {
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
						executedCommands: {
							outdentList: 0,
							indentList: 1,
							outdentBlock: 0,
							indentBlock: 0
						},
						changedBlocks: [ 1, 2, 3, 4 ]
					} );
				} );

				it( 'no command should be executed when all selected items cannot be indented (start of a list)', () => {
					runTest( {
						input: [
							'* [A',
							'  B',
							'  C]'
						],
						expected: [
							'* <paragraph>[A</paragraph>',
							'  <paragraph>B</paragraph>',
							'  <paragraph>C]</paragraph>'
						],
						commandName: 'indent',
						executedCommands: {
							outdentList: 0,
							indentList: 0,
							outdentBlock: 0,
							indentBlock: 0
						},
						changedBlocks: [ ]
					} );
				} );

				it( 'no command should be executed when any of selected blocks can\'t be indented', () => {
					runTest( {
						input: [
							'* A',
							'  * [B',
							'    C]'

						],
						expected: [
							'* A',
							'  * <paragraph>[B</paragraph>',
							'    <paragraph>C]</paragraph>'
						],
						commandName: 'indent',
						executedCommands: {
							outdentList: 0,
							indentList: 0,
							outdentBlock: 0,
							indentBlock: 0
						},
						changedBlocks: [ ]
					} );
				} );
			} );
		} );

		describe( 'outdent command', () => {
			describe( 'collapsed selection', () => {
				it( 'no command should be executed when outside list', () => {
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
							indentList: 0,
							outdentBlock: 0,
							indentBlock: 0
						},
						changedBlocks: [ ]
					} );
				} );

				it( 'should outdent the list item and delete the list', () => {
					runTest( {
						input: [
							'* A[]'
						],
						expected: [
							'A[]'
						],
						commandName: 'outdent',
						executedCommands: {
							outdentList: 1,
							indentList: 0,
							outdentBlock: 0,
							indentBlock: 0
						},
						changedBlocks: [ 0 ]
					} );
				} );

				it( 'should outdent the list item and make the next item first in the list', () => {
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
						executedCommands: {
							outdentList: 1,
							indentList: 0,
							outdentBlock: 0,
							indentBlock: 0
						},
						changedBlocks: [ 0 ]
					} );
				} );

				it( 'should outdent the list item and split the list into two lists', () => {
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
						executedCommands: {
							outdentList: 1,
							indentList: 0,
							outdentBlock: 0,
							indentBlock: 0
						},
						changedBlocks: [ 1 ]
					} );
				} );

				it( 'should outdent the list item, split the list into two lists and fix the indent', () => {
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
						executedCommands: {
							outdentList: 1,
							indentList: 0,
							outdentBlock: 0,
							indentBlock: 0
						},
						changedBlocks: [ 1, 2 ]
					} );
				} );

				it( 'should outdent the list item, split the list into two lists and fix indent of the multi-block list item', () => {
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
						executedCommands: {
							outdentList: 1,
							indentList: 0,
							outdentBlock: 0,
							indentBlock: 0
						},
						changedBlocks: [ 1, 2, 3, 4 ]
					} );
				} );

				it( 'should outdent the list item', () => {
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
						executedCommands: {
							outdentList: 1,
							indentList: 0,
							outdentBlock: 0,
							indentBlock: 0
						},
						changedBlocks: [ 1 ]
					} );
				} );

				it( 'should outdent the other type of the list item and take it out of the list', () => {
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
						executedCommands: {
							outdentList: 1,
							indentList: 0,
							outdentBlock: 0,
							indentBlock: 0
						},
						changedBlocks: [ 1 ]
					} );
				} );

				it( 'should outdent the child list item', () => {
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
						executedCommands: {
							outdentList: 1,
							indentList: 0,
							outdentBlock: 0,
							indentBlock: 0
						},
						changedBlocks: [ 1 ]
					} );
				} );

				it( 'should outdent the child list item of the multi-block list item', () => {
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
						executedCommands: {
							outdentList: 1,
							indentList: 0,
							outdentBlock: 0,
							indentBlock: 0
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
						executedCommands: {
							outdentList: 1,
							indentList: 0,
							outdentBlock: 0,
							indentBlock: 0
						},
						changedBlocks: [ 2 ]
					} );
				} );

				it( 'should outdent the block to a list item and keep following blocks', () => {
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
						executedCommands: {
							outdentList: 1,
							indentList: 0,
							outdentBlock: 0,
							indentBlock: 0
						},
						changedBlocks: [ 1, 2, 3 ]
					} );
				} );

				it( 'should outdent the list item which should inherit following list items on the same indent', () => {
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
						executedCommands: {
							outdentList: 1,
							indentList: 0,
							outdentBlock: 0,
							indentBlock: 0
						},
						changedBlocks: [ 1 ]
					} );
				} );

				it( 'should outdent the list item with blocks out of list with blocks', () => {
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
						executedCommands: {
							outdentList: 1,
							indentList: 0,
							outdentBlock: 0,
							indentBlock: 0
						},
						changedBlocks: [ 1, 2 ]
					} );
				} );

				it( 'should outdent the list item out of list with blocks and fix remaining list items indent', () => {
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
						executedCommands: {
							outdentList: 1,
							indentList: 0,
							outdentBlock: 0,
							indentBlock: 0
						},
						changedBlocks: [ 1, 2, 3, 4 ]
					} );
				} );

				it( 'should outdent a multi-indented block once if it is in a list item', () => {
					runTest( {
						input: [
							'* <paragraph blockIndent="80px">A[]</paragraph>'
						],
						expected: [
							'* <paragraph blockIndent="40px">A[]</paragraph>'
						],
						commandName: 'outdent',
						executedCommands: {
							outdentList: 0,
							indentList: 0,
							outdentBlock: 1,
							indentBlock: 0
						},
						changedBlocks: [ ]
					} );
				} );

				it( 'should outdent indented block if it is in a list item', () => {
					runTest( {
						input: [
							'* <paragraph blockIndent="40px">A[]</paragraph>'
						],
						expected: [
							'* A[]'
						],
						commandName: 'outdent',
						executedCommands: {
							outdentList: 0,
							indentList: 0,
							outdentBlock: 1,
							indentBlock: 0
						},
						changedBlocks: [ ]
					} );
				} );

				it( 'should outdent indented block if it is in a list item block', () => {
					runTest( {
						input: [
							'* A',
							'  <paragraph blockIndent="40px">B[]</paragraph>'
						],
						expected: [
							'* A',
							'  B[]'
						],
						commandName: 'outdent',
						executedCommands: {
							outdentList: 0,
							indentList: 0,
							outdentBlock: 1,
							indentBlock: 0
						},
						changedBlocks: [ ]
					} );
				} );

				it( 'should outdent indented block if it is in indented list item', () => {
					runTest( {
						input: [
							'* A',
							'  * <paragraph blockIndent="40px">B[]</paragraph>'
						],
						expected: [
							'* A',
							'  * B[]'
						],
						commandName: 'outdent',
						executedCommands: {
							outdentList: 0,
							indentList: 0,
							outdentBlock: 1,
							indentBlock: 0
						},
						changedBlocks: [ ]
					} );
				} );

				it( 'should outdent indented block if it is in indented list item block', () => {
					runTest( {
						input: [
							'* A',
							'  * B',
							'    <paragraph blockIndent="40px">C[]</paragraph>'
						],
						expected: [
							'* A',
							'  * B',
							'    C[]'
						],
						commandName: 'outdent',
						executedCommands: {
							outdentList: 0,
							indentList: 0,
							outdentBlock: 1,
							indentBlock: 0
						},
						changedBlocks: [ ]
					} );
				} );
			} );

			describe( 'non-collapsed selection', () => {
				it( 'should outdent list items if a selection is below list', () => {
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
						executedCommands: {
							outdentList: 1,
							indentList: 0,
							outdentBlock: 0,
							indentBlock: 0
						},
						changedBlocks: [ 0, 1 ]
					} );
				} );

				it( 'should not outdent if a selection is above list', () => {
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
						executedCommands: {
							outdentList: 0,
							indentList: 0,
							outdentBlock: 0,
							indentBlock: 0
						},
						changedBlocks: [ ]
					} );
				} );

				it( 'should not outdent if a selection spans many lists', () => {
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
						executedCommands: {
							outdentList: 1,
							indentList: 0,
							outdentBlock: 0,
							indentBlock: 0
						},
						changedBlocks: [ 0 ]
					} );
				} );

				it( 'should outdent the flat list', () => {
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
						executedCommands: {
							outdentList: 1,
							indentList: 0,
							outdentBlock: 0,
							indentBlock: 0
						},
						changedBlocks: [ 0, 1, 2 ]
					} );
				} );

				it( 'should outdent the nested list', () => {
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
						executedCommands: {
							outdentList: 1,
							indentList: 0,
							outdentBlock: 0,
							indentBlock: 0
						},
						changedBlocks: [ 0, 1, 2, 3 ]
					} );
				} );

				it( 'should outdent the multi-block list', () => {
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
						executedCommands: {
							outdentList: 1,
							indentList: 0,
							outdentBlock: 0,
							indentBlock: 0
						},
						changedBlocks: [ 0, 1, 2, 3, 4, 5 ]
					} );
				} );

				it( 'should outdenst the list item nested items', () => {
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
						executedCommands: {
							outdentList: 1,
							indentList: 0,
							outdentBlock: 0,
							indentBlock: 0
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
						executedCommands: {
							outdentList: 1,
							indentList: 0,
							outdentBlock: 0,
							indentBlock: 0
						},
						changedBlocks: [ 1, 2 ]
					} );
				} );

				it( 'should outdent the list item, the nestesd list item and the block', () => {
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
						executedCommands: {
							outdentList: 1,
							indentList: 0,
							outdentBlock: 0,
							indentBlock: 0
						},
						changedBlocks: [ 0, 1, 2 ]
					} );
				} );

				it( 'should outdent indented block if a selection starts at indented block and ends below', () => {
					runTest( {
						input: [
							'* A',
							'  * <paragraph blockIndent="40px">[B</paragraph>',
							'* C]'
						],
						expected: [
							'* A',
							'  * [B',
							'* C]'
						],
						commandName: 'outdent',
						executedCommands: {
							outdentList: 0,
							indentList: 0,
							outdentBlock: 1,
							indentBlock: 0
						},
						changedBlocks: [ ]
					} );
				} );

				it( 'should outdent list itemsif a selection starts above indented code block and ends at it', () => {
					runTest( {
						input: [
							'* [A',
							'  * <paragraph blockIndent="40px">B]</paragraph>',
							'* C'
						],
						expected: [
							'[A',
							'* <paragraph blockIndent="40px">B]</paragraph>',
							'* C'
						],
						commandName: 'outdent',
						executedCommands: {
							outdentList: 1,
							indentList: 0,
							outdentBlock: 0,
							indentBlock: 0
						},
						changedBlocks: [ 0, 1 ]
					} );
				} );
			} );
		} );
	} );

	describe( 'code block in a list', () => {
		beforeEach( () => {
			const indentCodeBlockCommand = editor.commands.get( 'indentCodeBlock' );
			const outdentCodeBlockcommand = editor.commands.get( 'outdentCodeBlock' );

			commandSpies.indentCodeBlock = sinon.spy( indentCodeBlockCommand, 'execute' );
			commandSpies.outdentCodeBlock = sinon.spy( outdentCodeBlockcommand, 'execute' );
		} );

		describe( 'indent command', () => {
			it( 'should indent the code block when in a list item that cannot be indented', () => {
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

			it( 'should indent the code block when in a list item that can be indented', () => {
				runTest( {
					input: [
						'* foo',
						'* <codeBlock language="language-plaintext">[]bar</codeBlock>'
					],
					expected: [
						'* foo',
						'* <codeBlock language="language-plaintext">	[]bar</codeBlock>'
					],
					commandName: 'indent',
					executedCommands: {
						outdentList: 0,
						indentList: 0,
						outdentCodeBlock: 0,
						indentCodeBlock: 1
					},
					changedBlocks: [ ]
				} );
			} );

			it( 'should indent the code block when in a list item block', () => {
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
						'* <paragraph>f[oo</paragraph>',
						'  <codeBlock language="language-plaintext">foo</codeBlock>',
						'* <paragraph>ba]r</paragraph>'
					],
					commandName: 'indent',
					executedCommands: {
						outdentList: 0,
						indentList: 0,
						outdentCodeBlock: 0,
						indentCodeBlock: 0
					},
					changedBlocks: [ ]
				} );
			} );

			it( 'should indent list items when selection spans a code block', () => {
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
					commandName: 'indent',
					executedCommands: {
						outdentList: 0,
						indentList: 1,
						outdentCodeBlock: 0,
						indentCodeBlock: 0
					},
					changedBlocks: [ 1, 2, 3 ]
				} );
			} );

			it( 'should indent the list item when selection starts above and ends at codeblock', () => {
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
					commandName: 'indent',
					executedCommands: {
						outdentList: 0,
						indentList: 1,
						outdentCodeBlock: 0,
						indentCodeBlock: 0
					},
					changedBlocks: [ 1, 2 ]
				} );
			} );

			it( 'should indent the code block when selection starts at a code block and ends below', () => {
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
					commandName: 'indent',
					executedCommands: {
						outdentList: 0,
						indentList: 0,
						outdentCodeBlock: 0,
						indentCodeBlock: 1
					},
					changedBlocks: [ ]
				} );
			} );

			it( 'should indent the code block when a selection starts at a code block and ends outside list', () => {
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
					commandName: 'indent',
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

		describe( 'outdent command', () => {
			it( 'should outdent the code block', () => {
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

			it( 'should outdent the list item if a code block does not have an indent', () => {
				runTest( {
					input: [
						'* <codeBlock language="language-plaintext">[]foo</codeBlock>'
					],
					expected: [
						'<codeBlock language="language-plaintext">[]foo</codeBlock>'
					],
					commandName: 'outdent',
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

			it( 'should outdent list items if a selection starts before a code block and ends at a code block', () => {
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
					commandName: 'outdent',
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

			it( 'should outdent the code block if a selection starts at a code block and ends after it', () => {
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
					commandName: 'outdent',
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

	// @param {Iterable.<String>} input
	// @param {Iterable.<String>} expected
	// @param {String} commandName Name of a command to execute.
	// @param {Object.<String,Number>} executedCommands Numbers of command executions.
	// @param {Array.<Number>} changedBlocks Indexes of changed blocks.
	// @param {Function} customSetModelData Function to alter how model data is set.
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
