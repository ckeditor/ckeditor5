/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Editor from '@ckeditor/ckeditor5-core/src/editor/editor';
import Document from '@ckeditor/ckeditor5-engine/src/model/document';
import IndentCommand from '../src/indentcommand';
import Range from '@ckeditor/ckeditor5-engine/src/model/range';
import Position from '@ckeditor/ckeditor5-engine/src/model/position';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'IndentCommand', () => {
	let editor, doc, root;

	beforeEach( () => {
		editor = new Editor();
		editor.document = new Document();

		doc = editor.document;
		root = doc.createRoot();

		doc.schema.registerItem( 'listItem', '$block' );
		doc.schema.registerItem( 'paragraph', '$block' );

		doc.schema.allow( { name: '$block', inside: '$root' } );
		doc.schema.allow( { name: 'listItem', attributes: [ 'type', 'indent' ], inside: '$root' } );
		doc.schema.allow( { name: 'paragraph', inside: '$root' } );

		setData(
			doc,
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
				doc.selection.collapse( root.getChild( 5 ) );

				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be false if selection starts in first list item', () => {
				doc.selection.collapse( root.getChild( 0 ) );

				expect( command.isEnabled ).to.be.false;
			} );

			it( 'should be false if selection starts in a list item that has bigger indent than it\'s previous sibling', () => {
				doc.selection.collapse( root.getChild( 2 ) );

				expect( command.isEnabled ).to.be.false;
			} );

			// Edge case but may happen that some other blocks will also use the indent attribute
			// and before we fixed it the command was enabled in such a case.
			it( 'should be false if selection starts in a paragraph with indent attribute', () => {
				doc.schema.allow( { name: 'paragraph', attributes: [ 'indent' ], inside: '$root' } );
				setData( doc, '<listItem indent="0">a</listItem><paragraph indent="0">b[]</paragraph>' );

				expect( command.isEnabled ).to.be.false;
			} );
		} );

		describe( '_doExecute', () => {
			it( 'should increment indent attribute by 1', () => {
				doc.selection.collapse( root.getChild( 5 ) );

				command._doExecute();

				expect( getData( doc, { withoutSelection: true } ) ).to.equal(
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
				doc.selection.collapse( root.getChild( 1 ) );

				command._doExecute();

				expect( getData( doc, { withoutSelection: true } ) ).to.equal(
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
				doc.selection.setRanges( [ new Range(
					new Position( root.getChild( 1 ), [ 0 ] ),
					new Position( root.getChild( 3 ), [ 0 ] )
				) ] );

				command._doExecute();

				expect( getData( doc, { withoutSelection: true } ) ).to.equal(
					'<listItem indent="0" type="bulleted">a</listItem>' +
					'<listItem indent="1" type="bulleted">b</listItem>' +
					'<listItem indent="2" type="bulleted">c</listItem>' +
					'<listItem indent="3" type="bulleted">d</listItem>' +
					'<listItem indent="2" type="bulleted">e</listItem>' +
					'<listItem indent="1" type="bulleted">f</listItem>' +
					'<listItem indent="0" type="bulleted">g</listItem>'
				);
			} );

			it( 'should fix list type when item is intended if needed', () => {
				setData(
					doc,
					'<listItem indent="0" type="bulleted">a</listItem>' +
					'<listItem indent="1" type="bulleted">b</listItem>' +
					'<listItem indent="2" type="numbered">c</listItem>' +
					'<listItem indent="1" type="bulleted">d</listItem>'
				);

				doc.selection.setRanges( [ new Range(
					new Position( root.getChild( 3 ), [ 0 ] )
				) ] );

				command._doExecute();

				expect( getData( doc, { withoutSelection: true } ) ).to.equal(
					'<listItem indent="0" type="bulleted">a</listItem>' +
					'<listItem indent="1" type="bulleted">b</listItem>' +
					'<listItem indent="2" type="numbered">c</listItem>' +
					'<listItem indent="2" type="numbered">d</listItem>'
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
				doc.selection.collapse( root.getChild( 5 ) );

				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be true if selection starts in first list item', () => {
				// This is in contrary to forward indent command.
				doc.selection.collapse( root.getChild( 0 ) );

				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be true if selection starts in a list item that has bigger indent than it\'s previous sibling', () => {
				// This is in contrary to forward indent command.
				doc.selection.collapse( root.getChild( 2 ) );

				expect( command.isEnabled ).to.be.true;
			} );
		} );

		describe( '_doExecute', () => {
			it( 'should decrement indent attribute by 1 (if it is bigger than 0)', () => {
				doc.selection.collapse( root.getChild( 5 ) );

				command._doExecute();

				expect( getData( doc, { withoutSelection: true } ) ).to.equal(
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
				doc.selection.collapse( root.getChild( 0 ) );

				command._doExecute();

				expect( getData( doc, { withoutSelection: true } ) ).to.equal(
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
				doc.selection.collapse( root.getChild( 1 ) );

				command._doExecute();

				expect( getData( doc, { withoutSelection: true } ) ).to.equal(
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
				doc.selection.setRanges( [ new Range(
					new Position( root.getChild( 1 ), [ 0 ] ),
					new Position( root.getChild( 3 ), [ 0 ] )
				) ] );

				command._doExecute();

				expect( getData( doc, { withoutSelection: true } ) ).to.equal(
					'<listItem indent="0" type="bulleted">a</listItem>' +
					'<paragraph indent="0" type="bulleted">b</paragraph>' +
					'<listItem indent="0" type="bulleted">c</listItem>' +
					'<listItem indent="1" type="bulleted">d</listItem>' +
					'<listItem indent="2" type="bulleted">e</listItem>' +
					'<listItem indent="1" type="bulleted">f</listItem>' +
					'<listItem indent="0" type="bulleted">g</listItem>'
				);
			} );

			it( 'should fix list type when item is outdented if needed', () => {
				setData(
					doc,
					'<listItem indent="0" type="bulleted">a</listItem>' +
					'<listItem indent="1" type="bulleted">b</listItem>' +
					'<listItem indent="2" type="numbered">c</listItem>'
				);

				doc.selection.setRanges( [ new Range(
					new Position( root.getChild( 2 ), [ 0 ] )
				) ] );

				command._doExecute();

				expect( getData( doc, { withoutSelection: true } ) ).to.equal(
					'<listItem indent="0" type="bulleted">a</listItem>' +
					'<listItem indent="1" type="bulleted">b</listItem>' +
					'<listItem indent="1" type="bulleted">c</listItem>'
				);
			} );

			it( 'should not fix list type if item is outdented to top level', () => {
				setData(
					doc,
					'<listItem indent="0" type="bulleted">a</listItem>' +
					'<listItem indent="1" type="numbered">b</listItem>'
				);

				doc.selection.setRanges( [ new Range(
					new Position( root.getChild( 1 ), [ 0 ] )
				) ] );

				command._doExecute();

				expect( getData( doc, { withoutSelection: true } ) ).to.equal(
					'<listItem indent="0" type="bulleted">a</listItem>' +
					'<listItem indent="0" type="numbered">b</listItem>'
				);
			} );
		} );
	} );
} );
