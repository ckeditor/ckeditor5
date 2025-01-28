/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { modelList } from './_utils/utils.js';
import ListMergeCommand from '../../src/list/listmergecommand.js';

import Editor from '@ckeditor/ckeditor5-core/src/editor/editor.js';
import Model from '@ckeditor/ckeditor5-engine/src/model/model.js';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

describe( 'ListMergeCommand', () => {
	let editor, model, doc, command;
	let blocksChangedByCommands = [];

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editor = new Editor();
		editor.model = new Model();

		model = editor.model;
		doc = model.document;
		doc.createRoot();

		model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );
		model.schema.register( 'blockQuote', { inheritAllFrom: '$container' } );
		model.schema.extend( '$container', { allowAttributes: [ 'listType', 'listIndent', 'listItemId' ] } );
		model.schema.extend( '$block', { allowAttributes: [ 'listType', 'listIndent', 'listItemId' ] } );
		model.schema.extend( '$blockObject', { allowAttributes: [ 'listType', 'listIndent', 'listItemId' ] } );

		model.schema.register( 'blockWidget', {
			isObject: true,
			isBlock: true,
			allowIn: '$root',
			allowAttributesOf: '$container'
		} );

		editor.model.schema.register( 'inlineWidget', {
			isObject: true,
			isInline: true,
			allowWhere: '$text',
			allowAttributesOf: '$text'
		} );
	} );

	afterEach( () => {
		command.destroy();
	} );

	describe( 'backward', () => {
		beforeEach( () => {
			command = new ListMergeCommand( editor, 'backward' );

			command.on( 'afterExecute', ( evt, data ) => {
				blocksChangedByCommands = data;
			} );
		} );

		describe( 'isEnabled', () => {
			describe( 'collapsed selection', () => {
				it( 'should be false when not in a list item', () => {
					setData( model, modelList( [
						'a[]'
					] ) );

					expect( command.isEnabled ).to.be.false;

					setData( model, modelList( [
						'* a',
						'[]b'
					] ) );

					expect( command.isEnabled ).to.be.false;
				} );

				it( 'should be true when there is a preceding list item', () => {
					setData( model, modelList( [
						'* a',
						'* []'
					] ) );

					expect( command.isEnabled ).to.be.true;
				} );

				it( 'should be false when there is no preceding list item', () => {
					setData( model, modelList( [
						'* []'
					] ) );

					expect( command.isEnabled ).to.be.false;
				} );

				it( 'should be false when there is a preceding block in the same list item', () => {
					setData( model, modelList( [
						'* a',
						'  []'
					] ) );

					expect( command.isEnabled ).to.be.false;
				} );
			} );

			describe( 'block object', () => {
				it( 'should be false when not in a list item', () => {
					setData( model, modelList( [
						'[<blockWidget></blockWidget>]'
					] ) );

					expect( command.isEnabled ).to.be.false;
				} );

				it( 'should be true when there is a preceding list item', () => {
					setData( model, modelList( [
						'* a',
						'* [<blockWidget></blockWidget>]'
					] ) );

					expect( command.isEnabled ).to.be.true;
				} );

				it( 'should be false when there is no preceding list item', () => {
					setData( model, modelList( [
						'* [<blockWidget></blockWidget>]'
					] ) );

					expect( command.isEnabled ).to.be.false;
				} );

				it( 'should be false when there is a preceding block in the same list item', () => {
					setData( model, modelList( [
						'* a',
						'  [<blockWidget></blockWidget>]'
					] ) );

					expect( command.isEnabled ).to.be.false;
				} );
			} );

			describe( 'inline object', () => {
				it( 'should be false when not in a list item', () => {
					setData( model, modelList( [
						'<paragraph>[<inlineWidget></inlineWidget>]</paragraph>'
					] ) );

					expect( command.isEnabled ).to.be.false;
				} );

				it( 'should be false when there is a preceding list item but the selection stays in a single item', () => {
					setData( model, modelList( [
						'* a',
						'* <paragraph>[<inlineWidget></inlineWidget>]</paragraph>'
					] ) );

					expect( command.isEnabled ).to.be.false;
				} );

				it( 'should be false when there is no preceding list item', () => {
					setData( model, modelList( [
						'* <paragraph>[<inlineWidget></inlineWidget>]</paragraph>'
					] ) );

					expect( command.isEnabled ).to.be.false;
				} );

				it( 'should be false when there is a preceding block in the same list item', () => {
					setData( model, modelList( [
						'* a',
						'  <paragraph>[<inlineWidget></inlineWidget>]</paragraph>'
					] ) );

					expect( command.isEnabled ).to.be.false;
				} );
			} );

			describe( 'non-collapsed selection', () => {
				it( 'should be false if the selection starts and ends in the same list item but nothing precedes', () => {
					setData( model, modelList( [
						'* [a]b'
					] ) );

					expect( command.isEnabled ).to.be.false;
				} );

				it( 'should be false if the selection focuses in a non-list item', () => {
					setData( model, modelList( [
						'* [a',
						'b]'
					] ) );

					expect( command.isEnabled ).to.be.false;
				} );

				it( 'should be true if the selection focuses in a list item', () => {
					setData( model, modelList( [
						'* [a',
						'* b]'
					] ) );

					expect( command.isEnabled ).to.be.true;

					setData( model, modelList( [
						'[a',
						'* b]'
					] ) );

					expect( command.isEnabled ).to.be.true;
				} );
			} );
		} );

		describe( 'execute()', () => {
			it( 'should use parent batch', () => {
				setData( model, modelList( [
					'* a',
					'* []'
				] ) );

				model.change( writer => {
					expect( writer.batch.operations.length, 'before' ).to.equal( 0 );

					command.execute();

					expect( writer.batch.operations.length, 'after' ).to.be.above( 0 );
				} );
			} );

			describe( 'single block list item', () => {
				describe( 'collapsed selection at the beginning of a list item', () => {
					describe( 'item before is empty (shouldMergeOnBlocksContentLevel = true)', () => {
						it( 'should merge non empty list item with with previous list item as a block', () => {
							runTest( {
								input: [
									'* ',
									'* []b'
								],
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* []b {id:001}'
								],
								changedBlocks: [ 0 ]
							} );
						} );

						it( 'should merge empty list item with with previous empty list item', () => {
							runTest( {
								input: [
									'* ',
									'* []'
								],
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* []'
								],
								changedBlocks: [ 0 ]
							} );
						} );

						it( 'should merge indented list item with with previous empty list item', () => {
							runTest( {
								input: [
									'* ',
									'  * []a'
								],
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* []a {id:001}'
								],
								changedBlocks: [ 0 ]
							} );
						} );

						it( 'should merge indented empty list item with with previous empty list item', () => {
							runTest( {
								input: [
									'* ',
									'  * []'
								],
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* []'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* ',
									'  * []a{id:002}'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* ',
									'  * []'
								],
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
								changedBlocks: [ 1, 2, 3, 4, 5, 6, 7 ]
							} );
						} );
					} );
				} );

				describe( 'collapsed selection at the end of a list item', () => {
					describe( 'item after is empty (shouldMergeOnBlocksContentLevel = true)', () => {
						it( 'should merge non empty list item with with previous list item as a block', () => {
							runTest( {
								input: [
									'* ',
									'* []b'
								],
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* []b{id:001}'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* []'
								],
								changedBlocks: [ 0 ]
							} );
						} );

						it( 'should merge indented list item with with previous empty list item', () => {
							runTest( {
								input: [
									'* ',
									'  * []a'
								],
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* []a {id:001}'
								],
								changedBlocks: [ 0 ]
							} );
						} );

						it( 'should merge indented empty list item with with previous empty list item', () => {
							runTest( {
								input: [
									'* ',
									'  * []'
								],
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* []'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* ',
									'  * []a{id:002}'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* ',
									'  * []'
								],
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
								changedBlocks: [ 1, 2, 3, 4, 5, 6, 7 ]
							} );
						} );
					} );
				} );
			} );

			describe( 'multi-block list item', () => {
				describe( 'collapsed selection at the beginning of a list item', () => {
					describe( 'item before is empty (shouldMergeOnBlocksContentLevel = true)', () => {
						it( 'should merge with previous list item and keep blocks intact', () => {
							runTest( {
								input: [
									'* ',
									'* []b',
									'  c'
								],
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* []b{id:001}',
									'  c'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* []',
									'  a'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* []a {id:001}',
									'  b'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* []a {id:001}',
									'  b',
									'  * c {id:003}'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* []',
									'  text'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* ',
									'  * []a{id:002}',
									'    b'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* ',
									'  * []',
									'    text'
								],
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
							changedBlocks: [ 4, 5 ]
						} );
					} );
				} );
			} );

			describe( 'around widgets', () => {
				describe( 'block widgets', () => {
					it( 'should merge a selected block widget into a block', () => {
						runTest( {
							input: [
								'* a',
								'* [<blockWidget></blockWidget>]'
							],
							expected: [
								'* a',
								'  [<blockWidget></blockWidget>]'
							],
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge into a nested block with a block widget', () => {
						runTest( {
							input: [
								'* a',
								'  * [<blockWidget></blockWidget>]'
							],
							expected: [
								'* a',
								'  [<blockWidget></blockWidget>]'
							],
							changedBlocks: [ 1 ]
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
							changedBlocks: [ 2 ]
						} );
					} );

					it( 'should merge into a block with a block widget', () => {
						runTest( {
							input: [
								'* <blockWidget></blockWidget>',
								'* a[]'
							],
							commandOptions: {
								shouldMergeOnBlocksContentLevel: false
							},
							expected: [
								'* <blockWidget></blockWidget>',
								'  a[]'
							],
							changedBlocks: [ 1 ]
						} );
					} );
				} );

				describe( 'inline images', () => {
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
							changedBlocks: [ 1 ]
						} );
					} );
				} );
			} );
		} );
	} );

	describe( 'forward', () => {
		beforeEach( () => {
			command = new ListMergeCommand( editor, 'forward' );

			command.on( 'afterExecute', ( evt, data ) => {
				blocksChangedByCommands = data;
			} );
		} );

		describe( 'isEnabled', () => {
			describe( 'collapsed selection', () => {
				it( 'should be false when not in a list item', () => {
					setData( model, modelList( [
						'a[]'
					] ) );

					expect( command.isEnabled ).to.be.false;

					setData( model, modelList( [
						'[]a',
						'* b'
					] ) );

					expect( command.isEnabled ).to.be.false;
				} );

				it( 'should be true when there is a following list item', () => {
					setData( model, modelList( [
						'* []',
						'* a'
					] ) );

					expect( command.isEnabled ).to.be.true;
				} );

				it( 'should be false when there is no following list item', () => {
					setData( model, modelList( [
						'* []'
					] ) );

					expect( command.isEnabled ).to.be.false;
				} );

				it( 'should be false when there is a following block in the same list item', () => {
					setData( model, modelList( [
						'* []',
						'  a'
					] ) );

					expect( command.isEnabled ).to.be.false;
				} );
			} );

			describe( 'block object', () => {
				it( 'should be false when not in a list item', () => {
					setData( model, modelList( [
						'[<blockWidget></blockWidget>]'
					] ) );

					expect( command.isEnabled ).to.be.false;
				} );

				it( 'should be true when there is a following list item', () => {
					setData( model, modelList( [
						'* [<blockWidget></blockWidget>]',
						'* a'
					] ) );

					expect( command.isEnabled ).to.be.true;
				} );

				it( 'should be false when there is no following list item', () => {
					setData( model, modelList( [
						'* [<blockWidget></blockWidget>]'
					] ) );

					expect( command.isEnabled ).to.be.false;
				} );

				it( 'should be false when there is a following block in the same list item', () => {
					setData( model, modelList( [
						'* [<blockWidget></blockWidget>]',
						'  a'
					] ) );

					expect( command.isEnabled ).to.be.false;
				} );
			} );

			describe( 'non-collapsed selection', () => {
				it( 'should be false if the selection focuses in a non-list item', () => {
					setData( model, modelList( [
						'* [a',
						'b]'
					] ) );

					expect( command.isEnabled ).to.be.false;
				} );

				it( 'should be true if the selection focuses in a list item', () => {
					setData( model, modelList( [
						'* [a',
						'* b]'
					] ) );

					expect( command.isEnabled ).to.be.true;

					setData( model, modelList( [
						'[a',
						'* b]'
					] ) );

					// Because deleteContent must happen.
					expect( command.isEnabled ).to.be.true;
				} );
			} );
		} );

		describe( 'execute()', () => {
			it( 'should use parent batch', () => {
				setData( model, modelList( [
					'* []',
					'* a'
				] ) );

				model.change( writer => {
					expect( writer.batch.operations.length, 'before' ).to.equal( 0 );

					command.execute();

					expect( writer.batch.operations.length, 'after' ).to.be.above( 0 );
				} );
			} );

			describe( 'single block list item', () => {
				describe( 'collapsed selection at the end of a list item', () => {
					describe( 'item after is empty', () => {
						it( 'should remove next empty list item', () => {
							runTest( {
								input: [
									'* b[]',
									'* '
								],
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* b[]'
								],
								changedBlocks: [ 0 ]
							} );
						} );

						it( 'should remove next empty list item when current is empty', () => {
							runTest( {
								input: [
									'* []',
									'* '
								],
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* []'
								],
								changedBlocks: [ 0 ]
							} );
						} );

						it( 'should remove current list item if empty and replace with indented', () => {
							runTest( {
								input: [
									'* []',
									'  * a'
								],
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* []a {id:001}'
								],
								changedBlocks: [ 0 ]
							} );
						} );

						it( 'should remove next empty indented item list', () => {
							runTest( {
								input: [
									'* []',
									'  * '
								],
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* []'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* ',
									'  * []a{id:002}'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* ',
									'  * []'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* a[]b'
								],
								changedBlocks: [ 0 ]
							} );
						} );

						it( 'should delete next empty item list', () => {
							runTest( {
								input: [
									'* a[]',
									'* '
								],
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* a[]'
								],
								changedBlocks: [ 0 ]
							} );
						} );

						it( 'should merge text of indented list item with current list item', () => {
							runTest( {
								input: [
									'* a[]',
									'  * b'
								],
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* a[]b'
								],
								changedBlocks: [ 0 ]
							} );
						} );

						it( 'should remove indented empty list item', () => {
							runTest( {
								input: [
									'* a[]',
									'  * '
								],
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* a[]'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* a',
									'  * b[]c'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* a',
									'  * b[]'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* a[]b',
									'  * c {id:002}',
									'  * d {id:003}',
									'    e',
									'  * f {id:005}',
									'    * g {id:006}',
									'      h'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* a[]b',
									'  b2',
									'  * c {id:003}',
									'  * d {id:004}',
									'    e'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'a',
									'* []'
								],
								changedBlocks: [ 1 ]
							} );
						} );

						it( 'should merge non empty list item', () => {
							runTest( {
								input: [
									'* [',
									'* ]text'
								],
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* []text{id:001}'
								],
								changedBlocks: [ 0 ]
							} );
						} );

						it( 'should merge non empty list item and delete text', () => {
							runTest( {
								input: [
									'* [',
									'* te]xt'
								],
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* []xt{id:001}'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* []',
									'* b {id:002}'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* []c{id:002}',
									'  * d{id:003}'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* []{id:000}',
									'  * d{id:003}'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* []',
									'* d {id:003}'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* []e{id:003}'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* []ther{id:001}'
								],
								changedBlocks: [ 0 ]
							} );
						} );

						it( 'should merge two list items if selection starts in the middle of text', () => {
							runTest( {
								input: [
									'* te[xt',
									'* ano]ther'
								],
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* te[]ther'
								],
								changedBlocks: [ 0 ]
							} );
						} );

						it( 'should merge non empty list item', () => {
							runTest( {
								input: [
									'* text[',
									'* ]another'
								],
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* text[]another'
								],
								changedBlocks: [ 0 ]
							} );
						} );

						it( 'should merge non empty list item and delete text', () => {
							runTest( {
								input: [
									'* text[',
									'* ano]ther'
								],
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* text[]ther'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* text[]',
									'* b {id:002}',
									'  * c {id:003}'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* text[]c',
									'  * d {id:003}'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* text[] {id:000}',
									'  * d {id:003}'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* text[]',
									'* d {id:003}'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* text[]e'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* a',
									'  b[]'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
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
								changedBlocks: [ 1, 2, 11 ]
							} );
						} );

						it( 'should merge indented list item with with currently selected list item', () => {
							runTest( {
								input: [
									'* []',
									'  * a',
									'    b'
								],
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* []a{id:001}',
									'  b'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* []a {id:001}',
									'  b',
									'  * c {id:003}'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* []',
									'  text'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* ',
									'  * []a {id:002}',
									'    b'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* ',
									'  * []',
									'    text'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* a[]b',
									'  c'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* b',
									'  * c',
									'    c2[]d',
									'    e'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* a',
									'  a2[]b',
									'  b2'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* a',
									'  a2[]b',
									'  b2'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* a',
									'  * b',
									'    c[]d'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* a',
									'  * b',
									'    c[]'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* a',
									'  * b[]c',
									'    d'
								],
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
							commandOptions: {
								shouldMergeOnBlocksContentLevel: true
							},
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* []',
									'  '
								],
								changedBlocks: [ 0, 1 ]
							} );
						} );

						it( 'should merge non empty list item', () => {
							runTest( {
								input: [
									'* [',
									'* ]text'
								],
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* []text {id:001}'
								],
								changedBlocks: [ 0 ]
							} );
						} );

						it( 'should merge non empty list item and delete text', () => {
							runTest( {
								input: [
									'* [',
									'* te]xt'
								],
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* []xt {id:001}'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* []',
									'* b {id:002}'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* []c {id:002}',
									'  * d {id:003}'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* [] {id:000}',
									'  * d {id:003}'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* []',
									'* d {id:003}'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* []e{id:003}'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* []e {id:004}'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* []',
									'* c',
									'  * d {id:003}',
									'    e'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* []d {id:001}',
									'  * e {id:003}',
									'    f'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* []',
									'  * e {id:003}',
									'    f',
									'* s {id:001}'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* []ther {id:001}',
									'  text'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* te[]ther'
								],
								changedBlocks: [ 0 ]
							} );
						} );

						it( 'should merge non empty list item', () => {
							runTest( {
								input: [
									'* [',
									'* ]text'
								],
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* []text {id:001}'
								],
								changedBlocks: [ 0 ]
							} );
						} );

						it( 'should merge non empty list item and delete text', () => {
							runTest( {
								input: [
									'* [',
									'* te]xt'
								],
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* []xt{id:001}'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* []',
									'* b {id:002}',
									'  * c {id:003}'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* []c{id:002}',
									'  * d{id:003}'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* [] {id:000}',
									'  * d {id:003}'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* []',
									'* d {id:003}'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* []e{id:003}'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* []',
									'  c',
									'  * d {id:004}',
									'    e',
									'* f {id:001}',
									'  g'
								],
								changedBlocks: [ 0, 1, 2, 3 ]
							} );
						} );
					} );
				} );
			} );

			describe( 'selection outside list', () => {
				describe( 'non-collapsed selection', () => {
					describe( 'only end in a list', () => {
						it( 'should delete everything till end of selection', () => {
							runTest( {
								input: [
									'[',
									'* te]xt'
								],
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* []xt {id:001}'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'a[]b',
									'* c'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'a[]b',
									'  * c {id:002}'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'a[]b',
									'  * c {id:002}',
									'    d'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'a[]b',
									'  * c {id:002}',
									'* d {id:001}'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'a[]d',
									'  * e {id:004}',
									'    f'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* a[]c'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* a',
									'  b[]d'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* a[]',
									'* e {id:003}'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* a[]',
									'  e',
									'* f {id:004}'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* a[]e',
									'  * f {id:004}',
									'    g'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* a',
									'  * b[]f',
									'    * g {id:006}'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* a',
									'  * b[]e',
									'    * f {id:005}',
									'      g'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* a[]e',
									'* f {id:004}',
									'  g'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* a',
									'* b[]d',
									'# d {id:004}'
								],
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
								commandOptions: {
									shouldMergeOnBlocksContentLevel: true
								},
								expected: [
									'* a',
									'# b[]d',
									'  * f {id:004}'
								],
								changedBlocks: [ 1 ]
							} );
						} );
					} );
				} );
			} );

			describe( 'around widgets', () => {
				describe( 'block widgets', () => {
					it( 'should merge into a block with a block widget', () => {
						runTest( {
							input: [
								'* a[]',
								'* <blockWidget></blockWidget>'
							],
							commandOptions: {
								shouldMergeOnBlocksContentLevel: false
							},
							expected: [
								'* a[]',
								'  <blockWidget></blockWidget>'
							],
							changedBlocks: [ 1 ]
						} );
					} );

					it( 'should merge into a nested block with a block widget', () => {
						runTest( {
							input: [
								'* a[]',
								'  * <blockWidget></blockWidget>'
							],
							commandOptions: {
								shouldMergeOnBlocksContentLevel: false
							},
							expected: [
								'* a[]',
								'  <blockWidget></blockWidget>'
							],
							changedBlocks: [ 1 ]
						} );
					} );
				} );

				describe( 'inline images', () => {
					it( 'should merge a list item into following list item containing an inline widget', () => {
						runTest( {
							input: [
								'* a[]',
								'* <inlineWidget></inlineWidget>b'
							],
							commandOptions: {
								shouldMergeOnBlocksContentLevel: true
							},
							expected: [
								'* a[]<inlineWidget></inlineWidget>b'
							],
							changedBlocks: [ 0 ]
						} );
					} );
				} );
			} );
		} );
	} );

	// @param {Iterable.<String>} input
	// @param {Iterable.<String>} expected
	// @param {Array.<Number>} changedBlocks Indexes of changed blocks.
	function runTest( { input, commandOptions, expected, changedBlocks = [] } ) {
		setData( model, modelList( input ) );

		if ( !command.isEnabled ) {
			throw new Error( 'Yikes. The command is disabled but should be executed.' );
		}

		command.execute( commandOptions );

		expect( getData( model ) ).to.equalMarkup( modelList( expected ) );

		expect( blocksChangedByCommands.map( block => block.index ) ).to.deep.equal( changedBlocks, 'changed blocks\' indexes' );
	}
} );
