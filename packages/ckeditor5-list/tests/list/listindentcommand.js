/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ListIndentCommand from '../../src/list/listindentcommand.js';
import stubUid from './_utils/uid.js';
import { modelList } from './_utils/utils.js';

import Editor from '@ckeditor/ckeditor5-core/src/editor/editor.js';
import Model from '@ckeditor/ckeditor5-engine/src/model/model.js';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

describe( 'ListIndentCommand', () => {
	let editor, model, doc, root;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editor = new Editor();
		editor.model = new Model();

		model = editor.model;
		doc = model.document;
		root = doc.createRoot();

		model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );
		model.schema.register( 'blockQuote', { inheritAllFrom: '$container' } );
		model.schema.extend( '$container', { allowAttributes: [ 'listType', 'listIndent', 'listItemId' ] } );
		model.schema.extend( '$block', { allowAttributes: [ 'listType', 'listIndent', 'listItemId' ] } );
		model.schema.extend( '$blockObject', { allowAttributes: [ 'listType', 'listIndent', 'listItemId' ] } );
	} );

	describe( 'forward (indent)', () => {
		let command;

		beforeEach( () => {
			command = new ListIndentCommand( editor, 'forward' );
		} );

		afterEach( () => {
			command.destroy();
		} );

		describe( 'isEnabled', () => {
			describe( 'single block per list item', () => {
				it( 'should be true if selection starts in list item', () => {
					setData( model, modelList( [
						'* 0',
						'* 1',
						'  * 2',
						'    * 3',
						'    * 4',
						'  * []5',
						'* 6'
					] ) );

					expect( command.isEnabled ).to.be.true;
				} );

				it( 'should be false if selection starts in first list item', () => {
					setData( model, modelList( [
						'* []0',
						'* 1',
						'  * 2',
						'    * 3',
						'    * 4',
						'  * 5',
						'* 6'
					] ) );

					expect( command.isEnabled ).to.be.false;
				} );

				it( 'should be false if selection starts in first list item at given indent', () => {
					setData( model, modelList( [
						'* 0',
						'  * 1',
						'* 2',
						'  * []3',
						'    * 4'
					] ) );

					expect( command.isEnabled ).to.be.false;
				} );

				it( 'should be false if selection starts in first list item (different list type)', () => {
					setData( model, modelList( [
						'* 0',
						'  * 1',
						'# 2',
						'  * 3',
						'* []4'
					] ) );

					expect( command.isEnabled ).to.be.false;
				} );

				it( 'should be false if selection is in first list item with different type than previous list', () => {
					setData( model, modelList( [
						'* 0',
						'# []1'
					] ) );

					expect( command.isEnabled ).to.be.false;
				} );

				it( 'should be false if selection starts in a list item that has higher indent than it\'s previous sibling', () => {
					setData( model, modelList( [
						'* 0',
						'* 1',
						'  * []2',
						'    * 3',
						'    * 4',
						'  * 5',
						'* 6'
					] ) );

					expect( command.isEnabled ).to.be.false;
				} );

				it( 'should be false if selection starts before a list item', () => {
					setData( model, modelList( [
						'[]0',
						'* 1',
						'* 2'
					] ) );

					expect( command.isEnabled ).to.be.false;
				} );
			} );

			describe( 'multiple blocks per list item', () => {
				it( 'should be true if selection starts in the first block of list item', () => {
					setData( model, modelList( [
						'* 0',
						'* []1',
						'  2',
						'  3'
					] ) );

					expect( command.isEnabled ).to.be.true;
				} );

				it( 'should be true if selection starts in the second block of list item', () => {
					setData( model, modelList( [
						'* 0',
						'* 1',
						'  []2',
						'  3'
					] ) );

					expect( command.isEnabled ).to.be.true;
				} );

				it( 'should be true if selection starts in the last block of list item', () => {
					setData( model, modelList( [
						'* 0',
						'* 1',
						'  2',
						'  []3'
					] ) );

					expect( command.isEnabled ).to.be.true;
				} );

				it( 'should be false if selection starts in first list item', () => {
					setData( model, modelList( [
						'* []0',
						'  1'
					] ) );

					expect( command.isEnabled ).to.be.false;
				} );

				it( 'should be false if selection starts in the first list item at given indent', () => {
					setData( model, modelList( [
						'* 0',
						'  * []1',
						'    2'
					] ) );

					expect( command.isEnabled ).to.be.false;
				} );

				it( 'should be false if selection is in first list item with different type than previous list', () => {
					setData( model, modelList( [
						'* 0',
						'  1',
						'# []2',
						'  3'
					] ) );

					expect( command.isEnabled ).to.be.false;
				} );

				describe( 'multiple list items selection', () => {
					it( 'should be true if selection starts in the middle block of list item and spans multiple items', () => {
						setData( model, modelList( [
							'* 0',
							'* 1',
							'  [2',
							'* 3]',
							'  4'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );
				} );
			} );
		} );

		describe( 'execute()', () => {
			describe( 'single block per list item', () => {
				it( 'should use parent batch', () => {
					setData( model, modelList( [
						'* 0',
						'* 1',
						'  * 2',
						'    * 3',
						'    * 4',
						'  * []5',
						'* 6'
					] ) );

					model.change( writer => {
						expect( writer.batch.operations.length ).to.equal( 0 );

						command.execute();

						expect( writer.batch.operations.length ).to.be.above( 0 );
					} );
				} );

				it( 'should increment indent attribute by 1', () => {
					setData( model, modelList( [
						'* 0',
						'* 1',
						'  * 2',
						'    * 3',
						'    * 4',
						'  * []5',
						'* 6'
					] ) );

					command.execute();

					expect( getData( model ) ).to.equalMarkup( modelList( [
						'* 0',
						'* 1',
						'  * 2',
						'    * 3',
						'    * 4',
						'    * []5',
						'* 6'
					] ) );
				} );

				it( 'should increment indent of all sub-items of indented item', () => {
					setData( model, modelList( [
						'* 0',
						'* []1',
						'  * 2',
						'    * 3',
						'    * 4',
						'  * 5',
						'* 6'
					] ) );

					command.execute();

					expect( getData( model ) ).to.equalMarkup( modelList( [
						'* 0',
						'  * []1',
						'    * 2',
						'      * 3',
						'      * 4',
						'    * 5',
						'* 6'
					] ) );
				} );

				describe( 'mixed list types', () => {
					it( 'should not change list item type if the indented list item is the first one in the nested list (bulleted)', () => {
						setData( model, modelList( [
							'* 0',
							'* 1[]',
							'  # 2',
							'* 3'
						] ) );

						command.execute();

						expect( getData( model ) ).to.equalMarkup( modelList( [
							'* 0',
							'  * 1[]',
							'    # 2',
							'* 3'
						] ) );
					} );

					it( 'should not change list item type if the indented list item is the first one in the nested list (numbered)', () => {
						setData( model, modelList( [
							'# 0',
							'# 1[]',
							'  * 2',
							'# 3'
						] ) );

						command.execute();

						expect( getData( model ) ).to.equalMarkup( modelList( [
							'# 0',
							'  # 1[]',
							'    * 2',
							'# 3'
						] ) );
					} );

					it( 'should adjust list type to the previous list item (numbered)', () => {
						setData( model, modelList( [
							'* 0',
							'* 1',
							'  # 2',
							'* []3'
						] ) );

						command.execute();

						expect( getData( model ) ).to.equalMarkup( modelList( [
							'* 0',
							'* 1',
							'  # 2',
							'  # []3'
						] ) );
					} );

					it( 'should not change list item type if the indented list item is the first one in the nested list', () => {
						setData( model, modelList( [
							'* 0',
							'* []1',
							'  # 2',
							'    * 3',
							'  # 4'
						] ) );

						command.execute();

						expect( getData( model ) ).to.equalMarkup( modelList( [
							'* 0',
							'  * []1',
							'    # 2',
							'      * 3',
							'    # 4'
						] ) );
					} );

					it( 'should not change list item type if the first item in the nested list (has more items)', () => {
						setData( model, modelList( [
							'* 0',
							'* []1',
							'  # 2',
							'    * 3',
							'  # 4',
							'* 5',
							'  # 6'
						] ) );

						command.execute();

						expect( getData( model ) ).to.equalMarkup( modelList( [
							'* 0',
							'  * []1',
							'    # 2',
							'      * 3',
							'    # 4',
							'* 5',
							'  # 6'
						] ) );
					} );
				} );

				describe( 'non-collapsed selection', () => {
					it( 'should increment indent of all selected item when multiple items are selected', () => {
						setData( model, modelList( [
							'* 0',
							'* [1',
							'  * 2',
							'    * 3]',
							'    * 4',
							'  * 5',
							'* 6'
						] ) );

						command.execute();

						expect( getData( model ) ).to.equalMarkup( modelList( [
							'* 0',
							'  * [1',
							'    * 2',
							'      * 3]',
							'      * 4',
							'    * 5',
							'* 6'
						] ) );
					} );

					describe( 'mixed list types', () => {
						it( 'should not change list types for the first list items', () => {
							setData( model, modelList( [
								'* 0',
								'* [1',
								'  # 2]',
								'    * 3'
							] ) );

							command.execute();

							expect( getData( model ) ).to.equalMarkup( modelList( [
								'* 0',
								'  * [1',
								'    # 2]',
								'      * 3'
							] ) );
						} );

						it( 'should not change list types for the first list items (with nested lists)', () => {
							setData( model, modelList( [
								'* 0',
								'* [1',
								'  # 2]',
								'* 3'
							] ) );

							command.execute();

							expect( getData( model ) ).to.equalMarkup( modelList( [
								'* 0',
								'  * [1',
								'    # 2]',
								'* 3'
							] ) );
						} );

						it( 'should align the list type if become a part of other list (bulleted)', () => {
							setData( model, modelList( [
								'* 0',
								'* 1',
								'  # 2',
								'* [3',
								'* 4]'
							] ) );

							command.execute();

							expect( getData( model ) ).to.equalMarkup( modelList( [
								'* 0',
								'* 1',
								'  # 2',
								'  # [3',
								'  # 4]'
							] ) );
						} );

						it( 'should align the list type if become a part of other list (numbered)', () => {
							setData( model, modelList( [
								'* 0',
								'* 1',
								'  # 2',
								'  # [3',
								'* 4]'
							] ) );

							command.execute();

							expect( getData( model ) ).to.equalMarkup( modelList( [
								'* 0',
								'* 1',
								'  # 2',
								'    # [3',
								'  # 4]'
							] ) );
						} );

						it( 'should align the list type (bigger structure)', () => {
							setData( model, modelList( [
								'* 0',
								'* 1',
								'  # 2',
								'    * 3',
								'    * [4',
								'  # 5',
								'    * 6',
								'  # 7]'
							] ) );

							command.execute();

							expect( getData( model ) ).to.equalMarkup( modelList( [
								'* 0',
								'* 1',
								'  # 2',
								'    * 3',
								'      * [4',
								'    * 5',
								'      * 6',
								'    * 7]'
							] ) );
						} );
					} );
				} );

				it( 'should fire "afterExecute" event after finish all operations with all changed items', done => {
					setData( model, modelList( [
						'* 0',
						'* []1',
						'  * 2',
						'    * 3',
						'    * 4',
						'  * 5',
						'* 6'
					] ) );

					command.on( 'afterExecute', ( evt, data ) => {
						expect( data ).to.deep.equal( [
							root.getChild( 1 ),
							root.getChild( 2 ),
							root.getChild( 3 ),
							root.getChild( 4 ),
							root.getChild( 5 )
						] );

						done();
					} );

					command.execute();
				} );
			} );

			describe( 'multiple blocks per list item', () => {
				it( 'should change indent of all blocks of a list item', () => {
					setData( model, modelList( [
						'* 0',
						'* []1',
						'  2',
						'  3',
						'* 4'
					] ) );

					command.execute();

					expect( getData( model ) ).to.equalMarkup( modelList( [
						'* 0',
						'  * []1',
						'    2',
						'    3',
						'* 4'
					] ) );
				} );

				it( 'should change indent (with new ID) if the following block of bigger list item is selected', () => {
					setData( model, modelList( [
						'* 0',
						'* 1',
						'  []2',
						'  3',
						'* 4'
					] ) );

					stubUid();
					command.isEnabled = true;
					command.execute();

					expect( getData( model ) ).to.equalMarkup(
						'<paragraph listIndent="0" listItemId="000" listType="bulleted">0</paragraph>' +
						'<paragraph listIndent="0" listItemId="001" listType="bulleted">1</paragraph>' +
						'<paragraph listIndent="1" listItemId="a00" listType="bulleted">[]2</paragraph>' +
						'<paragraph listIndent="0" listItemId="001" listType="bulleted">3</paragraph>' +
						'<paragraph listIndent="0" listItemId="004" listType="bulleted">4</paragraph>'
					);
				} );

				it( 'should increment indent of all sub-items of indented item', () => {
					setData( model, modelList( [
						'* 0',
						'* []1',
						'  * 2',
						'    * 3',
						'      4',
						'  * 5',
						'  6',
						'* 7'
					] ) );

					command.execute();

					expect( getData( model ) ).to.equalMarkup( modelList( [
						'* 0',
						'  * []1',
						'    * 2',
						'      * 3',
						'        4',
						'    * 5',
						'    6',
						'* 7'
					] ) );
				} );

				it( 'should increment indent of all sub-items of indented item (at end of list item)', () => {
					setData( model, modelList( [
						'* 0',
						'* []1',
						'  2',
						'  * 3',
						'    * 4',
						'      5',
						'  * 6',
						'* 7'
					] ) );

					command.execute();

					expect( getData( model ) ).to.equalMarkup( modelList( [
						'* 0',
						'  * []1',
						'    2',
						'    * 3',
						'      * 4',
						'        5',
						'    * 6',
						'* 7'
					] ) );
				} );

				it( 'should increment indent of all selected list items when multiple items are selected partially', () => {
					setData( model, modelList( [
						'* 0',
						'* 1',
						'  [2',
						'* 3]',
						'  4',
						'* 5'
					] ) );

					command.execute();

					expect( getData( model ) ).to.equalMarkup( modelList( [
						'* 0',
						'  * 1',
						'    [2',
						'  * 3]',
						'    4',
						'* 5'
					] ) );
				} );

				it( 'should not increment indent of items from the following list even if it was selected', () => {
					setData( model, modelList( [
						'* 0',
						'* [1',
						'2',
						'* 3]',
						'* 4'
					] ) );

					command.execute();

					expect( getData( model ) ).to.equalMarkup( modelList( [
						'* 0',
						'  * [1',
						'2',
						'* 3]',
						'* 4'
					] ) );
				} );

				it( 'should fire "afterExecute" event after finish all operations with all changed items', done => {
					setData( model, modelList( [
						'* 0',
						'* []1',
						'  * 2',
						'    * 3',
						'    * 4',
						'  * 5',
						'* 6'
					] ) );

					command.on( 'afterExecute', ( evt, data ) => {
						expect( data ).to.deep.equal( [
							root.getChild( 1 ),
							root.getChild( 2 ),
							root.getChild( 3 ),
							root.getChild( 4 ),
							root.getChild( 5 )
						] );

						done();
					} );

					command.execute();
				} );

				it( 'should align the list item type after indenting a following block of a list item (numbered)', () => {
					setData( model, modelList( [
						'* 0',
						'  # 1',
						'    * 2',
						'    3[]',
						'* 4'
					] ) );

					stubUid();
					command.execute();

					expect( getData( model ) ).to.equalMarkup( modelList( [
						'* 0',
						'  # 1',
						'    * 2',
						'    * 3[] {id:a00}',
						'* 4'
					] ) );
				} );

				it( 'should align the list item type after indenting a following block of a list item (bulleted)', () => {
					setData( model, modelList( [
						'# 0',
						'  * 1',
						'    # 2',
						'    3[]',
						'# 4'
					] ) );

					stubUid();
					command.execute();

					expect( getData( model ) ).to.equalMarkup( modelList( [
						'# 0',
						'  * 1',
						'    # 2',
						'    # 3[] {id:a00}',
						'# 4'
					] ) );
				} );

				it( 'should align the list item type after indenting a following block of a list item (bigger structure)', () => {
					setData( model, modelList( [
						'* 0',
						'  # 1',
						'    * 2',
						'    3',
						'    4[]'
					] ) );

					stubUid();
					command.execute();

					expect( getData( model ) ).to.equalMarkup( modelList( [
						'* 0',
						'  # 1',
						'    * 2',
						'    3',
						'    # 4[] {id:a00}'
					] ) );
				} );

				it( 'should align the list item type after indenting the last block of a list item', () => {
					setData( model, modelList( [
						'* 0',
						'  # 1',
						'  2[]'
					] ) );

					stubUid();
					command.execute();

					expect( getData( model ) ).to.equalMarkup( modelList( [
						'* 0',
						'  # 1',
						'  # 2[] {id:a00}'
					] ) );
				} );
			} );
		} );
	} );

	describe( 'backward (outdent)', () => {
		let command;

		beforeEach( () => {
			command = new ListIndentCommand( editor, 'backward' );
		} );

		afterEach( () => {
			command.destroy();
		} );

		describe( 'isEnabled', () => {
			it( 'should be true if selection starts in list item', () => {
				setData( model, modelList( [
					'* 0',
					'* 1',
					'  * 2',
					'    * 3',
					'    * 4',
					'  * []5',
					'* 6'
				] ) );

				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be true if selection starts in first list item', () => {
				setData( model, modelList( [
					'* []0',
					'* 1',
					'  * 2',
					'    * 3',
					'    * 4',
					'  * 5',
					'* 6'
				] ) );

				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be true if selection starts in a list item that has higher indent than it\'s previous sibling', () => {
				setData( model, modelList( [
					'* 0',
					'* 1',
					'  * []2',
					'    * 3',
					'    * 4',
					'  * 5',
					'* 6'
				] ) );

				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be false if selection starts before a list', () => {
				setData( model, modelList( [
					'[0',
					'* 1]',
					'  * 2'
				] ) );

				expect( command.isEnabled ).to.be.false;
			} );

			it( 'should be true with selection in the middle block of a list item', () => {
				setData( model, modelList( [
					'* 0',
					'  []1',
					'  2'
				] ) );

				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be true with selection in the last block of a list item', () => {
				setData( model, modelList( [
					'* 0',
					'  1',
					'  []2'
				] ) );

				expect( command.isEnabled ).to.be.true;
			} );
		} );

		describe( 'execute()', () => {
			it( 'should decrement indent attribute by 1 (if it is higher than 0)', () => {
				setData( model, modelList( [
					'* 0',
					'* 1',
					'  * 2',
					'    * 3',
					'    * 4',
					'  * []5',
					'* 6'
				] ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelList( [
					'* 0',
					'* 1',
					'  * 2',
					'    * 3',
					'    * 4',
					'* []5',
					'* 6'
				] ) );
			} );

			it( 'should remove list attributes (if indent is less than to 0)', () => {
				setData( model, modelList( [
					'* []0',
					'* 1',
					'  * 2',
					'    * 3',
					'    * 4',
					'  * 5',
					'* 6'
				] ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelList( [
					'[]0',
					'* 1',
					'  * 2',
					'    * 3',
					'    * 4',
					'  * 5',
					'* 6'
				] ) );
			} );

			it( 'should decrement indent of all sub-items of outdented item', () => {
				setData( model, modelList( [
					'* 0',
					'* []1',
					'  * 2',
					'    * 3',
					'    * 4',
					'  * 5',
					'* 6'
				] ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelList( [
					'* 0',
					'[]1',
					'* 2',
					'  * 3',
					'  * 4',
					'* 5',
					'* 6'
				] ) );
			} );

			it( 'should outdent all selected item when multiple items are selected', () => {
				setData( model, modelList( [
					'* 0',
					'* [1',
					'  * 2',
					'    * 3]',
					'    * 4',
					'  * 5',
					'* 6'
				] ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelList( [
					'* 0',
					'[1',
					'* 2',
					'  * 3]',
					'  * 4',
					'* 5',
					'* 6'
				] ) );
			} );

			it( 'should outdent all blocks of partly selected item when multiple items are selected', () => {
				setData( model, modelList( [
					'* 0',
					'  * 1',
					'    [2',
					'    * 3]',
					'      4',
					'  * 5',
					'* 6'
				] ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelList( [
					'* 0',
					'* 1',
					'  [2',
					'  * 3]',
					'    4',
					'  * 5',
					'* 6'
				] ) );
			} );

			it( 'should split list item if selection is in the following list item block', () => {
				setData( model, modelList( [
					'* 0',
					'  []1',
					'  2',
					'* 3'
				] ) );

				stubUid();
				command.execute();

				expect( getData( model ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemId="000" listType="bulleted">0</paragraph>' +
					'<paragraph listIndent="0" listItemId="a00" listType="bulleted">[]1</paragraph>' +
					'<paragraph listIndent="0" listItemId="a00" listType="bulleted">2</paragraph>' +
					'<paragraph listIndent="0" listItemId="003" listType="bulleted">3</paragraph>'
				);
			} );

			it( 'should split list item if selection is in the last list item block', () => {
				setData( model, modelList( [
					'* 0',
					'  1',
					'  []2',
					'* 3'
				] ) );

				stubUid();
				command.execute();

				expect( getData( model ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemId="000" listType="bulleted">0</paragraph>' +
					'<paragraph listIndent="0" listItemId="000" listType="bulleted">1</paragraph>' +
					'<paragraph listIndent="0" listItemId="a00" listType="bulleted">[]2</paragraph>' +
					'<paragraph listIndent="0" listItemId="003" listType="bulleted">3</paragraph>'
				);
			} );

			it( 'should merge item if parent has more following blocks', () => {
				setData( model, modelList( [
					'* 0',
					'  * []1',
					'  2'
				] ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelList( [
					'* 0',
					'  []1',
					'  2'
				] ) );
			} );

			it( 'should not merge item if parent has no more following blocks', () => {
				setData( model, modelList( [
					'* 0',
					'  * []1',
					'* 2'
				] ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelList( [
					'* 0',
					'* []1',
					'* 2'
				] ) );
			} );

			it( 'should handle higher indent drop between items', () => {
				setData( model, modelList( [
					'* 0',
					'  * 1',
					'    * 2',
					'      * [3',
					'  * 4]',
					'  * 5'
				] ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelList( [
					'* 0',
					'  * 1',
					'    * 2',
					'    * [3',
					'* 4]',
					'  * 5'
				] ) );
			} );

			it( 'should align a list item type after outdenting item', () => {
				setData( model, modelList( [
					'* 0',
					'* 1',
					'  # 2[]',
					'* 3'
				] ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelList( [
					'* 0',
					'* 1',
					'* 2[]',
					'* 3'
				] ) );
			} );

			it( 'should align a list item type after outdenting the last list item', () => {
				setData( model, modelList( [
					'# 0',
					'  * 1',
					'  * 2[]',
					'# 3'
				] ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelList( [
					'# 0',
					'  * 1',
					'# 2[]',
					'# 3'
				] ) );
			} );

			it( 'should align the list item type after the more indented item', () => {
				setData( model, modelList( [
					'* 0',
					'* 1',
					'  # 2',
					'    * 3',
					'  # 4[]'
				] ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelList( [
					'* 0',
					'* 1',
					'  # 2',
					'    * 3',
					'* 4[]'
				] ) );
			} );

			it( 'should outdent the whole nested list (and align appropriate list item types)', () => {
				setData( model, modelList( [
					'* 0',
					'  # []1',
					'    # 2',
					'      * 3',
					'    # 4',
					'* 5',
					'  # 6'
				] ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelList( [
					'* 0',
					'* []1',
					'  # 2',
					'    * 3',
					'  # 4',
					'* 5',
					'  # 6'
				] ) );
			} );

			it( 'should align list item typed after outdenting a bigger structure', () => {
				setData( model, modelList( [
					'* 0',
					'* 1',
					'  # 2',
					'    * 3',
					'      # [4',
					'    * 5',
					'      # 6',
					'    * 7]'
				] ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelList( [
					'* 0',
					'* 1',
					'  # 2',
					'    * 3',
					'    * [4',
					'  # 5',
					'    # 6',
					'  # 7]'
				] ) );
			} );
		} );
	} );
} );
