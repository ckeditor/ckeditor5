/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Editor from '@ckeditor/ckeditor5-core/src/editor/editor';
import Model from '@ckeditor/ckeditor5-engine/src/model/model';
import DocumentListCommand from '../../src/documentlist/documentlistcommand';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import stubUid from './_utils/uid';

describe.only( 'DocumentListCommand', () => {
	let editor, command, model, doc, root;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editor = new Editor();
		editor.model = new Model();

		model = editor.model;
		doc = model.document;
		root = doc.createRoot();

		command = new DocumentListCommand( editor, 'bulleted' );

		// TODO: I don't like it but OTOH I don't want DocumentListEditing here because it introduces
		// post-fixers and I'd rather see how the command works on its own.
		model.schema.extend( '$container', {
			allowAttributes: [ 'listType', 'listIndent', 'listItemId' ]
		} );

		model.schema.register( 'paragraph', {
			inheritAllFrom: '$block',
			allowIn: 'widget'
		} );

		model.schema.register( 'widget', { inheritAllFrom: '$block' } );

		setData(
			model,
			'<paragraph>foo</paragraph>' +
			'<paragraph listType="bulleted" listItemId="1" listIndent="0">bulleted</paragraph>' +
			'<paragraph listType="numbered" listItemId="2" listIndent="0">numbered</paragraph>' +
			'<paragraph>bar</paragraph>' +
			'<widget>' +
				'<paragraph>xyz</paragraph>' +
			'</widget>'
		);

		model.change( writer => {
			writer.setSelection( doc.getRoot().getChild( 0 ), 0 );
		} );

		stubUid();
	} );

	afterEach( () => {
		command.destroy();
	} );

	describe( 'DocumentListCommand', () => {
		describe( 'constructor()', () => {
			it( 'should create list command with given type and value set to false', () => {
				expect( command.type ).to.equal( 'bulleted' );
				expect( command.value ).to.be.false;

				const numberedList = new DocumentListCommand( editor, 'numbered' );
				expect( numberedList.type ).to.equal( 'numbered' );
			} );
		} );

		describe( 'value', () => {
			it( 'should be false if first position in selection is not in a list item', () => {
				model.change( writer => {
					writer.setSelection( doc.getRoot().getChild( 3 ), 0 );
				} );

				expect( command.value ).to.be.false;
			} );

			it( 'should be false if first position in selection is in a list item of different type', () => {
				model.change( writer => {
					writer.setSelection( doc.getRoot().getChild( 2 ), 0 );
				} );

				expect( command.value ).to.be.false;
			} );

			it( 'should be true if first position in selection is in a list item of same type', () => {
				model.change( writer => {
					writer.setSelection( doc.getRoot().getChild( 1 ), 0 );
				} );

				expect( command.value ).to.be.true;
			} );
		} );

		describe( 'isEnabled', () => {
			it( 'should be true if entire selection is in a list', () => {
				setData( model, '<paragraph listType="bulleted" listItemId="1" listIndent="0">[a]</paragraph>' );
				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be true if entire selection is in a block which can be turned into a list', () => {
				setData( model, '<paragraph>[a]</paragraph>' );
				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be true if selection first position is in a block which can be turned into a list', () => {
				setData( model, '<paragraph>[a</paragraph><widget>b]</widget>' );
				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be false if selection first position is in an element which cannot be converted to a list item', () => {
				// Disallow document lists in widgets.
				model.schema.addAttributeCheck( ( ctx, attributeName ) => {
					if ( ctx.endsWith( 'widget paragraph' ) && attributeName === 'listType' ) {
						return false;
					}
				} );

				setData( model, '<widget><paragraph>[a</paragraph></widget><paragraph>b]</paragraph>' );
				expect( command.isEnabled ).to.be.false;
			} );

			it( 'should be false in a root which does not allow blocks at all', () => {
				doc.createRoot( 'paragraph', 'inlineOnlyRoot' );
				setData( model, 'a[]b', { rootName: 'inlineOnlyRoot' } );
				expect( command.isEnabled ).to.be.false;
			} );
		} );

		describe( 'execute()', () => {
			it( 'should use parent batch', () => {
				model.change( writer => {
					expect( writer.batch.operations.length ).to.equal( 0 );

					command.execute();

					expect( writer.batch.operations.length ).to.be.above( 0 );
				} );
			} );

			describe( 'options.forceValue', () => {
				it( 'should force converting into the list if the `options.forceValue` is set to `true`', () => {
					setData( model, '<paragraph>fo[]o</paragraph>' );

					command.execute( { forceValue: true } );

					expect( getData( model ) ).to.equal(
						'<paragraph listIndent="0" listItemId="e00000000000000000000000000000009" listType="bulleted">fo[]o</paragraph>' );

					command.execute( { forceValue: true } );

					expect( getData( model ) ).to.equal(
						'<paragraph listIndent="0" listItemId="e00000000000000000000000000000009" listType="bulleted">fo[]o</paragraph>' );
				} );

				it( 'should force converting into the paragraph if the `options.forceValue` is set to `false`', () => {
					setData( model, '<paragraph listIndent="0" listType="bulleted">fo[]o</paragraph>' );

					command.execute( { forceValue: false } );

					expect( getData( model ) ).to.equal( '<paragraph>fo[]o</paragraph>' );

					command.execute( { forceValue: false } );

					expect( getData( model ) ).to.equal( '<paragraph>fo[]o</paragraph>' );
				} );
			} );

			describe( 'collapsed selection', () => {
				describe( 'when turning on', () => {
					it( 'should turn the closest block into a list item', () => {
						setData( model, '<paragraph>fo[]o</paragraph>' );

						command.execute();

						expect( getData( model ) ).to.equal(
							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000009" listType="bulleted">fo[]o</paragraph>'
						);
					} );

					it( 'should change the type of an existing (closest) list item', () => {
						setData( model, '<paragraph listIndent="0" listItemId="a" listType="numbered">fo[]o</paragraph>' );

						command.execute();

						expect( getData( model ) ).to.equal(
							'<paragraph listIndent="0" listItemId="a" listType="bulleted">fo[]o</paragraph>'
						);
					} );
				} );

				describe.only( 'when turning off', () => {
					it( 'should strip the list attributes from the closest list item (single list item)', () => {
						setData( model, '<paragraph listIndent="0" listItemId="a" listType="bulleted">fo[]o</paragraph>' );

						command.execute();

						expect( getData( model ) ).to.equal( '<paragraph>fo[]o</paragraph>' );
					} );

					it( 'should strip the list attributes from the closest item (multiple list items, selection in first item)', () => {
						setData( model,
							'<paragraph listIndent="0" listItemId="a" listType="bulleted">f[o]o</paragraph>' +
							'<paragraph listIndent="0" listItemId="b" listType="bulleted">bar</paragraph>' +
							'<paragraph listIndent="0" listItemId="c" listType="bulleted">baz</paragraph>'
						);

						command.execute();

						expect( getData( model ) ).to.equal(
							'<paragraph>f[o]o</paragraph>' +
							'<paragraph listIndent="0" listItemId="b" listType="bulleted">bar</paragraph>' +
							'<paragraph listIndent="0" listItemId="c" listType="bulleted">baz</paragraph>'
						);
					} );

					it( 'should strip the list attributes from the closest item (multiple list items, selection in the middle item)', () => {
						setData( model,
							'<paragraph listIndent="0" listItemId="a" listType="bulleted">foo</paragraph>' +
							'<paragraph listIndent="0" listItemId="b" listType="bulleted">b[a]r</paragraph>' +
							'<paragraph listIndent="0" listItemId="c" listType="bulleted">baz</paragraph>'
						);

						command.execute();

						expect( getData( model ) ).to.equal(
							'<paragraph listIndent="0" listItemId="a" listType="bulleted">foo</paragraph>' +
							'<paragraph>b[a]r</paragraph>' +
							'<paragraph listIndent="0" listItemId="c" listType="bulleted">baz</paragraph>'
						);
					} );

					it( 'should strip the list attributes from the closest item (multiple list items, selection in the last item)', () => {
						setData( model,
							'<paragraph listIndent="0" listItemId="a" listType="bulleted">foo</paragraph>' +
							'<paragraph listIndent="0" listItemId="b" listType="bulleted">bar</paragraph>' +
							'<paragraph listIndent="0" listItemId="c" listType="bulleted">b[a]z</paragraph>'
						);

						command.execute();

						expect( getData( model ) ).to.equal(
							'<paragraph listIndent="0" listItemId="a" listType="bulleted">foo</paragraph>' +
							'<paragraph listIndent="0" listItemId="b" listType="bulleted">bar</paragraph>' +
							'<paragraph>b[a]z</paragraph>'
						);
					} );

					describe( 'with nested lists inside', () => {
						it( 'should strip the list attributes from the closest item and decrease indent of children (selection in the first item)', () => {
							setData( model,
								'<paragraph listIndent="0" listItemId="a" listType="bulleted">f[o]o</paragraph>' +
								'<paragraph listIndent="1" listItemId="a.a" listType="bulleted">bar</paragraph>' +
								'<paragraph listIndent="1" listItemId="a.a.a" listType="bulleted">baz</paragraph>' +
								'<paragraph listIndent="2" listItemId="a.a.a.a" listType="bulleted">qux</paragraph>'
							);

							command.execute();

							expect( getData( model ) ).to.equal(
								'<paragraph>f[o]o</paragraph>' +
								'<paragraph listIndent="0" listItemId="a.a" listType="bulleted">bar</paragraph>' +
								'<paragraph listIndent="0" listItemId="a.a.a" listType="bulleted">baz</paragraph>' +
								'<paragraph listIndent="1" listItemId="a.a.a.a" listType="bulleted">qux</paragraph>'
							);
						} );

						it( 'should strip the list attributes from the closest item and decrease indent of children (selection in the middle item)', () => {
							setData( model,
								'<paragraph listIndent="0" listItemId="a" listType="bulleted">foo</paragraph>' +
								'<paragraph listIndent="0" listItemId="a" listType="bulleted">b[a]r</paragraph>' +
								'<paragraph listIndent="1" listItemId="a.a" listType="bulleted">baz</paragraph>' +
								'<paragraph listIndent="2" listItemId="a.a.a" listType="bulleted">qux</paragraph>'
							);

							command.execute();

							expect( getData( model ) ).to.equal(
								'<paragraph listIndent="0" listItemId="a" listType="bulleted">foo</paragraph>' +
								'<paragraph>b[a]r</paragraph>' +
								'<paragraph listIndent="0" listItemId="a.a" listType="bulleted">baz</paragraph>' +
								'<paragraph listIndent="1" listItemId="a.a.a" listType="bulleted">qux</paragraph>'
							);
						} );
					} );

					describe( 'with blocks inside list items', () => {
						it( 'should strip the list attributes from the closest list item and all blocks inside (selection in the first item)', () => {
							setData( model,
								'<paragraph listIndent="0" listItemId="a" listType="bulleted">fo[]o</paragraph>' +
								'<paragraph listIndent="0" listItemId="a" listType="bulleted">bar</paragraph>' +
								'<paragraph listIndent="0" listItemId="a" listType="bulleted">baz</paragraph>'
							);

							command.execute();

							expect( getData( model ) ).to.equal(
								'<paragraph>fo[]o</paragraph>' +
								'<paragraph>bar</paragraph>' +
								'<paragraph>baz</paragraph>'
							);
						} );

						describe( 'with nested list items', () => {

						} );
					} );
				} );
			} );

			describe.skip( 'non-collapsed selection', () => {
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

					expect( getData( model ) ).to.equal(
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

					expect( getData( model ) ).to.equal(
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

					expect( getData( model ) ).to.equal( expectedData );
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

					expect( getData( model ) ).to.equal( expectedData );
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

					expect( getData( model ) ).to.equal( expectedData );
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

					expect( getData( model ) ).to.equal( expectedData );
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

					expect( getData( model ) ).to.equal( expectedData );
				} );
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
