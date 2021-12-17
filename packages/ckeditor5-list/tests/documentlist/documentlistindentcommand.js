/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import DocumentListIndentCommand from '../../src/documentlist/documentlistindentcommand';

import Editor from '@ckeditor/ckeditor5-core/src/editor/editor';
import Model from '@ckeditor/ckeditor5-engine/src/model/model';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'DocumentListIndentCommand', () => {
	let editor, model, doc, root;

	beforeEach( () => {
		editor = new Editor();
		editor.model = new Model();

		model = editor.model;
		doc = model.document;
		root = doc.createRoot();

		model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );
		model.schema.register( 'blockQuote', { inheritAllFrom: '$container' } );
		model.schema.extend( '$container', { allowAttributes: [ 'listType', 'listIndent', 'listItemId' ] } );

		setData( model,
			'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
			'<paragraph listIndent="0" listItemId="b" listType="bulleted">1</paragraph>' +
			'<paragraph listIndent="1" listItemId="c" listType="bulleted">2</paragraph>' +
			'<paragraph listIndent="2" listItemId="d" listType="bulleted">3</paragraph>' +
			'<paragraph listIndent="2" listItemId="e" listType="bulleted">4</paragraph>' +
			'<paragraph listIndent="1" listItemId="f" listType="bulleted">5</paragraph>' +
			'<paragraph listIndent="0" listItemId="g" listType="bulleted">6</paragraph>'
		);
	} );

	describe( 'forward (indent)', () => {
		let command;

		beforeEach( () => {
			command = new DocumentListIndentCommand( editor, 'forward' );
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

			it( 'should be false if selection starts in first list item #2', () => {
				setData( model,
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
					'<paragraph listIndent="0" listItemId="c" listType="bulleted">c</paragraph>' +
					'<paragraph listIndent="1" listItemId="d" listType="bulleted">[]d</paragraph>' +
					'<paragraph listIndent="2" listItemId="e" listType="bulleted">e</paragraph>'
				);

				expect( command.isEnabled ).to.be.false;
			} );

			// Reported in PR #53.
			it( 'should be false if selection starts in first list item #3', () => {
				setData(
					model,
					'<paragraph listIndent="0" listItemId="" listType="bulleted">a</paragraph>' +
					'<paragraph listIndent="1" listItemId="" listType="bulleted">b</paragraph>' +
					'<paragraph listIndent="0" listItemId="" listType="numbered">c</paragraph>' +
					'<paragraph listIndent="1" listItemId="" listType="bulleted">d</paragraph>' +
					'<paragraph listIndent="0" listItemId="" listType="bulleted">[]e</paragraph>'
				);

				expect( command.isEnabled ).to.be.false;
			} );

			it( 'should be false if selection starts in first list item of top level list with different type than previous list', () => {
				setData(
					model,
					'<paragraph listIndent="0" listItemId="" listType="bulleted">a</paragraph>' +
					'<paragraph listIndent="0" listItemId="" listType="numbered">[]b</paragraph>'
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

				setData( model,
					'<paragraph listIndent="0">a</paragraph>' +
					'<paragraph listIndent="0">b[]</paragraph>'
				);

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
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
					'<paragraph listIndent="0" listItemId="b" listType="bulleted">1</paragraph>' +
					'<paragraph listIndent="1" listItemId="c" listType="bulleted">2</paragraph>' +
					'<paragraph listIndent="2" listItemId="d" listType="bulleted">3</paragraph>' +
					'<paragraph listIndent="2" listItemId="e" listType="bulleted">4</paragraph>' +
					'<paragraph listIndent="2" listItemId="f" listType="bulleted">5</paragraph>' +
					'<paragraph listIndent="0" listItemId="g" listType="bulleted">6</paragraph>'
				);
			} );

			it( 'should increment indent of all sub-items of indented item', () => {
				model.change( writer => {
					writer.setSelection( root.getChild( 1 ), 0 );
				} );

				command.execute();

				expect( getData( model, { withoutSelection: true } ) ).to.equal(
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="bulleted">1</paragraph>' +
					'<paragraph listIndent="2" listItemId="c" listType="bulleted">2</paragraph>' +
					'<paragraph listIndent="3" listItemId="d" listType="bulleted">3</paragraph>' +
					'<paragraph listIndent="3" listItemId="e" listType="bulleted">4</paragraph>' +
					'<paragraph listIndent="2" listItemId="f" listType="bulleted">5</paragraph>' +
					'<paragraph listIndent="0" listItemId="g" listType="bulleted">6</paragraph>'
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
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="bulleted">1</paragraph>' +
					'<paragraph listIndent="2" listItemId="c" listType="bulleted">2</paragraph>' +
					'<paragraph listIndent="3" listItemId="d" listType="bulleted">3</paragraph>' +
					'<paragraph listIndent="2" listItemId="e" listType="bulleted">4</paragraph>' +
					'<paragraph listIndent="1" listItemId="f" listType="bulleted">5</paragraph>' +
					'<paragraph listIndent="0" listItemId="g" listType="bulleted">6</paragraph>'
				);
			} );

			it( 'should fire "afterExecute" event after finish all operations with all changed items', done => {
				model.change( writer => {
					writer.setSelection( root.getChild( 1 ), 0 );
				} );

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
			command = new DocumentListIndentCommand( editor, 'backward' );
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
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
					'<paragraph listIndent="0" listItemId="b" listType="bulleted">1</paragraph>' +
					'<paragraph listIndent="1" listItemId="c" listType="bulleted">2</paragraph>' +
					'<paragraph listIndent="2" listItemId="d" listType="bulleted">3</paragraph>' +
					'<paragraph listIndent="2" listItemId="e" listType="bulleted">4</paragraph>' +
					'<paragraph listIndent="0" listItemId="f" listType="bulleted">5</paragraph>' +
					'<paragraph listIndent="0" listItemId="g" listType="bulleted">6</paragraph>'
				);
			} );

			it( 'should remove list attributes (if indent is less than to 0)', () => {
				model.change( writer => {
					writer.setSelection( root.getChild( 0 ), 0 );
				} );

				command.execute();

				expect( getData( model, { withoutSelection: true } ) ).to.equal(
					'<paragraph>0</paragraph>' +
					'<paragraph listIndent="0" listItemId="b" listType="bulleted">1</paragraph>' +
					'<paragraph listIndent="1" listItemId="c" listType="bulleted">2</paragraph>' +
					'<paragraph listIndent="2" listItemId="d" listType="bulleted">3</paragraph>' +
					'<paragraph listIndent="2" listItemId="e" listType="bulleted">4</paragraph>' +
					'<paragraph listIndent="1" listItemId="f" listType="bulleted">5</paragraph>' +
					'<paragraph listIndent="0" listItemId="g" listType="bulleted">6</paragraph>'
				);
			} );

			it( 'should decrement indent of all sub-items of outdented item', () => {
				model.change( writer => {
					writer.setSelection( root.getChild( 1 ), 0 );
				} );

				command.execute();

				expect( getData( model, { withoutSelection: true } ) ).to.equal(
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
					'<paragraph>1</paragraph>' +
					'<paragraph listIndent="0" listItemId="c" listType="bulleted">2</paragraph>' +
					'<paragraph listIndent="1" listItemId="d" listType="bulleted">3</paragraph>' +
					'<paragraph listIndent="1" listItemId="e" listType="bulleted">4</paragraph>' +
					'<paragraph listIndent="0" listItemId="f" listType="bulleted">5</paragraph>' +
					'<paragraph listIndent="0" listItemId="g" listType="bulleted">6</paragraph>'
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
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
					'<paragraph>1</paragraph>' +
					'<paragraph listIndent="0" listItemId="c" listType="bulleted">2</paragraph>' +
					'<paragraph listIndent="1" listItemId="d" listType="bulleted">3</paragraph>' +
					'<paragraph listIndent="2" listItemId="e" listType="bulleted">4</paragraph>' +
					'<paragraph listIndent="1" listItemId="f" listType="bulleted">5</paragraph>' +
					'<paragraph listIndent="0" listItemId="g" listType="bulleted">6</paragraph>'
				);
			} );
		} );
	} );
} );
