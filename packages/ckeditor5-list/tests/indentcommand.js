/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Editor from '@ckeditor/ckeditor5-core/src/editor/editor';
import Model from '@ckeditor/ckeditor5-engine/src/model/model';
import IndentCommand from '../src/indentcommand';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'IndentCommand', () => {
	let editor, model, doc, root;

	beforeEach( () => {
		editor = new Editor();
		editor.model = new Model();

		model = editor.model;
		doc = model.document;
		root = doc.createRoot();

		model.schema.register( 'listItem', {
			inheritAllFrom: '$block',
			allowAttributes: [ 'listType', 'listIndent' ]
		} );
		model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );

		setData(
			model,
			'<listItem listIndent="0" listType="bulleted">a</listItem>' +
			'<listItem listIndent="0" listType="bulleted">b</listItem>' +
			'<listItem listIndent="1" listType="bulleted">c</listItem>' +
			'<listItem listIndent="2" listType="bulleted">d</listItem>' +
			'<listItem listIndent="2" listType="bulleted">e</listItem>' +
			'<listItem listIndent="1" listType="bulleted">f</listItem>' +
			'<listItem listIndent="0" listType="bulleted">g</listItem>'
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
				model.change( writer => {
					writer.setSelection( root.getChild( 5 ), 0 );
				} );

				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be false if selection starts in first list item', () => {
				model.change( writer => {
					writer.setSelection( root.getChild( 0 ), 0 );
				} );

				expect( command.isEnabled ).to.be.false;
			} );

			// Reported in PR #53.
			it( 'should be false if selection starts in first list item #2', () => {
				setData(
					model,
					'<listItem listIndent="0" listType="bulleted">a</listItem>' +
					'<listItem listIndent="1" listType="bulleted">b</listItem>' +
					'<listItem listIndent="0" listType="bulleted">c</listItem>' +
					'<listItem listIndent="1" listType="bulleted">[]d</listItem>' +
					'<listItem listIndent="2" listType="bulleted">e</listItem>'
				);

				expect( command.isEnabled ).to.be.false;
			} );

			// Reported in PR #53.
			it( 'should be false if selection starts in first list item #3', () => {
				setData(
					model,
					'<listItem listIndent="0" listType="bulleted">a</listItem>' +
					'<listItem listIndent="1" listType="bulleted">b</listItem>' +
					'<listItem listIndent="0" listType="numbered">c</listItem>' +
					'<listItem listIndent="1" listType="bulleted">d</listItem>' +
					'<listItem listIndent="0" listType="bulleted">[]e</listItem>'
				);

				expect( command.isEnabled ).to.be.false;
			} );

			it( 'should be false if selection starts in first list item of top level list with different type than previous list', () => {
				setData(
					model,
					'<listItem listIndent="0" listType="bulleted">a</listItem>' +
					'<listItem listIndent="0" listType="numbered">[]b</listItem>'
				);

				expect( command.isEnabled ).to.be.false;
			} );

			it( 'should be false if selection starts in a list item that has bigger indent than it\'s previous sibling', () => {
				model.change( writer => {
					writer.setSelection( root.getChild( 2 ), 0 );
				} );

				expect( command.isEnabled ).to.be.false;
			} );

			// Edge case but may happen that some other blocks will also use the indent attribute
			// and before we fixed it the command was enabled in such a case.
			it( 'should be false if selection starts in a paragraph with indent attribute', () => {
				model.schema.extend( 'paragraph', { allowAttributes: 'listIndent' } );

				setData( model, '<listItem listIndent="0">a</listItem><paragraph listIndent="0">b[]</paragraph>' );

				expect( command.isEnabled ).to.be.false;
			} );
		} );

		describe( 'execute()', () => {
			it( 'should use parent batch', () => {
				model.change( writer => {
					writer.setSelection( root.getChild( 5 ), 0 );
				} );

				model.change( writer => {
					expect( writer.batch.operations.length ).to.equal( 0 );

					command.execute();

					expect( writer.batch.operations.length ).to.be.above( 0 );
				} );
			} );

			it( 'should increment indent attribute by 1', () => {
				model.change( writer => {
					writer.setSelection( root.getChild( 5 ), 0 );
				} );

				command.execute();

				expect( getData( model, { withoutSelection: true } ) ).to.equal(
					'<listItem listIndent="0" listType="bulleted">a</listItem>' +
					'<listItem listIndent="0" listType="bulleted">b</listItem>' +
					'<listItem listIndent="1" listType="bulleted">c</listItem>' +
					'<listItem listIndent="2" listType="bulleted">d</listItem>' +
					'<listItem listIndent="2" listType="bulleted">e</listItem>' +
					'<listItem listIndent="2" listType="bulleted">f</listItem>' +
					'<listItem listIndent="0" listType="bulleted">g</listItem>'
				);
			} );

			it( 'should increment indent of all sub-items of indented item', () => {
				model.change( writer => {
					writer.setSelection( root.getChild( 1 ), 0 );
				} );

				command.execute();

				expect( getData( model, { withoutSelection: true } ) ).to.equal(
					'<listItem listIndent="0" listType="bulleted">a</listItem>' +
					'<listItem listIndent="1" listType="bulleted">b</listItem>' +
					'<listItem listIndent="2" listType="bulleted">c</listItem>' +
					'<listItem listIndent="3" listType="bulleted">d</listItem>' +
					'<listItem listIndent="3" listType="bulleted">e</listItem>' +
					'<listItem listIndent="2" listType="bulleted">f</listItem>' +
					'<listItem listIndent="0" listType="bulleted">g</listItem>'
				);
			} );

			it( 'should increment indent of all selected item when multiple items are selected', () => {
				model.change( writer => {
					writer.setSelection( writer.createRange(
						writer.createPositionFromPath( root.getChild( 1 ), [ 0 ] ),
						writer.createPositionFromPath( root.getChild( 3 ), [ 1 ] )
					) );
				} );

				command.execute();

				expect( getData( model, { withoutSelection: true } ) ).to.equal(
					'<listItem listIndent="0" listType="bulleted">a</listItem>' +
					'<listItem listIndent="1" listType="bulleted">b</listItem>' +
					'<listItem listIndent="2" listType="bulleted">c</listItem>' +
					'<listItem listIndent="3" listType="bulleted">d</listItem>' +
					'<listItem listIndent="2" listType="bulleted">e</listItem>' +
					'<listItem listIndent="1" listType="bulleted">f</listItem>' +
					'<listItem listIndent="0" listType="bulleted">g</listItem>'
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
				model.change( writer => {
					writer.setSelection( root.getChild( 5 ), 0 );
				} );

				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be true if selection starts in first list item', () => {
				// This is in contrary to forward indent command.
				model.change( writer => {
					writer.setSelection( root.getChild( 0 ), 0 );
				} );

				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be true if selection starts in a list item that has bigger indent than it\'s previous sibling', () => {
				// This is in contrary to forward indent command.
				model.change( writer => {
					writer.setSelection( root.getChild( 2 ), 0 );
				} );

				expect( command.isEnabled ).to.be.true;
			} );
		} );

		describe( 'execute()', () => {
			it( 'should decrement indent attribute by 1 (if it is bigger than 0)', () => {
				model.change( writer => {
					writer.setSelection( root.getChild( 5 ), 0 );
				} );

				command.execute();

				expect( getData( model, { withoutSelection: true } ) ).to.equal(
					'<listItem listIndent="0" listType="bulleted">a</listItem>' +
					'<listItem listIndent="0" listType="bulleted">b</listItem>' +
					'<listItem listIndent="1" listType="bulleted">c</listItem>' +
					'<listItem listIndent="2" listType="bulleted">d</listItem>' +
					'<listItem listIndent="2" listType="bulleted">e</listItem>' +
					'<listItem listIndent="0" listType="bulleted">f</listItem>' +
					'<listItem listIndent="0" listType="bulleted">g</listItem>'
				);
			} );

			it( 'should rename listItem to paragraph (if indent is equal to 0)', () => {
				model.change( writer => {
					writer.setSelection( root.getChild( 0 ), 0 );
				} );

				command.execute();

				expect( getData( model, { withoutSelection: true } ) ).to.equal(
					'<paragraph listIndent="0" listType="bulleted">a</paragraph>' +
					'<listItem listIndent="0" listType="bulleted">b</listItem>' +
					'<listItem listIndent="1" listType="bulleted">c</listItem>' +
					'<listItem listIndent="2" listType="bulleted">d</listItem>' +
					'<listItem listIndent="2" listType="bulleted">e</listItem>' +
					'<listItem listIndent="1" listType="bulleted">f</listItem>' +
					'<listItem listIndent="0" listType="bulleted">g</listItem>'
				);
			} );

			it( 'should decrement indent of all sub-items of outdented item', () => {
				model.change( writer => {
					writer.setSelection( root.getChild( 1 ), 0 );
				} );

				command.execute();

				expect( getData( model, { withoutSelection: true } ) ).to.equal(
					'<listItem listIndent="0" listType="bulleted">a</listItem>' +
					'<paragraph listIndent="0" listType="bulleted">b</paragraph>' +
					'<listItem listIndent="0" listType="bulleted">c</listItem>' +
					'<listItem listIndent="1" listType="bulleted">d</listItem>' +
					'<listItem listIndent="1" listType="bulleted">e</listItem>' +
					'<listItem listIndent="0" listType="bulleted">f</listItem>' +
					'<listItem listIndent="0" listType="bulleted">g</listItem>'
				);
			} );

			it( 'should outdent all selected item when multiple items are selected', () => {
				model.change( writer => {
					writer.setSelection( writer.createRange(
						writer.createPositionFromPath( root.getChild( 1 ), [ 0 ] ),
						writer.createPositionFromPath( root.getChild( 3 ), [ 1 ] )
					) );
				} );

				command.execute();

				expect( getData( model, { withoutSelection: true } ) ).to.equal(
					'<listItem listIndent="0" listType="bulleted">a</listItem>' +
					'<paragraph listIndent="0" listType="bulleted">b</paragraph>' +
					'<listItem listIndent="0" listType="bulleted">c</listItem>' +
					'<listItem listIndent="1" listType="bulleted">d</listItem>' +
					'<listItem listIndent="2" listType="bulleted">e</listItem>' +
					'<listItem listIndent="1" listType="bulleted">f</listItem>' +
					'<listItem listIndent="0" listType="bulleted">g</listItem>'
				);
			} );
		} );
	} );
} );
