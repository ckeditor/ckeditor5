/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import DocumentListCommand from '../../src/documentlist/documentlistcommand';
import stubUid from './_utils/uid';
import { modelList } from './_utils/utils';

import Editor from '@ckeditor/ckeditor5-core/src/editor/editor';
import Model from '@ckeditor/ckeditor5-engine/src/model/model';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe.only( 'DocumentListCommand', () => {
	let editor, command, model, doc, root, changedBlocks;

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

		stubUid();
	} );

	describe( 'bulleted', () => {
		beforeEach( () => {
			command = new DocumentListCommand( editor, 'bulleted' );

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

			it( 'should be false if there is no blocks in the selection', () => {
				model.schema.register( 'table', {
					allowWhere: '$block',
					allowAttributesOf: '$container',
					isObject: true,
					isBlock: true
				} );

				model.schema.register( 'tableCell', {
					allowContentOf: '$container',
					allowIn: 'table',
					isLimit: true,
					isSelectable: true
				} );

				setData( model, '<table>[<tableCell></tableCell>]</table>' );

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

			it( 'should be true if any of the selected blocks allows list attributes (the last element does not allow)', () => {
				model.schema.register( 'heading1', { inheritAllFrom: '$block' } );
				model.schema.addAttributeCheck( ( ctx, attributeName ) => {
					if ( ctx.endsWith( 'heading1' ) && attributeName === 'listType' ) {
						return false;
					}
				} );

				setData( model,
					'<paragraph>[a</paragraph>' +
					'<heading1>b]</heading1>'
				);

				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be true if any of the selected blocks allows list attributes (the first element does not allow)', () => {
				model.schema.register( 'heading1', { inheritAllFrom: '$block' } );
				model.schema.addAttributeCheck( ( ctx, attributeName ) => {
					if ( ctx.endsWith( 'heading1' ) && attributeName === 'listType' ) {
						return false;
					}
				} );

				setData( model,
					'<heading1>[a</heading1>' +
					'<paragraph>b]</paragraph>'
				);

				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be false if all of the selected blocks do not allow list attributes', () => {
				model.schema.register( 'heading1', { inheritAllFrom: '$block' } );
				model.schema.addAttributeCheck( ( ctx, attributeName ) => {
					if ( ctx.endsWith( 'heading1' ) && attributeName === 'listType' ) {
						return false;
					}
				} );

				setData( model,
					'<heading1>a[]</heading1>' +
					'<paragraph>b</paragraph>'
				);

				expect( command.isEnabled ).to.be.false;
			} );

			it( 'should be false if there is no blocks in the selection', () => {
				model.schema.register( 'table', {
					allowWhere: '$block',
					allowAttributesOf: '$container',
					isObject: true,
					isBlock: true
				} );

				model.schema.register( 'tableCell', {
					allowContentOf: '$container',
					allowIn: 'table',
					isLimit: true,
					isSelectable: true
				} );

				setData( model, '<table>[<tableCell></tableCell>]</table>' );

				expect( command.isEnabled ).to.be.false;
			} );
		} );

		describe.only( 'execute()', () => {
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

				it( 'should change type of the whole list items if only some blocks of a list item are selected', () => {
					setData( model, modelList( [
						'# a',
						'  [b',
						'c',
						'# d]',
						'  e',
						'# f'
					] ) );

					command.execute();

					expect( getData( model ) ).to.equalMarkup( modelList( [
						'* a',
						'  [b',
						'* c {id:a00}',
						'* d]',
						'  e',
						'# f'
					] ) );

					expect( changedBlocks.length ).to.equal( 5 );
					expect( changedBlocks ).to.deep.equal( [
						root.getChild( 0 ),
						root.getChild( 1 ),
						root.getChild( 2 ),
						root.getChild( 3 ),
						root.getChild( 4 )
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

				it( 'should change the type of the whole list if the selection is collapsed (paragraphs at the boundaries)', () => {
					setData( model, modelList( [
						'a',
						'# b',
						'  c[]',
						'  # d',
						'  e',
						'# f',
						'g'
					] ) );

					command.execute();

					expect( getData( model ) ).to.equalMarkup( modelList( [
						'a',
						'* b',
						'  c[]',
						'  # d',
						'  e',
						'* f',
						'g'
					] ) );

					expect( changedBlocks.length ).to.equal( 4 );
					expect( changedBlocks ).to.deep.equal( [
						root.getChild( 1 ),
						root.getChild( 2 ),
						root.getChild( 4 ),
						root.getChild( 5 )
					] );
				} );
			} );

			// TODO
			describe.only( 'when turning off', () => {
				it( 'should strip the list attributes from the closest list item (single list item)', () => {
					// * f[]oo
					setData( model, '<paragraph listIndent="0" listItemId="a" listType="bulleted">fo[]o</paragraph>' );

					command.execute();

					// f[]oo
					expect( getData( model ) ).to.equalMarkup( '<paragraph>fo[]o</paragraph>' );
				} );

				it( 'should strip the list attributes from the closest item (multiple list items, selection in first item)', () => {
					// * f[]oo
					// * bar
					// * baz
					setData( model,
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">f[]oo</paragraph>' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">bar</paragraph>' +
						'<paragraph listIndent="0" listItemId="c" listType="bulleted">baz</paragraph>'
					);

					command.execute();

					// f[]oo
					// * bar
					// * baz
					expect( getData( model ) ).to.equalMarkup(
						'<paragraph>f[]oo</paragraph>' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">bar</paragraph>' +
						'<paragraph listIndent="0" listItemId="c" listType="bulleted">baz</paragraph>'
					);
				} );

				it( 'should strip the list attributes from the closest item (multiple list items, selection in the middle item)', () => {
					// * foo
					// * b[]ar
					// * baz
					setData( model,
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">foo</paragraph>' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">b[]ar</paragraph>' +
						'<paragraph listIndent="0" listItemId="c" listType="bulleted">baz</paragraph>'
					);

					command.execute();

					// * foo
					// b[]ar
					// * baz
					expect( getData( model ) ).to.equalMarkup(
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">foo</paragraph>' +
						'<paragraph>b[]ar</paragraph>' +
						'<paragraph listIndent="0" listItemId="c" listType="bulleted">baz</paragraph>'
					);
				} );

				it( 'should strip the list attributes from the closest item (multiple list items, selection in the last item)', () => {
					// * foo
					// * bar
					// * b[]az
					setData( model,
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">foo</paragraph>' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">bar</paragraph>' +
						'<paragraph listIndent="0" listItemId="c" listType="bulleted">b[]az</paragraph>'
					);

					command.execute();

					// * foo
					// * bar
					// b[]az
					expect( getData( model ) ).to.equalMarkup(
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">foo</paragraph>' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">bar</paragraph>' +
						'<paragraph>b[]az</paragraph>'
					);
				} );

				describe( 'with nested lists inside', () => {
					it( 'should strip the list attributes from the closest item and decrease indent of children (selection in the first item)', () => {
						// * f[]oo
						// * bar
						//   * baz
						//     * qux
						setData( model,
							'<paragraph listIndent="0" listItemId="a" listType="bulleted">f[]oo</paragraph>' +
							'<paragraph listIndent="1" listItemId="a.a" listType="bulleted">bar</paragraph>' +
							'<paragraph listIndent="1" listItemId="a.a.a" listType="bulleted">baz</paragraph>' +
							'<paragraph listIndent="2" listItemId="a.a.a.a" listType="bulleted">qux</paragraph>'
						);

						command.execute();

						// f[]oo
						// * bar
						//   * baz
						//     * qux
						expect( getData( model ) ).to.equalMarkup(
							'<paragraph>f[]oo</paragraph>' +
							'<paragraph listIndent="0" listItemId="a.a" listType="bulleted">bar</paragraph>' +
							'<paragraph listIndent="0" listItemId="a.a.a" listType="bulleted">baz</paragraph>' +
							'<paragraph listIndent="1" listItemId="a.a.a.a" listType="bulleted">qux</paragraph>'
						);
					} );

					it( 'should strip the list attributes from the closest item and decrease indent of children (selection in the middle item)', () => {
						// * foo
						// * b[]ar
						//   * baz
						//     * qux
						setData( model,
							'<paragraph listIndent="0" listItemId="a" listType="bulleted">foo</paragraph>' +
							'<paragraph listIndent="0" listItemId="a" listType="bulleted">b[]ar</paragraph>' +
							'<paragraph listIndent="1" listItemId="a.a" listType="bulleted">baz</paragraph>' +
							'<paragraph listIndent="2" listItemId="a.a.a" listType="bulleted">qux</paragraph>'
						);

						command.execute();

						// * foo
						// b[]ar
						// * baz
						//   * qux
						expect( getData( model ) ).to.equalMarkup(
							'<paragraph listIndent="0" listItemId="a" listType="bulleted">foo</paragraph>' +
							'<paragraph>b[]ar</paragraph>' +
							'<paragraph listIndent="0" listItemId="a.a" listType="bulleted">baz</paragraph>' +
							'<paragraph listIndent="1" listItemId="a.a.a" listType="bulleted">qux</paragraph>'
						);
					} );
				} );

				describe( 'with blocks inside list items', () => {
					it( 'should strip the list attributes from the closest list item and all blocks inside (selection in the first block)', () => {
						// * fo[]o
						//   bar
						//   baz
						setData( model,
							'<paragraph listIndent="0" listItemId="a" listType="bulleted">fo[]o</paragraph>' +
							'<paragraph listIndent="0" listItemId="a" listType="bulleted">bar</paragraph>' +
							'<paragraph listIndent="0" listItemId="a" listType="bulleted">baz</paragraph>'
						);

						command.execute();

						// fo[]o
						// bar
						// baz
						expect( getData( model ) ).to.equalMarkup(
							'<paragraph>fo[]o</paragraph>' +
							'<paragraph>bar</paragraph>' +
							'<paragraph>baz</paragraph>'
						);
					} );

					describe( 'with nested list items', () => {

					} );
				} );
			} );

			beforeEach( () => {
				setData(
					model,
					'<paragraph listIndent="0" listType="bulleted">---</paragraph>' +
					'<paragraph listIndent="0" listType="bulleted">---</paragraph>' +
					'<paragraph>---</paragraph>' +
					'<paragraph>---</paragraph>' +
					'<paragraph listIndent="0" listType="numbered">---</paragraph>' +
					'<paragraph listIndent="0" listType="numbered">---</paragraph>' +
					'<paragraph listIndent="1" listType="bulleted">---</paragraph>' +
					'<paragraph listIndent="2" listType="bulleted">---</paragraph>'
				);
			} );

			// https://github.com/ckeditor/ckeditor5-list/issues/62
			it( 'should not rename blocks which cannot become listItems (list item is not allowed in their parent)', () => {
				model.schema.register( 'restricted' );
				model.schema.extend( 'restricted', { allowIn: '$root' } );

				model.schema.register( 'fooBlock', { inheritAllFrom: '$block' } );
				model.schema.extend( 'fooBlock', { allowIn: 'restricted' } );

				setData(
					model,
					'<paragraph>a[bc</paragraph>' +
					'<restricted><fooBlock></fooBlock></restricted>' +
					'<paragraph>de]f</paragraph>'
				);

				command.execute();

				expect( getData( model ) ).to.equalMarkup(
					'<paragraph listIndent="0" listType="bulleted">a[bc</paragraph>' +
					'<restricted><fooBlock></fooBlock></restricted>' +
					'<paragraph listIndent="0" listType="bulleted">de]f</paragraph>'
				);
			} );

			it( 'should not rename blocks which cannot become listItems (block is an object)', () => {
				model.schema.register( 'imageBlock', {
					isBlock: true,
					isObject: true,
					allowIn: '$root'
				} );

				setData(
					model,
					'<paragraph>a[bc</paragraph>' +
					'<imageBlock></imageBlock>' +
					'<paragraph>de]f</paragraph>'
				);

				command.execute();

				expect( getData( model ) ).to.equalMarkup(
					'<paragraph listIndent="0" listType="bulleted">a[bc</paragraph>' +
					'<imageBlock></imageBlock>' +
					'<paragraph listIndent="0" listType="bulleted">de]f</paragraph>'
				);
			} );

			it( 'should rename closest block to listItem and set correct attributes', () => {
				// From first paragraph to second paragraph.
				// Command value=false, we are turning on list items.
				model.change( writer => {
					writer.setSelection( writer.createRange(
						writer.createPositionAt( root.getChild( 2 ), 0 ),
						writer.createPositionAt( root.getChild( 3 ), 'end' )
					) );
				} );

				command.execute();

				const expectedData =
					'<paragraph listIndent="0" listType="bulleted">---</paragraph>' +
					'<paragraph listIndent="0" listType="bulleted">---</paragraph>' +
					'<paragraph listIndent="0" listType="bulleted">[---</paragraph>' +
					'<paragraph listIndent="0" listType="bulleted">---]</paragraph>' +
					'<paragraph listIndent="0" listType="numbered">---</paragraph>' +
					'<paragraph listIndent="0" listType="numbered">---</paragraph>' +
					'<paragraph listIndent="1" listType="bulleted">---</paragraph>' +
					'<paragraph listIndent="2" listType="bulleted">---</paragraph>';

				expect( getData( model ) ).to.equalMarkup( expectedData );
			} );

			it( 'should rename closest listItem to paragraph', () => {
				// From second bullet list item to first numbered list item.
				// Command value=true, we are turning off list items.
				model.change( writer => {
					writer.setSelection( writer.createRange(
						writer.createPositionAt( root.getChild( 1 ), 0 ),
						writer.createPositionAt( root.getChild( 4 ), 'end' )
					) );
				} );

				// Convert paragraphs, leave numbered list items.
				command.execute();

				const expectedData =
					'<paragraph listIndent="0" listType="bulleted">---</paragraph>' +
					'<paragraph listIndent="0" listType="bulleted">[---</paragraph>' + // Attributes will be removed by post fixer.
					'<paragraph>---</paragraph>' +
					'<paragraph>---</paragraph>' +
					'<paragraph listIndent="0" listType="numbered">---]</paragraph>' + // Attributes will be removed by post fixer.
					'<paragraph listIndent="0" listType="numbered">---</paragraph>' +
					'<paragraph listIndent="1" listType="bulleted">---</paragraph>' +
					'<paragraph listIndent="2" listType="bulleted">---</paragraph>';

				expect( getData( model ) ).to.equalMarkup( expectedData );
			} );

			it( 'should change closest listItem\'s type', () => {
				// From first numbered lsit item to third bulleted list item.
				model.change( writer => {
					writer.setSelection( writer.createRange(
						writer.createPositionAt( root.getChild( 4 ), 0 ),
						writer.createPositionAt( root.getChild( 6 ), 0 )
					) );
				} );

				// Convert paragraphs, leave numbered list items.
				command.execute();

				const expectedData =
					'<paragraph listIndent="0" listType="bulleted">---</paragraph>' +
					'<paragraph listIndent="0" listType="bulleted">---</paragraph>' +
					'<paragraph>---</paragraph>' +
					'<paragraph>---</paragraph>' +
					'<paragraph listIndent="0" listType="bulleted">[---</paragraph>' +
					'<paragraph listIndent="0" listType="bulleted">---</paragraph>' +
					'<paragraph listIndent="1" listType="bulleted">]---</paragraph>' +
					'<paragraph listIndent="2" listType="bulleted">---</paragraph>';

				expect( getData( model ) ).to.equalMarkup( expectedData );
			} );

			it( 'should handle outdenting sub-items when list item is turned off', () => {
				// From first numbered list item to third bulleted list item.
				model.change( writer => {
					writer.setSelection( writer.createRange(
						writer.createPositionAt( root.getChild( 1 ), 0 ),
						writer.createPositionAt( root.getChild( 5 ), 'end' )
					) );
				} );

				// Convert paragraphs, leave numbered list items.
				command.execute();

				const expectedData =
					'<paragraph listIndent="0" listType="bulleted">---</paragraph>' +
					'<paragraph listIndent="0" listType="bulleted">[---</paragraph>' + // Attributes will be removed by post fixer.
					'<paragraph>---</paragraph>' +
					'<paragraph>---</paragraph>' +
					'<paragraph listIndent="0" listType="numbered">---</paragraph>' + // Attributes will be removed by post fixer.
					'<paragraph listIndent="0" listType="numbered">---]</paragraph>' + // Attributes will be removed by post fixer.
					'<paragraph listIndent="0" listType="bulleted">---</paragraph>' +
					'<paragraph listIndent="1" listType="bulleted">---</paragraph>';

				expect( getData( model ) ).to.equalMarkup( expectedData );
			} );

			// Example from docs.
			it( 'should change type of all items in nested list if one of items changed', () => {
				setData(
					model,
					'<paragraph listIndent="0" listType="numbered">---</paragraph>' +
					'<paragraph listIndent="1" listType="numbered">---</paragraph>' +
					'<paragraph listIndent="2" listType="numbered">---</paragraph>' +
					'<paragraph listIndent="1" listType="numbered">---</paragraph>' +
					'<paragraph listIndent="2" listType="numbered">---</paragraph>' +
					'<paragraph listIndent="2" listType="numbered">-[-</paragraph>' +
					'<paragraph listIndent="1" listType="numbered">---</paragraph>' +
					'<paragraph listIndent="1" listType="numbered">---</paragraph>' +
					'<paragraph listIndent="0" listType="numbered">---</paragraph>' +
					'<paragraph listIndent="1" listType="numbered">-]-</paragraph>' +
					'<paragraph listIndent="1" listType="numbered">---</paragraph>' +
					'<paragraph listIndent="2" listType="numbered">---</paragraph>' +
					'<paragraph listIndent="0" listType="numbered">---</paragraph>'
				);

				// * ------				<-- do not fix, top level item
				//   * ------			<-- fix, because latter list item of this item's list is changed
				//      * ------		<-- do not fix, item is not affected (different list)
				//   * ------			<-- fix, because latter list item of this item's list is changed
				//      * ------		<-- fix, because latter list item of this item's list is changed
				//      * ---[--		<-- already in selection
				//   * ------			<-- already in selection
				//   * ------			<-- already in selection
				// * ------				<-- already in selection, but does not cause other list items to change because is top-level
				//   * ---]--			<-- already in selection
				//   * ------			<-- fix, because preceding list item of this item's list is changed
				//      * ------		<-- do not fix, item is not affected (different list)
				// * ------				<-- do not fix, top level item

				command.execute();

				const expectedData =
					'<paragraph listIndent="0" listType="numbered">---</paragraph>' +
					'<paragraph listIndent="1" listType="bulleted">---</paragraph>' +
					'<paragraph listIndent="2" listType="numbered">---</paragraph>' +
					'<paragraph listIndent="1" listType="bulleted">---</paragraph>' +
					'<paragraph listIndent="2" listType="bulleted">---</paragraph>' +
					'<paragraph listIndent="2" listType="bulleted">-[-</paragraph>' +
					'<paragraph listIndent="1" listType="bulleted">---</paragraph>' +
					'<paragraph listIndent="1" listType="bulleted">---</paragraph>' +
					'<paragraph listIndent="0" listType="bulleted">---</paragraph>' +
					'<paragraph listIndent="1" listType="bulleted">-]-</paragraph>' +
					'<paragraph listIndent="1" listType="bulleted">---</paragraph>' +
					'<paragraph listIndent="2" listType="numbered">---</paragraph>' +
					'<paragraph listIndent="0" listType="numbered">---</paragraph>';

				expect( getData( model ) ).to.equalMarkup( expectedData );
			} );

			it.skip( 'should fire "_executeCleanup" event after finish all operations with all changed items', done => {
				setData( model,
					'<paragraph>Foo 1.</paragraph>' +
					'<paragraph>[Foo 2.</paragraph>' +
					'<paragraph>Foo 3.]</paragraph>' +
					'<paragraph>Foo 4.</paragraph>'
				);

				command.execute();

				expect( getData( model ) ).to.equal(
					'<paragraph>Foo 1.</paragraph>' +
					'<paragraph listIndent="0" listType="bulleted">[Foo 2.</paragraph>' +
					'<paragraph listIndent="0" listType="bulleted">Foo 3.]</paragraph>' +
					'<paragraph>Foo 4.</paragraph>'
				);

				command.on( '_executeCleanup', ( evt, data ) => {
					expect( data ).to.deep.equal( [
						root.getChild( 2 ),
						root.getChild( 1 )
					] );

					done();
				} );

				command.execute();
			} );
		} );
	} );
} );
