/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Editor from 'ckeditor5/core/editor/editor.js';
import Document from 'ckeditor5/engine/model/document.js';
import IndentCommand from 'ckeditor5/list/indentcommand.js';
import Range from 'ckeditor5/engine/model/range.js';
import Position from 'ckeditor5/engine/model/position.js';
import { setData, getData } from 'ckeditor5/engine/dev-utils/model.js';

describe( 'IndentCommand', () => {
	let editor, doc, root;

	beforeEach( () => {
		editor = new Editor();
		editor.document = new Document();

		doc = editor.document;
		root = doc.createRoot();

		doc.schema.registerItem( 'listItem', '$block' );

		doc.schema.allow( { name: '$block', inside: '$root' } );
		doc.schema.allow( { name: 'listItem', attributes: [ 'type', 'indent' ], inside: '$root' } );

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

			it( 'should increment indent of only first selected item when multiple items are selected', () => {
				doc.selection.setRanges( [ new Range(
					new Position( root.getChild( 4 ), [ 0 ] ),
					new Position( root.getChild( 6 ), [ 0 ] )
				) ] );

				command._doExecute();

				expect( getData( doc, { withoutSelection: true } ) ).to.equal(
					'<listItem indent="0" type="bulleted">a</listItem>' +
					'<listItem indent="0" type="bulleted">b</listItem>' +
					'<listItem indent="1" type="bulleted">c</listItem>' +
					'<listItem indent="2" type="bulleted">d</listItem>' +
					'<listItem indent="3" type="bulleted">e</listItem>' +
					'<listItem indent="1" type="bulleted">f</listItem>' +
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
					'<paragraph>a</paragraph>' +
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
					'<paragraph>b</paragraph>' +
					'<listItem indent="0" type="bulleted">c</listItem>' +
					'<listItem indent="1" type="bulleted">d</listItem>' +
					'<listItem indent="1" type="bulleted">e</listItem>' +
					'<listItem indent="0" type="bulleted">f</listItem>' +
					'<listItem indent="0" type="bulleted">g</listItem>'
				);
			} );
		} );
	} );
} );
