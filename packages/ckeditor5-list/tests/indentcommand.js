/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Editor from '@ckeditor/ckeditor5-core/src/editor/editor';
import Model from '@ckeditor/ckeditor5-engine/src/model/model';
import IndentCommand from '../src/indentcommand';
import Range from '@ckeditor/ckeditor5-engine/src/model/range';
import Position from '@ckeditor/ckeditor5-engine/src/model/position';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'IndentCommand', () => {
	let editor, model, doc, root;

	beforeEach( () => {
		editor = new Editor();
		editor.model = new Model();

		model = editor.model;
		doc = model.document;
		root = doc.createRoot();

		model.schema.registerItem( 'listItem', '$block' );
		model.schema.registerItem( 'paragraph', '$block' );

		model.schema.allow( { name: '$block', inside: '$root' } );
		model.schema.allow( { name: 'listItem', attributes: [ 'type', 'indent' ], inside: '$root' } );
		model.schema.allow( { name: 'paragraph', inside: '$root' } );

		setData(
			model,
			'<listItem indent="0" type="bulleted">a</listItem>' +
			'<listItem indent="0" type="bulleted">b</listItem>' +
			'<listItem indent="1" type="bulleted">c</listItem>' +
			'<listItem indent="2" type="bulleted">d</listItem>' +
			'<listItem indent="2" type="bulleted">e</listItem>' +
			'<listItem indent="1" type="bulleted">f</listItem>' +
			'<listItem indent="0" type="bulleted">g</listItem>'
		);
	} );

	describe( 'IndentCommand', () => {
		let command;

		beforeEach( () => {
			command = new IndentCommand( editor, 'forward' );
		} );

		afterEach( () => {
			command.destroy();
		} );

		describe( 'isEnabled', () => {
			it( 'should be true if selection starts in list item', () => {
				model.change( () => {
					doc.selection.setCollapsedAt( root.getChild( 5 ) );
				} );

				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be false if selection starts in first list item', () => {
				model.change( () => {
					doc.selection.setCollapsedAt( root.getChild( 0 ) );
				} );

				expect( command.isEnabled ).to.be.false;
			} );

			// Reported in PR #53.
			it( 'should be false if selection starts in first list item #2', () => {
				setData(
					model,
					'<listItem indent="0" type="bulleted">a</listItem>' +
					'<listItem indent="1" type="bulleted">b</listItem>' +
					'<listItem indent="0" type="bulleted">c</listItem>' +
					'<listItem indent="1" type="bulleted">[]d</listItem>' +
					'<listItem indent="2" type="bulleted">e</listItem>'
				);

				expect( command.isEnabled ).to.be.false;
			} );

			// Reported in PR #53.
			it( 'should be false if selection starts in first list item #3', () => {
				setData(
					model,
					'<listItem indent="0" type="bulleted">a</listItem>' +
					'<listItem indent="1" type="bulleted">b</listItem>' +
					'<listItem indent="0" type="numbered">c</listItem>' +
					'<listItem indent="1" type="bulleted">d</listItem>' +
					'<listItem indent="0" type="bulleted">[]e</listItem>'
				);

				expect( command.isEnabled ).to.be.false;
			} );

			it( 'should be false if selection starts in first list item of top level list with different type than previous list', () => {
				setData(
					model,
					'<listItem indent="0" type="bulleted">a</listItem>' +
					'<listItem indent="0" type="numbered">[]b</listItem>'
				);

				expect( command.isEnabled ).to.be.false;
			} );

			it( 'should be false if selection starts in a list item that has bigger indent than it\'s previous sibling', () => {
				model.change( () => {
					doc.selection.setCollapsedAt( root.getChild( 2 ) );
				} );

				expect( command.isEnabled ).to.be.false;
			} );

			// Edge case but may happen that some other blocks will also use the indent attribute
			// and before we fixed it the command was enabled in such a case.
			it( 'should be false if selection starts in a paragraph with indent attribute', () => {
				model.schema.allow( { name: 'paragraph', attributes: [ 'indent' ], inside: '$root' } );

				setData( model, '<listItem indent="0">a</listItem><paragraph indent="0">b[]</paragraph>' );

				expect( command.isEnabled ).to.be.false;
			} );
		} );

		describe( 'execute()', () => {
			it( 'should use parent batch', () => {
				model.change( () => {
					doc.selection.setCollapsedAt( root.getChild( 5 ) );
				} );

				model.change( writer => {
					expect( writer.batch.deltas.length ).to.equal( 0 );

					command.execute();

					expect( writer.batch.deltas.length ).to.be.above( 0 );
				} );
			} );

			it( 'should increment indent attribute by 1', () => {
				model.change( () => {
					doc.selection.setCollapsedAt( root.getChild( 5 ) );
				} );

				command.execute();

				expect( getData( model, { withoutSelection: true } ) ).to.equal(
					'<listItem indent="0" type="bulleted">a</listItem>' +
					'<listItem indent="0" type="bulleted">b</listItem>' +
					'<listItem indent="1" type="bulleted">c</listItem>' +
					'<listItem indent="2" type="bulleted">d</listItem>' +
					'<listItem indent="2" type="bulleted">e</listItem>' +
					'<listItem indent="2" type="bulleted">f</listItem>' +
					'<listItem indent="0" type="bulleted">g</listItem>'
				);
			} );

			it( 'should increment indent of all sub-items of indented item', () => {
				model.change( () => {
					doc.selection.setCollapsedAt( root.getChild( 1 ) );
				} );

				command.execute();

				expect( getData( model, { withoutSelection: true } ) ).to.equal(
					'<listItem indent="0" type="bulleted">a</listItem>' +
					'<listItem indent="1" type="bulleted">b</listItem>' +
					'<listItem indent="2" type="bulleted">c</listItem>' +
					'<listItem indent="3" type="bulleted">d</listItem>' +
					'<listItem indent="3" type="bulleted">e</listItem>' +
					'<listItem indent="2" type="bulleted">f</listItem>' +
					'<listItem indent="0" type="bulleted">g</listItem>'
				);
			} );

			it( 'should increment indent of all selected item when multiple items are selected', () => {
				model.change( () => {
					doc.selection.setRanges( [ new Range(
						new Position( root.getChild( 1 ), [ 0 ] ),
						new Position( root.getChild( 3 ), [ 1 ] )
					) ] );
				} );

				command.execute();

				expect( getData( model, { withoutSelection: true } ) ).to.equal(
					'<listItem indent="0" type="bulleted">a</listItem>' +
					'<listItem indent="1" type="bulleted">b</listItem>' +
					'<listItem indent="2" type="bulleted">c</listItem>' +
					'<listItem indent="3" type="bulleted">d</listItem>' +
					'<listItem indent="2" type="bulleted">e</listItem>' +
					'<listItem indent="1" type="bulleted">f</listItem>' +
					'<listItem indent="0" type="bulleted">g</listItem>'
				);
			} );
		} );
	} );

	describe( 'IndentCommand - backward (outdent)', () => {
		let command;

		beforeEach( () => {
			command = new IndentCommand( editor, 'backward' );
		} );

		afterEach( () => {
			command.destroy();
		} );

		describe( 'isEnabled', () => {
			it( 'should be true if selection starts in list item', () => {
				model.change( () => {
					doc.selection.setCollapsedAt( root.getChild( 5 ) );
				} );

				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be true if selection starts in first list item', () => {
				// This is in contrary to forward indent command.
				model.change( () => {
					doc.selection.setCollapsedAt( root.getChild( 0 ) );
				} );

				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be true if selection starts in a list item that has bigger indent than it\'s previous sibling', () => {
				// This is in contrary to forward indent command.
				model.change( () => {
					doc.selection.setCollapsedAt( root.getChild( 2 ) );
				} );

				expect( command.isEnabled ).to.be.true;
			} );
		} );

		describe( 'execute()', () => {
			it( 'should decrement indent attribute by 1 (if it is bigger than 0)', () => {
				model.change( () => {
					doc.selection.setCollapsedAt( root.getChild( 5 ) );
				} );

				command.execute();

				expect( getData( model, { withoutSelection: true } ) ).to.equal(
					'<listItem indent="0" type="bulleted">a</listItem>' +
					'<listItem indent="0" type="bulleted">b</listItem>' +
					'<listItem indent="1" type="bulleted">c</listItem>' +
					'<listItem indent="2" type="bulleted">d</listItem>' +
					'<listItem indent="2" type="bulleted">e</listItem>' +
					'<listItem indent="0" type="bulleted">f</listItem>' +
					'<listItem indent="0" type="bulleted">g</listItem>'
				);
			} );

			it( 'should rename listItem to paragraph (if indent is equal to 0)', () => {
				model.change( () => {
					doc.selection.setCollapsedAt( root.getChild( 0 ) );
				} );

				command.execute();

				expect( getData( model, { withoutSelection: true } ) ).to.equal(
					'<paragraph indent="0" type="bulleted">a</paragraph>' +
					'<listItem indent="0" type="bulleted">b</listItem>' +
					'<listItem indent="1" type="bulleted">c</listItem>' +
					'<listItem indent="2" type="bulleted">d</listItem>' +
					'<listItem indent="2" type="bulleted">e</listItem>' +
					'<listItem indent="1" type="bulleted">f</listItem>' +
					'<listItem indent="0" type="bulleted">g</listItem>'
				);
			} );

			it( 'should decrement indent of all sub-items of outdented item', () => {
				model.change( () => {
					doc.selection.setCollapsedAt( root.getChild( 1 ) );
				} );

				command.execute();

				expect( getData( model, { withoutSelection: true } ) ).to.equal(
					'<listItem indent="0" type="bulleted">a</listItem>' +
					'<paragraph indent="0" type="bulleted">b</paragraph>' +
					'<listItem indent="0" type="bulleted">c</listItem>' +
					'<listItem indent="1" type="bulleted">d</listItem>' +
					'<listItem indent="1" type="bulleted">e</listItem>' +
					'<listItem indent="0" type="bulleted">f</listItem>' +
					'<listItem indent="0" type="bulleted">g</listItem>'
				);
			} );

			it( 'should outdent all selected item when multiple items are selected', () => {
				model.change( () => {
					doc.selection.setRanges( [ new Range(
						new Position( root.getChild( 1 ), [ 0 ] ),
						new Position( root.getChild( 3 ), [ 1 ] )
					) ] );
				} );

				command.execute();

				expect( getData( model, { withoutSelection: true } ) ).to.equal(
					'<listItem indent="0" type="bulleted">a</listItem>' +
					'<paragraph indent="0" type="bulleted">b</paragraph>' +
					'<listItem indent="0" type="bulleted">c</listItem>' +
					'<listItem indent="1" type="bulleted">d</listItem>' +
					'<listItem indent="2" type="bulleted">e</listItem>' +
					'<listItem indent="1" type="bulleted">f</listItem>' +
					'<listItem indent="0" type="bulleted">g</listItem>'
				);
			} );
		} );
	} );
} );
