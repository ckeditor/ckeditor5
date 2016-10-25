/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: model */

import Document from '/ckeditor5/engine/model/document.js';
import DataController from '/ckeditor5/engine/datacontroller.js';
import insertContent from '/ckeditor5/engine/datacontroller/insertcontent.js';

import ViewDocumentFragment from '/ckeditor5/engine/view/documentfragment.js';
import ModelDocumentFragment from '/ckeditor5/engine/model/documentfragment.js';
import Text from '/ckeditor5/engine/model/text.js';

import { setData, getData, parse } from '/ckeditor5/engine/dev-utils/model.js';

describe( 'DataController', () => {
	let doc, dataController;

	describe( 'insertContent', () => {
		describe( 'in simple scenarios', () => {
			beforeEach( () => {
				doc = new Document();
				doc.createRoot();

				dataController = new DataController( doc );

				const schema = doc.schema;

				schema.registerItem( 'image', '$inline' );
				schema.registerItem( 'disallowedElement' );

				schema.allow( { name: '$text', inside: '$root' } );
				schema.allow( { name: 'image', inside: '$root' } );
				// Otherwise it won't be passed to the temporary model fragment used inside insertContent().
				schema.allow( { name: 'disallowedElement', inside: '$clipboardHolder' } );

				schema.objects.add( 'image' );
			} );

			test(
				'inserts one text node',
				'xyz',
				'f[]oo',
				'fxyz[]oo'
			);

			test(
				'inserts one text node (at the end)',
				'xyz',
				'foo[]',
				'fooxyz[]'
			);

			test(
				'inserts an element',
				'<image></image>',
				'f[]oo',
				'f<image></image>[]oo'
			);

			test(
				'inserts a text and an element',
				'xyz<image></image>',
				'f[]oo',
				'fxyz<image></image>[]oo'
			);

			test(
				'strips a disallowed element',
				'<disallowedElement>xyz</disallowedElement>',
				'f[]oo',
				'fxyz[]oo'
			);

			test(
				'deletes selection before inserting the content',
				'x',
				'f[abc]oo',
				'fx[]oo'
			);

			describe( 'spaces handling', () => {
				// Note: spaces in the view are not encoded like in the DOM, so subsequent spaces must be
				// inserted into the model as is. The conversion to nbsps happen on view<=>DOM conversion.

				test(
					'inserts one space',
					new Text( ' ' ),
					'f[]oo',
					'f []oo'
				);

				test(
					'inserts three spaces',
					new Text( '   ' ),
					'f[]oo',
					'f   []oo'
				);

				test(
					'inserts spaces at the end',
					new Text( '   ' ),
					'foo[]',
					'foo   []'
				);

				test(
					'inserts one nbsp',
					new Text( '\u200a' ),
					'f[]oo',
					'f\u200a[]oo'
				);

				test(
					'inserts word surrounded by spaces',
					new Text( ' xyz  ' ),
					'f[]oo',
					'f xyz  []oo'
				);
			} );
		} );

		describe( 'in blocks', () => {
			beforeEach( () => {
				doc = new Document();
				doc.createRoot();

				dataController = new DataController( doc );

				const schema = doc.schema;

				schema.registerItem( 'paragraph', '$block' );
				schema.registerItem( 'heading1', '$block' );
				schema.registerItem( 'heading2', '$block' );
				schema.registerItem( 'blockWidget' );
				schema.registerItem( 'inlineWidget' );

				schema.allow( { name: 'blockWidget', inside: '$root' } );
				schema.allow( { name: 'inlineWidget', inside: '$block' } );
				schema.allow( { name: 'inlineWidget', inside: '$clipboardHolder' } );

				schema.objects.add( 'blockWidget' );
				schema.objects.add( 'inlineWidget' );
			} );

			test(
				'inserts one text node',
				'xyz',
				'<paragraph>f[]oo</paragraph>',
				'<paragraph>fxyz[]oo</paragraph>'
			);

			test(
				'inserts one text node to fully selected paragraph',
				'xyz',
				'<paragraph>[foo]</paragraph>',
				'<paragraph>xyz[]</paragraph>'
			);

			test(
				'inserts one text node to fully selected paragraphs (from outside)',
				'xyz',
				'[<paragraph>foo</paragraph><paragraph>bar</paragraph>]',
				'<paragraph>xyz[]</paragraph>'
			);

			test(
				'merges two blocks before inserting content (p+p)',
				'xyz',
				'<paragraph>fo[o</paragraph><paragraph>b]ar</paragraph>',
				'<paragraph>foxyz[]ar</paragraph>'
			);

			test(
				'inserts inline widget and text',
				'xyz<inlineWidget></inlineWidget>',
				'<paragraph>f[]oo</paragraph>',
				'<paragraph>fxyz<inlineWidget></inlineWidget>[]oo</paragraph>'
			);

			// Note: In CKEditor 4 the blocks are not merged, but to KISS we're merging here
			// because that's what deleteContent() does.
			test(
				'merges two blocks before inserting content (h+p)',
				'xyz',
				'<heading1>fo[o</heading1><paragraph>b]ar</paragraph>',
				'<heading1>foxyz[]ar</heading1>'
			);

			describe( 'block to block handling', () => {
				// Note: This is temporary implementation which gives a quite poor UX.
				// See https://github.com/ckeditor/ckeditor5-engine/issues/652

				test(
					'inserts one paragraph',
					'<paragraph>xyz</paragraph>',
					'<paragraph>f[]oo</paragraph>',
					'<paragraph>fxyz[]oo</paragraph>'
				);

				test(
					'inserts one paragraph (at the end)',
					'<paragraph>xyz</paragraph>',
					'<paragraph>foo[]</paragraph>',
					'<paragraph>fooxyz[]</paragraph>'
				);

				test(
					'inserts one paragraph into an empty paragraph',
					'<paragraph>xyz</paragraph>',
					'<paragraph>[]</paragraph>',
					'<paragraph>xyz[]</paragraph>'
				);

				test(
					'inserts one block into a fully selected content',
					'<heading2>xyz</heading2>',
					'<heading1>[foo</heading1><paragraph>bar]</paragraph>',
					'<heading2>xyz[]</heading2>'
				);

				test(
					'inserts one heading',
					'<heading1>xyz</heading1>',
					'<paragraph>f[]oo</paragraph>',
					'<paragraph>fxyz[]oo</paragraph>'
				);

				test(
					'inserts two headings',
					'<heading1>xxx</heading1><heading1>yyy</heading1>',
					'<paragraph>f[]oo</paragraph>',
					'<paragraph>fxxx</paragraph><heading1>yyy[]oo</heading1>'
				);

				test(
					'inserts one object',
					'<blockWidget></blockWidget>',
					'<paragraph>f[]oo</paragraph>',
					'<paragraph>f</paragraph>[<blockWidget></blockWidget>]<paragraph>oo</paragraph>'
				);

				test(
					'inserts one object (at the end)',
					'<blockWidget></blockWidget>',
					'<paragraph>foo[]</paragraph>',
					'<paragraph>foo</paragraph>[<blockWidget></blockWidget>]'
				);

				test(
					'inserts one object (at the beginning)',
					'<blockWidget></blockWidget>',
					'<paragraph>[]bar</paragraph>',
					'[<blockWidget></blockWidget>]<paragraph>bar</paragraph>'
				);
			} );

			describe( 'mixed content to block', () => {
				test(
					'inserts text + paragraph',
					'xxx<paragraph>yyy</paragraph>',
					'<paragraph>f[]oo</paragraph>',
					'<paragraph>fxxx</paragraph><paragraph>yyy[]oo</paragraph>'
				);

				test(
					'inserts text + paragraph (at the beginning)',
					'xxx<paragraph>yyy</paragraph>',
					'<paragraph>[]foo</paragraph>',
					'<paragraph>xxx</paragraph><paragraph>yyy[]foo</paragraph>'
				);

				test(
					'inserts text + paragraph (at the end)',
					'xxx<paragraph>yyy</paragraph>',
					'<paragraph>foo[]</paragraph>',
					'<paragraph>fooxxx</paragraph><paragraph>yyy[]</paragraph>'
				);

				test(
					'inserts paragraph + text',
					'<paragraph>yyy</paragraph>xxx',
					'<paragraph>f[]oo</paragraph>',
					'<paragraph>fyyy</paragraph><paragraph>xxx[]oo</paragraph>'
				);

				test(
					'inserts paragraph + text + inlineWidget + text',
					'<paragraph>yyy</paragraph>xxx<inlineWidget></inlineWidget>zzz',
					'<paragraph>f[]oo</paragraph>',
					'<paragraph>fyyy</paragraph><paragraph>xxx<inlineWidget></inlineWidget>zzz[]oo</paragraph>'
				);

				test(
					'inserts paragraph + text (at the beginning)',
					'<paragraph>yyy</paragraph>xxx',
					'<paragraph>[]foo</paragraph>',
					'<paragraph>yyy</paragraph><paragraph>xxx[]foo</paragraph>'
				);

				test(
					'inserts paragraph + text (at the end)',
					'<paragraph>yyy</paragraph>xxx',
					'<paragraph>foo[]</paragraph>',
					'<paragraph>fooyyy</paragraph><paragraph>xxx[]</paragraph>'
				);

				test(
					'inserts text + heading',
					'xxx<heading1>yyy</heading1>',
					'<paragraph>f[]oo</paragraph>',
					'<paragraph>fxxx</paragraph><heading1>yyy[]oo</heading1>'
				);

				test(
					'inserts paragraph + object',
					'<paragraph>xxx</paragraph><blockWidget></blockWidget>',
					'<paragraph>f[]oo</paragraph>',
					'<paragraph>fxxx</paragraph>[<blockWidget></blockWidget>]<paragraph>oo</paragraph>'
				);

				test(
					'inserts object + paragraph',
					'<blockWidget></blockWidget><paragraph>xxx</paragraph>',
					'<paragraph>f[]oo</paragraph>',
					'<paragraph>f</paragraph><blockWidget></blockWidget><paragraph>xxx[]oo</paragraph>'
				);
			} );

			describe( 'content over a block object', () => {
				test(
					'inserts text',
					'xxx',
					'<paragraph>foo</paragraph>[<blockWidget></blockWidget>]<paragraph>bar</paragraph>',
					'<paragraph>foo</paragraph><paragraph>xxx[]</paragraph><paragraph>bar</paragraph>'
				);

				test(
					'inserts paragraph',
					'<paragraph>xxx</paragraph>',
					'<paragraph>foo</paragraph>[<blockWidget></blockWidget>]<paragraph>bar</paragraph>',
					'<paragraph>foo</paragraph><paragraph>xxx[]</paragraph><paragraph>bar</paragraph>'
				);

				test(
					'inserts text + paragraph',
					'yyy<paragraph>xxx</paragraph>',
					'<paragraph>foo</paragraph>[<blockWidget></blockWidget>]<paragraph>bar</paragraph>',
					'<paragraph>foo</paragraph><paragraph>yyy</paragraph><paragraph>xxx[]</paragraph><paragraph>bar</paragraph>'
				);

				test(
					'inserts two blocks',
					'<heading1>xxx</heading1><paragraph>yyy</paragraph>',
					'<paragraph>foo</paragraph>[<blockWidget></blockWidget>]<paragraph>bar</paragraph>',
					'<paragraph>foo</paragraph><heading1>xxx</heading1><paragraph>yyy[]</paragraph><paragraph>bar</paragraph>'
				);

				test(
					'inserts block object',
					'<blockWidget></blockWidget>',
					'<paragraph>foo</paragraph>[<blockWidget></blockWidget>]<paragraph>bar</paragraph>',
					'<paragraph>foo</paragraph>[<blockWidget></blockWidget>]<paragraph>bar</paragraph>' // It's enough, don't worry.
				);

				test(
					'inserts inline object',
					'<inlineWidget></inlineWidget>',
					'<paragraph>foo</paragraph>[<blockWidget></blockWidget>]<paragraph>bar</paragraph>',
					'<paragraph>foo</paragraph><paragraph><inlineWidget></inlineWidget>[]</paragraph><paragraph>bar</paragraph>'
				);
			} );

			describe( 'content over an inline object', () => {
				test(
					'inserts text',
					'xxx',
					'<paragraph>foo[<inlineWidget></inlineWidget>]bar</paragraph>',
					'<paragraph>fooxxx[]bar</paragraph>'
				);

				test(
					'inserts paragraph',
					'<paragraph>xxx</paragraph>',
					'<paragraph>foo[<inlineWidget></inlineWidget>]bar</paragraph>',
					'<paragraph>fooxxx[]bar</paragraph>'
				);

				test(
					'inserts text + paragraph',
					'yyy<paragraph>xxx</paragraph>',
					'<paragraph>foo[<inlineWidget></inlineWidget>]bar</paragraph>',
					'<paragraph>fooyyy</paragraph><paragraph>xxx[]bar</paragraph>'
				);

				test(
					'inserts two blocks',
					'<heading1>xxx</heading1><paragraph>yyy</paragraph>',
					'<paragraph>foo[<inlineWidget></inlineWidget>]bar</paragraph>',
					'<paragraph>fooxxx</paragraph><paragraph>yyy[]bar</paragraph>'
				);

				test(
					'inserts inline object',
					'<inlineWidget></inlineWidget>',
					'<paragraph>foo[<inlineWidget></inlineWidget>]bar</paragraph>',
					'<paragraph>foo<inlineWidget></inlineWidget>[]bar</paragraph>'
				);

				test(
					'inserts block object',
					'<blockWidget></blockWidget>',
					'<paragraph>foo[<inlineWidget></inlineWidget>]bar</paragraph>',
					'<paragraph>foo</paragraph>[<blockWidget></blockWidget>]<paragraph>bar</paragraph>'
				);
			} );
		} );

		describe( 'filtering out', () => {
			beforeEach( () => {
				doc = new Document();
				doc.createRoot();

				dataController = new DataController( doc );

				const schema = doc.schema;

				schema.registerItem( 'paragraph', '$block' );

				// Let's use table as an example of content which needs to be filtered out.
				schema.registerItem( 'table' );
				schema.registerItem( 'td' );
				schema.registerItem( 'disallowedWidget' );

				schema.allow( { name: 'table', inside: '$clipboardHolder' } );
				schema.allow( { name: 'td', inside: '$clipboardHolder' } );
				schema.allow( { name: '$block', inside: 'td' } );
				schema.allow( { name: '$text', inside: 'td' } );

				schema.allow( { name: 'disallowedWidget', inside: '$clipboardHolder' } );
				schema.allow( { name: '$text', inside: 'disallowedWidget' } );
				schema.objects.add( 'disallowedWidget' );
			} );

			test(
				'filters out disallowed elements and leaves out the text',
				'<table><td>xxx</td><td>yyy</td></table>',
				'<paragraph>f[]oo</paragraph>',
				'<paragraph>fxxxyyy[]oo</paragraph>'
			);

			test(
				'filters out disallowed elements and leaves out the paragraphs',
				'<table><td><paragraph>xxx</paragraph><paragraph>yyy</paragraph><paragraph>zzz</paragraph></td></table>',
				'<paragraph>f[]oo</paragraph>',
				'<paragraph>fxxx</paragraph><paragraph>yyy</paragraph><paragraph>zzz[]oo</paragraph>'
			);

			test(
				'filters out disallowed objects',
				'<disallowedWidget>xxx</disallowedWidget>',
				'<paragraph>f[]oo</paragraph>',
				'<paragraph>f[]oo</paragraph>'
			);
		} );
	} );

	// @param {String} title
	// @param {engine.model.Item|String} content
	function test( title, content, initialData, expectedData ) {
		it( title, () => {
			setData( doc, initialData );

			if ( typeof content == 'string' ) {
				content = parse( content, doc.schema, {
					context: [ '$clipboardHolder' ]
				} );
			}

			if ( !( content instanceof ModelDocumentFragment ) ) {
				content = new ModelDocumentFragment( [ content ] );
			}

			// Override the convertion so we get exactly the model that we defined in the content param.
			// This way we avoid the need to write converters for everything we want to test.
			dataController.viewToModel.convert = () => {
				return content;
			};

			insertContent( dataController, doc.batch(), doc.selection, new ViewDocumentFragment() );

			expect( getData( doc ) ).to.equal( expectedData );
		} );
	}
} );
