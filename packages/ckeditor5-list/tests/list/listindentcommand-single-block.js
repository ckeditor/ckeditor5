/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import ListEditing from '../../src/list/listediting.js';
import ListIndentCommand from '../../src/list/listindentcommand.js';
import stubUid from './_utils/uid.js';
import { modelList } from './_utils/utils.js';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

describe( 'ListIndentCommand (multiBlock=false)', () => {
	let editor, model, root;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [ ListEditing, Paragraph ],
			list: {
				multiBlock: false
			}
		} );

		model = editor.model;
		root = model.document.getRoot();

		stubUid();
		modelList.defaultBlock = 'listItem';
	} );

	afterEach( async () => {
		modelList.defaultBlock = 'paragraph';
		await editor.destroy();
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

		describe( 'execute()', () => {
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
