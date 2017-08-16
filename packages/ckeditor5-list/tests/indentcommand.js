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
				doc.enqueueChanges( () => {
					doc.selection.setCollapsedAt( root.getChild( 5 ) );
				} );

				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be false if selection starts in first list item', () => {
				doc.enqueueChanges( () => {
					doc.selection.setCollapsedAt( root.getChild( 0 ) );
				} );

				expect( command.isEnabled ).to.be.false;
			} );

			// Reported in PR #53.
			it( 'should be false if selection starts in first list item #2', () => {
				setData(
					doc,
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
					doc,
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
					doc,
					'<listItem indent="0" type="bulleted">a</listItem>' +
					'<listItem indent="0" type="numbered">[]b</listItem>'
				);

				expect( command.isEnabled ).to.be.false;
			} );

			it( 'should be false if selection starts in a list item that has bigger indent than it\'s previous sibling', () => {
				doc.enqueueChanges( () => {
					doc.selection.setCollapsedAt( root.getChild( 2 ) );
				} );

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

		describe( 'execute()', () => {
			it( 'should increment indent attribute by 1', () => {
				doc.enqueueChanges( () => {
					doc.selection.setCollapsedAt( root.getChild( 5 ) );
				} );

				command.execute();

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
				doc.enqueueChanges( () => {
					doc.selection.setCollapsedAt( root.getChild( 1 ) );
				} );

				command.execute();

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
				doc.enqueueChanges( () => {
					doc.selection.setRanges( [ new Range(
						new Position( root.getChild( 1 ), [ 0 ] ),
						new Position( root.getChild( 3 ), [ 1 ] )
					) ] );
				} );

				command.execute();

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

			it( 'should fix list type when item is intended #1', () => {
				setData(
					doc,
					'<listItem indent="0" type="bulleted">a</listItem>' +
					'<listItem indent="1" type="bulleted">b</listItem>' +
					'<listItem indent="2" type="numbered">c</listItem>' +
					'<listItem indent="1" type="bulleted">[]d</listItem>'
				);

				command.execute();

				expect( getData( doc, { withoutSelection: true } ) ).to.equal(
					'<listItem indent="0" type="bulleted">a</listItem>' +
					'<listItem indent="1" type="bulleted">b</listItem>' +
					'<listItem indent="2" type="numbered">c</listItem>' +
					'<listItem indent="2" type="numbered">d</listItem>'
				);
			} );

			// Not only boundary list items has to be fixed, but also items in the middle of selection.
			it( 'should fix list type when item is intended #2', () => {
				setData(
					doc,
					'<listItem indent="0" type="bulleted">a</listItem>' +
					'<listItem indent="1" type="numbered">b</listItem>' +
					'<listItem indent="1" type="numbered">[c</listItem>' +
					'<listItem indent="0" type="bulleted">d</listItem>' +
					'<listItem indent="1" type="numbered">e]</listItem>' +
					'<listItem indent="0" type="bulleted">f</listItem>'
				);

				command.execute();

				expect( getData( doc, { withoutSelection: true } ) ).to.equal(
					'<listItem indent="0" type="bulleted">a</listItem>' +
					'<listItem indent="1" type="numbered">b</listItem>' +
					'<listItem indent="2" type="numbered">c</listItem>' +
					'<listItem indent="1" type="numbered">d</listItem>' +
					'<listItem indent="2" type="numbered">e</listItem>' +
					'<listItem indent="0" type="bulleted">f</listItem>'
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
				doc.enqueueChanges( () => {
					doc.selection.setCollapsedAt( root.getChild( 5 ) );
				} );

				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be true if selection starts in first list item', () => {
				// This is in contrary to forward indent command.
				doc.enqueueChanges( () => {
					doc.selection.setCollapsedAt( root.getChild( 0 ) );
				} );

				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be true if selection starts in a list item that has bigger indent than it\'s previous sibling', () => {
				// This is in contrary to forward indent command.
				doc.enqueueChanges( () => {
					doc.selection.setCollapsedAt( root.getChild( 2 ) );
				} );

				expect( command.isEnabled ).to.be.true;
			} );
		} );

		describe( 'execute()', () => {
			it( 'should decrement indent attribute by 1 (if it is bigger than 0)', () => {
				doc.enqueueChanges( () => {
					doc.selection.setCollapsedAt( root.getChild( 5 ) );
				} );

				command.execute();

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
				doc.enqueueChanges( () => {
					doc.selection.setCollapsedAt( root.getChild( 0 ) );
				} );

				command.execute();

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
				doc.enqueueChanges( () => {
					doc.selection.setCollapsedAt( root.getChild( 1 ) );
				} );

				command.execute();

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
				doc.enqueueChanges( () => {
					doc.selection.setRanges( [ new Range(
						new Position( root.getChild( 1 ), [ 0 ] ),
						new Position( root.getChild( 3 ), [ 1 ] )
					) ] );
				} );

				command.execute();

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

			it( 'should fix list type when item is outdented #1', () => {
				setData(
					doc,
					'<listItem indent="0" type="bulleted">a</listItem>' +
					'<listItem indent="1" type="bulleted">b</listItem>' +
					'<listItem indent="2" type="numbered">[]c</listItem>'
				);

				command.execute();

				expect( getData( doc, { withoutSelection: true } ) ).to.equal(
					'<listItem indent="0" type="bulleted">a</listItem>' +
					'<listItem indent="1" type="bulleted">b</listItem>' +
					'<listItem indent="1" type="bulleted">c</listItem>'
				);
			} );

			// Look at next siblings if, after outdenting, a list item is a first item in it's list (list item "c").
			it( 'should fix list type when item is outdented #2', () => {
				setData(
					doc,
					'<listItem indent="0" type="bulleted">a</listItem>' +
					'<listItem indent="1" type="numbered">[]b</listItem>' +
					'<listItem indent="2" type="bulleted">c</listItem>' +
					'<listItem indent="1" type="numbered">d</listItem>'
				);

				command.execute();

				expect( getData( doc, { withoutSelection: true } ) ).to.equal(
					'<listItem indent="0" type="bulleted">a</listItem>' +
					'<listItem indent="0" type="bulleted">b</listItem>' +
					'<listItem indent="1" type="numbered">c</listItem>' +
					'<listItem indent="1" type="numbered">d</listItem>'
				);
			} );

			// Reported in #53.
			it( 'should fix list type when item is outdented #3', () => {
				setData(
					doc,
					'<listItem indent="0" type="bulleted">a</listItem>' +
					'<listItem indent="1" type="numbered">[b</listItem>' +
					'<listItem indent="1" type="numbered">c</listItem>' +
					'<listItem indent="1" type="numbered">d]</listItem>'
				);

				command.execute();

				expect( getData( doc, { withoutSelection: true } ) ).to.equal(
					'<listItem indent="0" type="bulleted">a</listItem>' +
					'<listItem indent="0" type="bulleted">b</listItem>' +
					'<listItem indent="0" type="bulleted">c</listItem>' +
					'<listItem indent="0" type="bulleted">d</listItem>'
				);
			} );

			it( 'should fix list type when item is outdented to top level (if needed)', () => {
				setData(
					doc,
					'<listItem indent="0" type="bulleted">a</listItem>' +
					'<listItem indent="1" type="numbered">[]b</listItem>' +
					'<listItem indent="0" type="numbered">c</listItem>'
				);

				command.execute();

				// Another possible behaviour would be that "b" list item becomes first list item of a top level
				// numbered list (so it does not change it's type) but it seems less correct from UX standpoint.
				expect( getData( doc, { withoutSelection: true } ) ).to.equal(
					'<listItem indent="0" type="bulleted">a</listItem>' +
					'<listItem indent="0" type="bulleted">b</listItem>' +
					'<listItem indent="0" type="numbered">c</listItem>'
				);
			} );

			it( 'should not fix nested list items\' type when not needed', () => {
				// There was a bug that the nested sub-list changed it's type because for a while, it was on same indent
				// level as the originally outdented element.
				setData(
					doc,
					'<listItem indent="0" type="bulleted">a</listItem>' +
					'<listItem indent="1" type="numbered">b</listItem>' +
					'<listItem indent="1" type="numbered">[]c</listItem>' +
					'<listItem indent="2" type="bulleted">d</listItem>' +
					'<listItem indent="2" type="bulleted">e</listItem>'
				);

				command.execute();

				expect( getData( doc, { withoutSelection: true } ) ).to.equal(
					'<listItem indent="0" type="bulleted">a</listItem>' +
					'<listItem indent="1" type="numbered">b</listItem>' +
					'<listItem indent="0" type="bulleted">c</listItem>' +
					'<listItem indent="1" type="bulleted">d</listItem>' +
					'<listItem indent="1" type="bulleted">e</listItem>'
				);
			} );
		} );
	} );
} );
