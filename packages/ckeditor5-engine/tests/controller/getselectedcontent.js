/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Document from '../../src/model/document';
import DocumentFragment from '../../src/model/documentfragment';
import getSelectedContent from '../../src/controller/getselectedcontent';
import { setData, stringify } from '../../src/dev-utils/model';

describe( 'Delete utils', () => {
	let doc;

	describe( 'getSelectedContent', () => {
		describe( 'in simple scenarios', () => {
			beforeEach( () => {
				doc = new Document();
				doc.createRoot();

				const schema = doc.schema;

				schema.registerItem( 'image', '$inline' );

				schema.allow( { name: '$text', inside: '$root' } );
				schema.allow( { name: 'image', inside: '$root' } );
				schema.allow( { name: '$inline', attributes: [ 'bold' ] } );
				schema.allow( { name: '$inline', attributes: [ 'italic' ] } );
			} );

			it( 'returns empty fragment for no selection', () => {
				setData( doc, 'abc' );

				const frag = getSelectedContent( doc.selection );

				expect( frag ).instanceOf( DocumentFragment );
				expect( frag.isEmpty ).to.be.true;
			} );

			it( 'returns empty fragment for empty selection', () => {
				setData( doc, 'a[]bc' );

				const frag = getSelectedContent( doc.selection );

				expect( frag ).instanceOf( DocumentFragment );
				expect( frag.isEmpty ).to.be.true;
			} );

			it( 'gets one character', () => {
				setData( doc, 'a[b]c' );

				const frag = getSelectedContent( doc.selection );
				const content = stringify( frag );

				expect( frag ).instanceOf( DocumentFragment );
				expect( content ).to.equal( 'b' );
			} );

			it( 'gets full text', () => {
				setData( doc, '[abc]' );

				const content = stringify( getSelectedContent( doc.selection ) );
				expect( content ).to.equal( 'abc' );
			} );

			it( 'gets text with an attribute', () => {
				setData( doc, 'xxx<$text bold="true">a[b]c</$text>' );

				const content = stringify( getSelectedContent( doc.selection ) );
				expect( content ).to.equal( '<$text bold="true">b</$text>' );
			} );

			it( 'gets text with attributes', () => {
				setData( doc, 'x<$text bold="true">a[b</$text><$text italic="true">c]d</$text>x' );

				const content = stringify( getSelectedContent( doc.selection ) );
				expect( content ).to.equal( '<$text bold="true">b</$text><$text italic="true">c</$text>' );
			} );

			it( 'gets text with and without attribute', () => {
				setData( doc, '<$text bold="true">a[b</$text>c]d' );

				const content = stringify( getSelectedContent( doc.selection ) );
				expect( content ).to.equal( '<$text bold="true">b</$text>c' );
			} );

			it( 'gets text and element', () => {
				setData( doc, '[ab<image></image>c]' );

				const content = stringify( getSelectedContent( doc.selection ) );
				expect( content ).to.equal( 'ab<image></image>c' );
			} );

			it( 'gets one element', () => {
				setData( doc, 'a[<image></image>]b' );

				const content = stringify( getSelectedContent( doc.selection ) );
				expect( content ).to.equal( '<image></image>' );
			} );

			it( 'gets multiple elements', () => {
				setData( doc, '[<image></image><image></image>]' );

				const content = stringify( getSelectedContent( doc.selection ) );
				expect( content ).to.equal( '<image></image><image></image>' );
			} );
		} );

		describe( 'in blocks', () => {
			beforeEach( () => {
				doc = new Document();
				doc.createRoot();

				const schema = doc.schema;

				schema.registerItem( 'paragraph', '$block' );
				schema.registerItem( 'heading1', '$block' );
				schema.registerItem( 'blockImage' );
				schema.registerItem( 'caption' );
				schema.registerItem( 'image', '$inline' );

				schema.allow( { name: 'blockImage', inside: '$root' } );
				schema.allow( { name: 'caption', inside: 'blockImage' } );
				schema.allow( { name: '$inline', inside: 'caption' } );

				schema.allow( { name: '$inline', attributes: [ 'bold' ] } );
			} );

			it( 'gets one character', () => {
				setData( doc, '<paragraph>a[b]c</paragraph>' );

				const content = stringify( getSelectedContent( doc.selection ) );
				expect( content ).to.equal( 'b' );
			} );

			it( 'gets entire paragraph content', () => {
				setData( doc, '<paragraph>[a<image></image>b]</paragraph>' );

				const content = stringify( getSelectedContent( doc.selection ) );
				expect( content ).to.equal( 'a<image></image>b' );
			} );

			it( 'gets two blocks - partial, partial', () => {
				setData( doc, '<heading1>a[bc</heading1><paragraph>de]f</paragraph>' );

				const content = stringify( getSelectedContent( doc.selection ) );
				expect( content ).to.equal( '<heading1>bc</heading1><paragraph>de</paragraph>' );
			} );

			it( 'gets two blocks - full, partial', () => {
				setData( doc, '<heading1>[abc</heading1><paragraph>de]f</paragraph>' );

				const content = stringify( getSelectedContent( doc.selection ) );
				expect( content ).to.equal( '<heading1>abc</heading1><paragraph>de</paragraph>' );
			} );

			it( 'gets two blocks - full, partial 2', () => {
				setData( doc, '<heading1>[abc</heading1><paragraph>de<image></image>]f</paragraph>' );

				const content = stringify( getSelectedContent( doc.selection ) );
				expect( content ).to.equal( '<heading1>abc</heading1><paragraph>de<image></image></paragraph>' );
			} );

			it( 'gets two blocks - full, partial 3', () => {
				setData( doc, '<heading1>x</heading1><heading1>[abc</heading1><paragraph><image></image>de]f</paragraph>' );

				const content = stringify( getSelectedContent( doc.selection ) );
				expect( content ).to.equal( '<heading1>abc</heading1><paragraph><image></image>de</paragraph>' );
			} );

			it( 'gets two blocks - full, partial 4', () => {
				setData( doc, '<heading1>[abc</heading1><paragraph>de]f<image></image></paragraph>' );

				const content = stringify( getSelectedContent( doc.selection ) );
				expect( content ).to.equal( '<heading1>abc</heading1><paragraph>de</paragraph>' );
			} );

			it( 'gets two blocks - partial, full', () => {
				setData( doc, '<heading1>a[bc</heading1><paragraph>def]</paragraph>' );

				const content = stringify( getSelectedContent( doc.selection ) );
				expect( content ).to.equal( '<heading1>bc</heading1><paragraph>def</paragraph>' );
			} );

			it( 'gets two blocks - partial, full 2', () => {
				setData( doc, '<heading1>a[<image></image>bc</heading1><paragraph>def]</paragraph>' );

				const content = stringify( getSelectedContent( doc.selection ) );
				expect( content ).to.equal( '<heading1><image></image>bc</heading1><paragraph>def</paragraph>' );
			} );

			// See https://github.com/ckeditor/ckeditor5-engine/issues/652#issuecomment-261358484
			it( 'gets two blocks - empty, full', () => {
				setData( doc, '<heading1>abc[</heading1><paragraph>def]</paragraph>' );

				const content = stringify( getSelectedContent( doc.selection ) );
				expect( content ).to.equal( '<paragraph>def</paragraph>' );
			} );

			// See https://github.com/ckeditor/ckeditor5-engine/issues/652#issuecomment-261358484
			it( 'gets two blocks - partial, empty', () => {
				setData( doc, '<heading1>a[bc</heading1><paragraph>]def</paragraph>' );

				const content = stringify( getSelectedContent( doc.selection ) );
				expect( content ).to.equal( '<heading1>bc</heading1>' );
			} );

			it( 'gets three blocks', () => {
				setData( doc, '<heading1>a[bc</heading1><paragraph>x</paragraph><paragraph>de]f</paragraph>' );

				const content = stringify( getSelectedContent( doc.selection ) );
				expect( content ).to.equal( '<heading1>bc</heading1><paragraph>x</paragraph><paragraph>de</paragraph>' );
			} );

			it( 'gets block image', () => {
				setData( doc, '<paragraph>a</paragraph>[<blockImage><caption>Foo</caption></blockImage>]<paragraph>b</paragraph>' );

				const content = stringify( getSelectedContent( doc.selection ) );
				expect( content ).to.equal( '<blockImage><caption>Foo</caption></blockImage>' );
			} );

			it( 'gets two blocks', () => {
				setData( doc, '<paragraph>a</paragraph>[<blockImage></blockImage><blockImage></blockImage>]<paragraph>b</paragraph>' );

				const content = stringify( getSelectedContent( doc.selection ) );
				expect( content ).to.equal( '<blockImage></blockImage><blockImage></blockImage>' );
			} );

			// Purely related to the current implementation.
			it( 'gets content when multiple text items needs to be removed from the right excess', () => {
				setData( doc, '<paragraph>a[b</paragraph><paragraph>c]d<$text bold="true">e</$text>f</paragraph>' );

				const content = stringify( getSelectedContent( doc.selection ) );
				expect( content )
					.to.equal( '<paragraph>b</paragraph><paragraph>c</paragraph>' );
			} );

			// Purely related to the current implementation.
			it( 'gets content when multiple text items needs to be removed from the left excess', () => {
				setData( doc, '<paragraph>a<$text bold="true">b</$text>c[d</paragraph><paragraph>e]f</paragraph>' );

				const content = stringify( getSelectedContent( doc.selection ) );
				expect( content )
					.to.equal( '<paragraph>d</paragraph><paragraph>e</paragraph>' );
			} );
		} );

		describe( 'in blocks (deeply nested)', () => {
			beforeEach( () => {
				doc = new Document();
				doc.createRoot();

				const schema = doc.schema;

				schema.registerItem( 'paragraph', '$block' );
				schema.registerItem( 'heading1', '$block' );
				schema.registerItem( 'quote' );

				schema.allow( { name: '$block', inside: 'quote' } );
				schema.allow( { name: 'quote', inside: '$root' } );
			} );

			it( 'gets content when ends are equally deeply nested', () => {
				setData( doc, '<heading1>x</heading1><quote><paragraph>a[bc</paragraph><paragraph>de]f</paragraph></quote>' );

				const content = stringify( getSelectedContent( doc.selection ) );
				expect( content ).to.equal( '<paragraph>bc</paragraph><paragraph>de</paragraph>' );
			} );

			it( 'gets content when left end nested deeper', () => {
				setData( doc, '<quote><paragraph>a[bc</paragraph></quote><paragraph>de]f</paragraph>' );

				const content = stringify( getSelectedContent( doc.selection ) );
				expect( content ).to.equal( '<quote><paragraph>bc</paragraph></quote><paragraph>de</paragraph>' );
			} );

			it( 'gets content when left end nested deeper 2', () => {
				setData( doc, '<quote><paragraph>a[bc</paragraph><heading1>x</heading1></quote><paragraph>de]f</paragraph>' );

				const content = stringify( getSelectedContent( doc.selection ) );
				expect( content ).to.equal( '<quote><paragraph>bc</paragraph><heading1>x</heading1></quote><paragraph>de</paragraph>' );
			} );

			it( 'gets content when left end nested deeper 3', () => {
				setData( doc, '<quote><heading1>x</heading1><paragraph>a[bc</paragraph></quote><paragraph>de]f</paragraph>' );

				const content = stringify( getSelectedContent( doc.selection ) );
				expect( content ).to.equal( '<quote><paragraph>bc</paragraph></quote><paragraph>de</paragraph>' );
			} );

			// See https://github.com/ckeditor/ckeditor5-engine/issues/652#issuecomment-261358484
			it( 'gets content when left end nested deeper 4', () => {
				setData( doc, '<quote><heading1>x[</heading1><paragraph>abc</paragraph></quote><paragraph>de]f</paragraph>' );

				const content = stringify( getSelectedContent( doc.selection ) );
				expect( content ).to.equal( '<quote><paragraph>abc</paragraph></quote><paragraph>de</paragraph>' );
			} );

			it( 'gets content when right end nested deeper', () => {
				setData( doc, '<paragraph>a[bc</paragraph><quote><paragraph>de]f</paragraph></quote>' );

				const content = stringify( getSelectedContent( doc.selection ) );
				expect( content ).to.equal( '<paragraph>bc</paragraph><quote><paragraph>de</paragraph></quote>' );
			} );

			it( 'gets content when both ends nested deeper than the middle element', () => {
				setData( doc, '<quote><heading1>a[bc</heading1></quote><heading1>x</heading1><quote><heading1>de]f</heading1></quote>' );

				const content = stringify( getSelectedContent( doc.selection ) );
				expect( content )
					.to.equal( '<quote><heading1>bc</heading1></quote><heading1>x</heading1><quote><heading1>de</heading1></quote>' );
			} );

			// See: https://github.com/ckeditor/ckeditor5-engine/pull/1043#issuecomment-318012286
			it( 'ensures that elements are retrieved by indexes instead of offsets', () => {
				doc.schema.allow( { name: '$text', inside: '$root' } );
				doc.schema.allow( { name: '$text', inside: 'quote' } );

				setData( doc,
					'foo' +
					'<quote>' +
						'<paragraph>' +
							'b[ar' +
						'</paragraph>' +
						'bo]m' +
					'</quote>'
				);

				const content = stringify( getSelectedContent( doc.selection ) );
				expect( content )
					.to.equal( '<paragraph>ar</paragraph>bo' );
			} );
		} );
	} );
} );
