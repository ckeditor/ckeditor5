/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Editor from '/ckeditor5/core/editor/editor.js';
import Document from '/ckeditor5/engine/model/document.js';
import ListCommand from '/ckeditor5/list/listcommand.js';
import Range from '/ckeditor5/engine/model/range.js';
import Position from '/ckeditor5/engine/model/position.js';
import { setData, getData } from '/ckeditor5/engine/dev-utils/model.js';

let editor, command, doc, root;

beforeEach( () => {
	editor = new Editor();
	editor.document = new Document();

	doc = editor.document;
	root = doc.createRoot();

	command = new ListCommand( editor, 'bulleted' );

	doc.schema.registerItem( 'listItem', '$block' );
	doc.schema.registerItem( 'paragraph', '$block' );
	doc.schema.registerItem( 'widget', '$block' );

	doc.schema.allow( { name: '$block', inside: '$root' } );
	doc.schema.allow( { name: 'listItem', attributes: [ 'type', 'indent' ], inside: '$root' } );
	doc.schema.disallow( { name: 'listItem', attributes: [ 'type', 'indent' ], inside: 'widget' } );

	setData(
		doc,
		'<paragraph>foo</paragraph>' +
		'<listItem type="bulleted" indent="0">bulleted</listItem>' +
		'<listItem type="numbered" indent="0">numbered</listItem>' +
		'<paragraph>bar</paragraph>' +
		'<widget>' +
			'<paragraph>xyz</paragraph>' +
		'</widget>'
	);

	doc.selection.collapse( doc.getRoot().getChild( 0 ) );
} );

afterEach( () => {
	command.destroy();
} );

