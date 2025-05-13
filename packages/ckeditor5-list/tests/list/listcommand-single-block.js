/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import ListCommand from '../../src/list/listcommand.js';
import ListEditing from '../../src/list/listediting.js';

import stubUid from './_utils/uid.js';
import { modelList } from './_utils/utils.js';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

describe( 'ListCommand (multiBlock=false)', () => {
	let editor, command, model, root, changedBlocks;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [ Paragraph, ListEditing ],
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

	describe( 'bulleted', () => {
		beforeEach( () => {
			command = new ListCommand( editor, 'bulleted' );

			command.on( 'afterExecute', ( evt, data ) => {
				changedBlocks = data;
			} );
		} );

		afterEach( () => {
			command.destroy();
		} );

		describe( 'constructor()', () => {
			it( 'should create list command with given type and value set to false', () => {
				setData( model, '<paragraph>[]</paragraph>' );

				expect( command.type ).to.equal( 'bulleted' );
				expect( command.value ).to.be.false;
			} );
		} );

		describe( 'value', () => {
			it( 'should be false if first position in selection is not in a list item', () => {
				setData( model, modelList( [
					'0[]',
					'* 1'
				] ) );

				expect( command.value ).to.be.false;
			} );

			it( 'should be false if first position in selection is in a list item of different type', () => {
				setData( model, modelList( [
					'# 0[]',
					'# 1'
				] ) );

				expect( command.value ).to.be.false;
			} );

			it( 'should be false if any of selected blocks is not a list item (non-list after list)', () => {
				setData( model, modelList( [
					'* [0',
					'1]'
				] ) );

				expect( command.value ).to.be.false;
			} );

			it( 'should be false if any of selected blocks is not a list item (non-list before list)', () => {
				setData( model, modelList( [
					'[0',
					'* 1]'
				] ) );

				expect( command.value ).to.be.false;
			} );

			it( 'should be false if any of selected blocks is not a list item (non-list between lists)', () => {
				setData( model, modelList( [
					'* [0',
					'1',
					'* 2]'
				] ) );

				expect( command.value ).to.be.false;
			} );

			it( 'should be false if any of selected blocks is not a same type list item', () => {
				setData( model, modelList( [
					'* [0',
					'# 1]'
				] ) );

				expect( command.value ).to.be.false;
			} );

			it( 'should be true if first position in selection is in a list item of same type', () => {
				setData( model, modelList( [
					'* 0[]',
					'* 1'
				] ) );

				expect( command.value ).to.be.true;
			} );

			it( 'should be true if first position in selection is in a following block of the list item', () => {
				setData( model, modelList( [
					'* 0',
					'  1[]'
				] ) );

				expect( command.value ).to.be.true;
			} );
		} );

		describe( 'isEnabled', () => {
			it( 'should be true if entire selection is in a list', () => {
				setData( model, modelList( [ '* [a]' ] ) );
				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be true if entire selection is in a block which can be turned into a list', () => {
				setData( model, '<paragraph>[a]</paragraph>' );
				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be true if any of the selected blocks can be converted to a list (the last element does not allow)', () => {
				model.schema.register( 'block', { inheritAllFrom: '$blockObject' } );
				editor.conversion.elementToElement( { model: 'block', view: 'div' } );

				setData( model,
					'<paragraph>[a</paragraph>' +
					'<block></block>]'
				);

				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be true if any of the selected blocks can be converted to a list (the first element does not allow)', () => {
				model.schema.register( 'block', { inheritAllFrom: '$blockObject' } );
				editor.conversion.elementToElement( { model: 'block', view: 'div' } );

				setData( model,
					'[<block></block>' +
					'<paragraph>b]</paragraph>'
				);

				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be false if all of the selected blocks cannot be converted to a list', () => {
				model.schema.register( 'block', { inheritAllFrom: '$blockObject' } );
				editor.conversion.elementToElement( { model: 'block', view: 'div' } );

				setData( model,
					'[<block></block>]' +
					'<paragraph>b</paragraph>'
				);

				expect( command.isEnabled ).to.be.false;
			} );
		} );

		describe( 'execute()', () => {
			it( 'should use parent batch', () => {
				setData( model, '<paragraph>[0]</paragraph>' );

				model.change( writer => {
					expect( writer.batch.operations.length, 'before' ).to.equal( 0 );

					command.execute();

					expect( writer.batch.operations.length, 'after' ).to.be.above( 0 );
				} );
			} );

			describe( 'options.forceValue', () => {
				it( 'should force converting into the list if the `options.forceValue` is set to `true`', () => {
					setData( model, modelList( [
						'fo[]o'
					] ) );

					command.execute( { forceValue: true } );

					expect( getData( model ) ).to.equalMarkup( modelList( [
						'* fo[]o {id:a00}'
					] ) );
				} );

				it( 'should not modify list item if not needed if the list if the `options.forceValue` is set to `true`', () => {
					setData( model, modelList( [
						'* fo[]o'
					] ) );

					command.execute( { forceValue: true } );

					expect( getData( model ) ).to.equalMarkup( modelList( [
						'* fo[]o'
					] ) );
				} );

				it( 'should force converting into the paragraph if the `options.forceValue` is set to `false`', () => {
					setData( model, modelList( [
						'* fo[]o'
					] ) );

					command.execute( { forceValue: false } );

					expect( getData( model ) ).to.equalMarkup( modelList( [
						'fo[]o'
					] ) );
				} );

				it( 'should not modify list item if not needed if the `options.forceValue` is set to `false`', () => {
					setData( model, modelList( [
						'fo[]o'
					] ) );

					command.execute( { forceValue: false } );

					expect( getData( model ) ).to.equalMarkup( modelList( [
						'fo[]o'
					] ) );
				} );
			} );

			describe( 'when turning on', () => {
				it( 'should turn the closest block into a list item', () => {
					setData( model, '<paragraph>fo[]o</paragraph>' );

					command.execute();

					expect( getData( model ) ).to.equalMarkup( modelList( [
						'* fo[]o {id:a00}'
					] ) );

					expect( changedBlocks ).to.deep.equal( [
						root.getChild( 0 )
					] );
				} );

				it( 'should change the type of an existing (closest) list item', () => {
					setData( model, modelList( [
						'# fo[]o'
					] ) );

					command.execute();

					expect( getData( model ) ).to.equalMarkup( modelList( [
						'* fo[]o'
					] ) );

					expect( changedBlocks ).to.deep.equal( [
						root.getChild( 0 )
					] );
				} );

				it( 'should make a list items from multiple paragraphs', () => {
					setData( model, modelList( [
						'fo[o',
						'ba]r'
					] ) );

					command.execute();

					expect( getData( model ) ).to.equalMarkup( modelList( [
						'* fo[o {id:a00}',
						'* ba]r {id:a01}'
					] ) );

					expect( changedBlocks.length ).to.equal( 2 );
					expect( changedBlocks ).to.deep.equal( [
						root.getChild( 0 ),
						root.getChild( 1 )
					] );
				} );

				it( 'should make a list items from multiple paragraphs mixed with list items', () => {
					setData( model, modelList( [
						'a',
						'[b',
						'* c',
						'd]',
						'e'
					] ) );

					command.execute();

					expect( getData( model ) ).to.equalMarkup( modelList( [
						'a',
						'* [b {id:a00}',
						'* c',
						'* d] {id:a01}',
						'e'
					] ) );

					expect( changedBlocks.length ).to.equal( 2 );
					expect( changedBlocks ).to.deep.equal( [
						root.getChild( 1 ),
						root.getChild( 3 )
					] );
				} );

				it( 'should not change type of nested list if parent is selected', () => {
					setData( model, modelList( [
						'# [a',
						'# b]',
						'  # c',
						'# d'
					] ) );

					command.execute();

					expect( getData( model ) ).to.equalMarkup( modelList( [
						'* [a',
						'* b]',
						'  # c',
						'# d'
					] ) );

					expect( changedBlocks.length ).to.equal( 2 );
					expect( changedBlocks ).to.deep.equal( [
						root.getChild( 0 ),
						root.getChild( 1 )
					] );
				} );

				it( 'should change the type of the whole list if the selection is collapsed (bulleted lists at the boundaries)', () => {
					setData( model, modelList( [
						'* a',
						'# b[]',
						'  # c',
						'# d',
						'* e'
					] ) );

					command.execute();

					expect( getData( model ) ).to.equalMarkup( modelList( [
						'* a',
						'* b[]',
						'  # c',
						'* d',
						'* e'
					] ) );

					expect( changedBlocks.length ).to.equal( 2 );
					expect( changedBlocks ).to.deep.equal( [
						root.getChild( 1 ),
						root.getChild( 3 )
					] );
				} );
			} );

			describe( 'when turning off', () => {
				it( 'should strip the list attributes from the closest list item (single list item)', () => {
					setData( model, modelList( [
						'* fo[]o'
					] ) );

					command.execute();

					expect( getData( model ) ).to.equalMarkup( modelList( [
						'fo[]o'
					] ) );

					expect( changedBlocks.length ).to.equal( 1 );
					expect( changedBlocks ).to.deep.equal( [
						root.getChild( 0 )
					] );
				} );

				it( 'should strip the list attributes from the closest item (multiple list items, selection in first item)', () => {
					setData( model, modelList( [
						'* f[]oo',
						'* bar',
						'* baz'
					] ) );

					command.execute();

					expect( getData( model ) ).to.equalMarkup( modelList( [
						'f[]oo',
						'* bar',
						'* baz'
					] ) );

					expect( changedBlocks.length ).to.equal( 1 );
					expect( changedBlocks ).to.deep.equal( [
						root.getChild( 0 )
					] );
				} );

				it( 'should strip the list attributes from the closest item (multiple list items, selection in the middle item)', () => {
					setData( model, modelList( [
						'* foo',
						'* b[]ar',
						'* baz'
					] ) );

					command.execute();

					expect( getData( model ) ).to.equalMarkup( modelList( [
						'* foo',
						'b[]ar',
						'* baz'
					] ) );

					expect( changedBlocks.length ).to.equal( 1 );
					expect( changedBlocks ).to.deep.equal( [
						root.getChild( 1 )
					] );
				} );

				it( 'should strip the list attributes from the closest item (multiple list items, selection in the last item)', () => {
					setData( model, modelList( [
						'* foo',
						'* bar',
						'* b[]az'
					] ) );

					command.execute();

					expect( getData( model ) ).to.equalMarkup( modelList( [
						'* foo',
						'* bar',
						'b[]az'
					] ) );

					expect( changedBlocks.length ).to.equal( 1 );
					expect( changedBlocks ).to.deep.equal( [
						root.getChild( 2 )
					] );
				} );

				describe( 'with nested lists inside', () => {
					it( 'should strip the list attributes from the closest item and decrease indent of children (first item)', () => {
						setData( model, modelList( [
							'* f[]oo',
							'  * bar',
							'  * baz',
							'    * qux'
						] ) );

						command.execute();

						expect( getData( model ) ).to.equalMarkup( modelList( [
							'f[]oo',
							'* bar',
							'* baz',
							'  * qux'
						] ) );

						expect( changedBlocks.length ).to.equal( 4 );
						expect( changedBlocks ).to.deep.equal( [
							root.getChild( 0 ),
							root.getChild( 1 ),
							root.getChild( 2 ),
							root.getChild( 3 )
						] );
					} );

					it( 'should strip the list attributes from the closest item and decrease indent of children (middle item)', () => {
						setData( model, modelList( [
							'* foo',
							'* b[]ar',
							'  * baz',
							'    * qux'
						] ) );

						command.execute();

						expect( getData( model ) ).to.equalMarkup( modelList( [
							'* foo',
							'b[]ar',
							'* baz',
							'  * qux'
						] ) );

						expect( changedBlocks.length ).to.equal( 3 );
						expect( changedBlocks ).to.deep.equal( [
							root.getChild( 1 ),
							root.getChild( 2 ),
							root.getChild( 3 )
						] );
					} );

					it( 'should strip the list attributes from the selected items and decrease indent of nested list', () => {
						/* eslint-disable @stylistic/no-multi-spaces */
						setData( model, modelList( [
							'0',
							'* 1',
							'  * 2',
							'    * 3[]', 		// <- this is turned off.
							'      * 4', 		// <- this has to become indent = 0, because it will be first item on a new list.
							'        * 5', 		// <- this should be still be a child of item above, so indent = 1.
							'    * 6', 			// <- this has to become indent = 0, because it should not be a child of any of items above.
							'      * 7', 		// <- this should be still be a child of item above, so indent = 1.
							'  * 8', 			// <- this has to become indent = 0.
							'    * 9', 			// <- this should still be a child of item above, so indent = 1.
							'      * 10', 		// <- this should still be a child of item above, so indent = 2.
							'      * 11', 		// <- this should still be at the same level as item above, so indent = 2.
							'* 12', 			// <- this and all below are left unchanged.
							'  * 13',
							'    * 14'
						] ) );
						/* eslint-enable @stylistic/no-multi-spaces */

						command.execute();

						expect( getData( model ) ).to.equalMarkup( modelList( [
							'0',
							'* 1',
							'  * 2',
							'3[]',
							'* 4',
							'  * 5',
							'* 6',
							'  * 7',
							'* 8',
							'  * 9',
							'    * 10',
							'    * 11',
							'* 12',
							'  * 13',
							'    * 14'
						] ) );

						expect( changedBlocks.length ).to.equal( 9 );
						expect( changedBlocks ).to.deep.equal( [
							root.getChild( 3 ),
							root.getChild( 4 ),
							root.getChild( 5 ),
							root.getChild( 6 ),
							root.getChild( 7 ),
							root.getChild( 8 ),
							root.getChild( 9 ),
							root.getChild( 10 ),
							root.getChild( 11 )
						] );
					} );
				} );
			} );
		} );
	} );

	describe( 'numbered', () => {
		beforeEach( () => {
			command = new ListCommand( editor, 'numbered' );

			command.on( 'afterExecute', ( evt, data ) => {
				changedBlocks = data;
			} );
		} );

		afterEach( () => {
			command.destroy();
		} );

		describe( 'constructor()', () => {
			it( 'should create list command with given type and value set to false', () => {
				setData( model, '<paragraph>[]</paragraph>' );

				expect( command.type ).to.equal( 'numbered' );
				expect( command.value ).to.be.false;
			} );
		} );

		describe( 'value', () => {
			it( 'should be false if first position in selection is not in a list item', () => {
				setData( model, modelList( [
					'0[]',
					'# 1'
				] ) );

				expect( command.value ).to.be.false;
			} );

			it( 'should be false if first position in selection is in a list item of different type', () => {
				setData( model, modelList( [
					'* 0[]',
					'* 1'
				] ) );

				expect( command.value ).to.be.false;
			} );

			it( 'should be false if any of selected blocks is not a list item (non-list after list)', () => {
				setData( model, modelList( [
					'# [0',
					'1]'
				] ) );

				expect( command.value ).to.be.false;
			} );

			it( 'should be false if any of selected blocks is not a list item (non-list before list)', () => {
				setData( model, modelList( [
					'[0',
					'# 1]'
				] ) );

				expect( command.value ).to.be.false;
			} );

			it( 'should be false if any of selected blocks is not a list item (non-list between lists)', () => {
				setData( model, modelList( [
					'# [0',
					'1',
					'# 2]'
				] ) );

				expect( command.value ).to.be.false;
			} );

			it( 'should be false if any of selected blocks is not a same type list item', () => {
				setData( model, modelList( [
					'# [0',
					'* 1]'
				] ) );

				expect( command.value ).to.be.false;
			} );

			it( 'should be true if first position in selection is in a list item of same type', () => {
				setData( model, modelList( [
					'# 0[]',
					'# 1'
				] ) );

				expect( command.value ).to.be.true;
			} );

			it( 'should be true if first position in selection is in a following block of the list item', () => {
				setData( model, modelList( [
					'# 0',
					'  1[]'
				] ) );

				expect( command.value ).to.be.true;
			} );
		} );

		describe( 'isEnabled', () => {
			it( 'should be true if entire selection is in a list', () => {
				setData( model, modelList( [ '# [a]' ] ) );
				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be true if entire selection is in a block which can be turned into a list', () => {
				setData( model, '<paragraph>[a]</paragraph>' );
				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be true if any of the selected blocks can be converted into a list (the last element does not allow)', () => {
				model.schema.register( 'block', { inheritAllFrom: '$blockObject' } );
				editor.conversion.elementToElement( { model: 'block', view: 'div' } );

				setData( model,
					'<paragraph>[a</paragraph>' +
					'<block></block>]'
				);

				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be true if any of the selected blocks acan be converted into a list (the first element does not allow)', () => {
				model.schema.register( 'block', { inheritAllFrom: '$blockObject' } );
				editor.conversion.elementToElement( { model: 'block', view: 'div' } );

				setData( model,
					'[<block></block>' +
					'<paragraph>b]</paragraph>'
				);

				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be false if all of the selected blocks do not allow converting to a list', () => {
				model.schema.register( 'block', { inheritAllFrom: '$blockObject' } );
				editor.conversion.elementToElement( { model: 'block', view: 'div' } );

				setData( model,
					'[<block></block>]' +
					'<paragraph>b</paragraph>'
				);

				expect( command.isEnabled ).to.be.false;
			} );
		} );

		describe( 'execute()', () => {
			it( 'should use parent batch', () => {
				setData( model, '<paragraph>[0]</paragraph>' );

				model.change( writer => {
					expect( writer.batch.operations.length, 'before' ).to.equal( 0 );

					command.execute();

					expect( writer.batch.operations.length, 'after' ).to.be.above( 0 );
				} );
			} );

			describe( 'options.forceValue', () => {
				it( 'should force converting into the list if the `options.forceValue` is set to `true`', () => {
					setData( model, modelList( [
						'fo[]o'
					] ) );

					command.execute( { forceValue: true } );

					expect( getData( model ) ).to.equalMarkup( modelList( [
						'# fo[]o {id:a00}'
					] ) );
				} );

				it( 'should not modify list item if not needed if the list if the `options.forceValue` is set to `true`', () => {
					setData( model, modelList( [
						'# fo[]o'
					] ) );

					command.execute( { forceValue: true } );

					expect( getData( model ) ).to.equalMarkup( modelList( [
						'# fo[]o'
					] ) );
				} );

				it( 'should force converting into the paragraph if the `options.forceValue` is set to `false`', () => {
					setData( model, modelList( [
						'# fo[]o'
					] ) );

					command.execute( { forceValue: false } );

					expect( getData( model ) ).to.equalMarkup( modelList( [
						'fo[]o'
					] ) );
				} );

				it( 'should not modify list item if not needed if the `options.forceValue` is set to `false`', () => {
					setData( model, modelList( [
						'fo[]o'
					] ) );

					command.execute( { forceValue: false } );

					expect( getData( model ) ).to.equalMarkup( modelList( [
						'fo[]o'
					] ) );
				} );
			} );

			describe( 'when turning on', () => {
				it( 'should turn the closest block into a list item', () => {
					setData( model, '<paragraph>fo[]o</paragraph>' );

					command.execute();

					expect( getData( model ) ).to.equalMarkup( modelList( [
						'# fo[]o {id:a00}'
					] ) );

					expect( changedBlocks ).to.deep.equal( [
						root.getChild( 0 )
					] );
				} );

				it( 'should change the type of an existing (closest) list item', () => {
					setData( model, modelList( [
						'* fo[]o'
					] ) );

					command.execute();

					expect( getData( model ) ).to.equalMarkup( modelList( [
						'# fo[]o'
					] ) );

					expect( changedBlocks ).to.deep.equal( [
						root.getChild( 0 )
					] );
				} );

				it( 'should make a list items from multiple paragraphs', () => {
					setData( model, modelList( [
						'fo[o',
						'ba]r'
					] ) );

					command.execute();

					expect( getData( model ) ).to.equalMarkup( modelList( [
						'# fo[o {id:a00}',
						'# ba]r {id:a01}'
					] ) );

					expect( changedBlocks.length ).to.equal( 2 );
					expect( changedBlocks ).to.deep.equal( [
						root.getChild( 0 ),
						root.getChild( 1 )
					] );
				} );

				it( 'should make a list items from multiple paragraphs mixed with list items', () => {
					setData( model, modelList( [
						'a',
						'[b',
						'# c',
						'd]',
						'e'
					] ) );

					command.execute();

					expect( getData( model ) ).to.equalMarkup( modelList( [
						'a',
						'# [b {id:a00}',
						'# c',
						'# d] {id:a01}',
						'e'
					] ) );

					expect( changedBlocks.length ).to.equal( 2 );
					expect( changedBlocks ).to.deep.equal( [
						root.getChild( 1 ),
						root.getChild( 3 )
					] );
				} );

				it( 'should not change type of nested list if parent is selected', () => {
					setData( model, modelList( [
						'* [a',
						'* b]',
						'  * c',
						'* d'
					] ) );

					command.execute();

					expect( getData( model ) ).to.equalMarkup( modelList( [
						'# [a',
						'# b]',
						'  * c',
						'* d'
					] ) );

					expect( changedBlocks.length ).to.equal( 2 );
					expect( changedBlocks ).to.deep.equal( [
						root.getChild( 0 ),
						root.getChild( 1 )
					] );
				} );

				it( 'should change the type of the whole list if the selection is collapsed (bulleted lists at the boundaries)', () => {
					setData( model, modelList( [
						'# a',
						'* b[]',
						'  * c',
						'* d',
						'# e'
					] ) );

					command.execute();

					expect( getData( model ) ).to.equalMarkup( modelList( [
						'# a',
						'# b[]',
						'  * c',
						'# d',
						'# e'
					] ) );

					expect( changedBlocks.length ).to.equal( 2 );
					expect( changedBlocks ).to.deep.equal( [
						root.getChild( 1 ),
						root.getChild( 3 )
					] );
				} );
			} );

			describe( 'when turning off', () => {
				it( 'should strip the list attributes from the closest list item (single list item)', () => {
					setData( model, modelList( [
						'# fo[]o'
					] ) );

					command.execute();

					expect( getData( model ) ).to.equalMarkup( modelList( [
						'fo[]o'
					] ) );

					expect( changedBlocks.length ).to.equal( 1 );
					expect( changedBlocks ).to.deep.equal( [
						root.getChild( 0 )
					] );
				} );

				it( 'should strip the list attributes from the closest item (multiple list items, selection in first item)', () => {
					setData( model, modelList( [
						'# f[]oo',
						'# bar',
						'# baz'
					] ) );

					command.execute();

					expect( getData( model ) ).to.equalMarkup( modelList( [
						'f[]oo',
						'# bar',
						'# baz'
					] ) );

					expect( changedBlocks.length ).to.equal( 1 );
					expect( changedBlocks ).to.deep.equal( [
						root.getChild( 0 )
					] );
				} );

				it( 'should strip the list attributes from the closest item (multiple list items, selection in the middle item)', () => {
					setData( model, modelList( [
						'# foo',
						'# b[]ar',
						'# baz'
					] ) );

					command.execute();

					expect( getData( model ) ).to.equalMarkup( modelList( [
						'# foo',
						'b[]ar',
						'# baz'
					] ) );

					expect( changedBlocks.length ).to.equal( 1 );
					expect( changedBlocks ).to.deep.equal( [
						root.getChild( 1 )
					] );
				} );

				it( 'should strip the list attributes from the closest item (multiple list items, selection in the last item)', () => {
					setData( model, modelList( [
						'# foo',
						'# bar',
						'# b[]az'
					] ) );

					command.execute();

					expect( getData( model ) ).to.equalMarkup( modelList( [
						'# foo',
						'# bar',
						'b[]az'
					] ) );

					expect( changedBlocks.length ).to.equal( 1 );
					expect( changedBlocks ).to.deep.equal( [
						root.getChild( 2 )
					] );
				} );

				describe( 'with nested lists inside', () => {
					it( 'should strip the list attributes from the closest item and decrease indent of children (first item)', () => {
						setData( model, modelList( [
							'# f[]oo',
							'  # bar',
							'  # baz',
							'    # qux'
						] ) );

						command.execute();

						expect( getData( model ) ).to.equalMarkup( modelList( [
							'f[]oo',
							'# bar',
							'# baz',
							'  # qux'
						] ) );

						expect( changedBlocks.length ).to.equal( 4 );
						expect( changedBlocks ).to.deep.equal( [
							root.getChild( 0 ),
							root.getChild( 1 ),
							root.getChild( 2 ),
							root.getChild( 3 )
						] );
					} );

					it( 'should strip the list attributes from the closest item and decrease indent of children (middle item)', () => {
						setData( model, modelList( [
							'# foo',
							'# b[]ar',
							'  # baz',
							'    # qux'
						] ) );

						command.execute();

						expect( getData( model ) ).to.equalMarkup( modelList( [
							'# foo',
							'b[]ar',
							'# baz',
							'  # qux'
						] ) );

						expect( changedBlocks.length ).to.equal( 3 );
						expect( changedBlocks ).to.deep.equal( [
							root.getChild( 1 ),
							root.getChild( 2 ),
							root.getChild( 3 )
						] );
					} );

					it( 'should strip the list attributes from the selected items and decrease indent of nested list', () => {
						/* eslint-disable @stylistic/no-multi-spaces */
						setData( model, modelList( [
							'0',
							'# 1',
							'  # 2',
							'    # 3[]', 		// <- this is turned off.
							'      # 4', 		// <- this has to become indent = 0, because it will be first item on a new list.
							'        # 5', 		// <- this should be still be a child of item above, so indent = 1.
							'    # 6', 			// <- this has to become indent = 0, because it should not be a child of any of items above.
							'      # 7', 		// <- this should be still be a child of item above, so indent = 1.
							'  # 8', 			// <- this has to become indent = 0.
							'    # 9', 			// <- this should still be a child of item above, so indent = 1.
							'      # 10', 		// <- this should still be a child of item above, so indent = 2.
							'      # 11', 		// <- this should still be at the same level as item above, so indent = 2.
							'# 12', 			// <- this and all below are left unchanged.
							'  # 13',
							'    # 14'
						] ) );
						/* eslint-enable @stylistic/no-multi-spaces */

						command.execute();

						expect( getData( model ) ).to.equalMarkup( modelList( [
							'0',
							'# 1',
							'  # 2',
							'3[]',
							'# 4',
							'  # 5',
							'# 6',
							'  # 7',
							'# 8',
							'  # 9',
							'    # 10',
							'    # 11',
							'# 12',
							'  # 13',
							'    # 14'
						] ) );

						expect( changedBlocks.length ).to.equal( 9 );
						expect( changedBlocks ).to.deep.equal( [
							root.getChild( 3 ),
							root.getChild( 4 ),
							root.getChild( 5 ),
							root.getChild( 6 ),
							root.getChild( 7 ),
							root.getChild( 8 ),
							root.getChild( 9 ),
							root.getChild( 10 ),
							root.getChild( 11 )
						] );
					} );
				} );
			} );
		} );
	} );
} );