describe( 'ListCommand', () => {
	describe( 'constructor', () => {
		it( 'should create list command with given type and value set to false', () => {
			expect( command.type ).to.equal( 'bulleted' );
			expect( command.value ).to.be.false;

			const numberedList = new ListCommand( editor, 'numbered' );
			expect( numberedList.type ).to.equal( 'numbered' );
		} );
	} );

	describe( 'value', () => {
		it( 'should be false if first position in selection is not in a list item', () => {
			doc.selection.collapse( doc.getRoot().getChild( 3 ) );
			expect( command.value ).to.be.false;
		} );

		it( 'should be false if first position in selection is in a list item of different type', () => {
			doc.selection.collapse( doc.getRoot().getChild( 2 ) );
			expect( command.value ).to.be.false;
		} );

		it( 'should be true if first position in selection is in a list item of same type', () => {
			doc.selection.collapse( doc.getRoot().getChild( 1 ) );
			expect( command.value ).to.be.true;
		} );
	} );

	describe( 'isEnabled', () => {
		it( 'should be true if command value is true', () => {
			command.value = true;
			command.refreshState();

			expect( command.isEnabled ).to.be.true;

			command.value = false;
			doc.selection.collapse( doc.getRoot().getChild( 1 ) );

			expect( command.value ).to.be.true;
			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be true if selection first position is in a place where listItem can be inserted', () => {
			doc.selection.collapse( doc.getRoot(), 2 );
			expect( command.isEnabled ).to.be.true;

			doc.selection.collapse( doc.getRoot().getChild( 0 ) );
			expect( command.isEnabled ).to.be.true;

			doc.selection.collapse( doc.getRoot().getChild( 2 ) );
			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be false if selection first position is in a place where listItem cannot be inserted', () => {
			doc.selection.collapse( doc.getRoot().getChild( 4 ) );
			expect( command.isEnabled ).to.be.false;
		} );
	} );

	describe( '_doExecute', () => {
		describe( 'collapsed selection', () => {
			it( 'should rename closest block to listItem and set correct attributes', () => {
				setData( doc, '<paragraph>fo[]o</paragraph>' );

				command._doExecute();

				expect( getData( doc ) ).to.equal( '<listItem indent="0" type="bulleted">fo[]o</listItem>' );
			} );

			it( 'should rename closest listItem to paragraph and remove attributes', () => {
				setData( doc, '<listItem indent="0" type="bulleted">fo[]o</listItem>' );

				command._doExecute();

				expect( getData( doc ) ).to.equal( '<paragraph>fo[]o</paragraph>' );
			} );

			it( 'should change closest listItem\' type', () => {
				setData( doc, '<listItem indent="0" type="numbered">fo[]o</listItem>' );

				command._doExecute();

				expect( getData( doc ) ).to.equal( '<listItem indent="0" type="bulleted">fo[]o</listItem>' );
			} );

			it( 'should handle outdenting sub-items when list item is turned off', () => {
				// Taken from docs.
				//
				// 1  * --------
				// 2     * --------
				// 3        * -------- <- this is turned off.
				// 4           * -------- <- this has to become indent = 0, because it will be first item on a new list.
				// 5              * -------- <- this should be still be a child of item above, so indent = 1.
				// 6        * -------- <- this also has to become indent = 0, because it shouldn't end up as a child of any of items above.
				// 7           * -------- <- this should be still be a child of item above, so indent = 1.
				// 8     * -------- <- this has to become indent = 0.
				// 9        * -------- <- this should still be a child of item above, so indent = 1.
				// 10          * -------- <- this should still be a child of item above, so indent = 2.
				// 11          * -------- <- this should still be at the same level as item above, so indent = 2.
				// 12 * -------- <- this and all below are left unchanged.
				// 13    * --------
				// 14       * --------
				//
				// After turning off "3", the list becomes:
				//
				// 1  * --------
				// 2     * --------
				//
				// 3  --------
				//
				// 4  * --------
				// 5     * --------
				// 6  * --------
				// 7     * --------
				// 8  * --------
				// 9     * --------
				// 10       * --------
				// 11       * --------
				// 12 * --------
				// 13    * --------
				// 14       * --------

				setData(
					doc,
					'<listItem indent="0" type="bulleted">---</listItem>' +
					'<listItem indent="1" type="bulleted">---</listItem>' +
					'<listItem indent="2" type="bulleted">[]---</listItem>' +
					'<listItem indent="3" type="bulleted">---</listItem>' +
					'<listItem indent="4" type="bulleted">---</listItem>' +
					'<listItem indent="2" type="bulleted">---</listItem>' +
					'<listItem indent="3" type="bulleted">---</listItem>' +
					'<listItem indent="1" type="bulleted">---</listItem>' +
					'<listItem indent="2" type="bulleted">---</listItem>' +
					'<listItem indent="3" type="bulleted">---</listItem>' +
					'<listItem indent="3" type="bulleted">---</listItem>' +
					'<listItem indent="0" type="bulleted">---</listItem>' +
					'<listItem indent="1" type="bulleted">---</listItem>' +
					'<listItem indent="2" type="bulleted">---</listItem>'
				);

				command._doExecute();

				const expectedData =
					'<listItem indent="0" type="bulleted">---</listItem>' +
					'<listItem indent="1" type="bulleted">---</listItem>' +
					'<paragraph>[]---</paragraph>' +
					'<listItem indent="0" type="bulleted">---</listItem>' +
					'<listItem indent="1" type="bulleted">---</listItem>' +
					'<listItem indent="0" type="bulleted">---</listItem>' +
					'<listItem indent="1" type="bulleted">---</listItem>' +
					'<listItem indent="0" type="bulleted">---</listItem>' +
					'<listItem indent="1" type="bulleted">---</listItem>' +
					'<listItem indent="2" type="bulleted">---</listItem>' +
					'<listItem indent="2" type="bulleted">---</listItem>' +
					'<listItem indent="0" type="bulleted">---</listItem>' +
					'<listItem indent="1" type="bulleted">---</listItem>' +
					'<listItem indent="2" type="bulleted">---</listItem>';

				expect( getData( doc ) ).to.equal( expectedData );
			} );
		} );

		describe( 'non-collapsed selection', () => {
			beforeEach( () => {
				setData(
					doc,
					'<listItem indent="0" type="bulleted">---</listItem>' +
					'<listItem indent="0" type="bulleted">---</listItem>' +
					'<paragraph>---</paragraph>' +
					'<paragraph>---</paragraph>' +
					'<listItem indent="0" type="numbered">---</listItem>' +
					'<listItem indent="0" type="numbered">---</listItem>' +
					'<listItem indent="1" type="bulleted">---</listItem>' +
					'<listItem indent="2" type="bulleted">---</listItem>'
				);
			} );

			it( 'should rename closest block to listItem and set correct attributes', () => {
				// From first paragraph to second paragraph.
				// Command value=false, we are turning on list items.
				doc.selection.setRanges( [ new Range(
					Position.createAt( root.getChild( 2 ) ),
					Position.createAt( root.getChild( 3 ) )
				) ] );

				command._doExecute();

				const expectedData =
					'<listItem indent="0" type="bulleted">---</listItem>' +
					'<listItem indent="0" type="bulleted">---</listItem>' +
					'<listItem indent="0" type="bulleted">[---</listItem>' +
					'<listItem indent="0" type="bulleted">]---</listItem>' +
					'<listItem indent="0" type="numbered">---</listItem>' +
					'<listItem indent="0" type="numbered">---</listItem>' +
					'<listItem indent="1" type="bulleted">---</listItem>' +
					'<listItem indent="2" type="bulleted">---</listItem>';

				expect( getData( doc ) ).to.equal( expectedData );
			} );

			it( 'should rename closest listItem to paragraph and remove attributes', () => {
				// From second bullet list item to first numbered list item.
				// Command value=true, we are turning off list items.
				doc.selection.setRanges( [ new Range(
					Position.createAt( root.getChild( 1 ) ),
					Position.createAt( root.getChild( 4 ) )
				) ] );

				// Convert paragraphs, leave numbered list items.
				command._doExecute();

				const expectedData =
					'<listItem indent="0" type="bulleted">---</listItem>' +
					'<paragraph>[---</paragraph>' +
					'<paragraph>---</paragraph>' +
					'<paragraph>---</paragraph>' +
					'<paragraph>]---</paragraph>' +
					'<listItem indent="0" type="numbered">---</listItem>' +
					'<listItem indent="1" type="bulleted">---</listItem>' +
					'<listItem indent="2" type="bulleted">---</listItem>';

				expect( getData( doc ) ).to.equal( expectedData );
			} );

			it( 'should change closest listItem\'s type', () => {
				// From first numbered lsit item to third bulleted list item.
				doc.selection.setRanges( [ new Range(
					Position.createAt( root.getChild( 4 ) ),
					Position.createAt( root.getChild( 6 ) )
				) ] );

				// Convert paragraphs, leave numbered list items.
				command._doExecute();

				const expectedData =
					'<listItem indent="0" type="bulleted">---</listItem>' +
					'<listItem indent="0" type="bulleted">---</listItem>' +
					'<paragraph>---</paragraph>' +
					'<paragraph>---</paragraph>' +
					'<listItem indent="0" type="bulleted">[---</listItem>' +
					'<listItem indent="0" type="bulleted">---</listItem>' +
					'<listItem indent="1" type="bulleted">]---</listItem>' +
					'<listItem indent="2" type="bulleted">---</listItem>';

				expect( getData( doc ) ).to.equal( expectedData );
			} );

			it( 'should handle outdenting sub-items when list item is turned off', () => {
				// From first numbered lsit item to third bulleted list item.
				doc.selection.setRanges( [ new Range(
					Position.createAt( root.getChild( 1 ) ),
					Position.createAt( root.getChild( 5 ) )
				) ] );

				// Convert paragraphs, leave numbered list items.
				command._doExecute();

				const expectedData =
					'<listItem indent="0" type="bulleted">---</listItem>' +
					'<paragraph>[---</paragraph>' +
					'<paragraph>---</paragraph>' +
					'<paragraph>---</paragraph>' +
					'<paragraph>---</paragraph>' +
					'<paragraph>]---</paragraph>' +
					'<listItem indent="0" type="bulleted">---</listItem>' +
					'<listItem indent="1" type="bulleted">---</listItem>';

				expect( getData( doc ) ).to.equal( expectedData );
			} );
		} );
	} );
} );
