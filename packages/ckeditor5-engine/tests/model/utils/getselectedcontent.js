/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Model } from '../../../src/model/model.js';
import { DocumentFragment } from '../../../src/model/documentfragment.js';
import { getSelectedContent } from '../../../src/model/utils/getselectedcontent.js';
import { _setModelData, stringify } from '../../../src/dev-utils/model.js';

describe( 'DataController utils', () => {
	let model, doc;

	describe( 'getSelectedContent', () => {
		it( 'should not generate any document operations', () => {
			model = new Model();
			doc = model.document;
			doc.createRoot();

			model.schema.extend( '$text', { allowIn: '$root' } );
			_setModelData( model, 'x[abc]x' );

			const version = model.document.version;
			getSelectedContent( model, doc.selection );

			expect( model.document.version ).to.equal( version );
		} );

		describe( 'in simple scenarios', () => {
			beforeEach( () => {
				model = new Model();
				doc = model.document;
				doc.createRoot();

				const schema = model.schema;

				schema.register( 'imageBlock', { allowWhere: '$text', allowIn: '$root' } );
				schema.extend( '$text', {
					allowIn: '$root',
					allowAttributes: [ 'bold', 'italic' ]
				} );
			} );

			it( 'returns empty fragment for no selection', () => {
				_setModelData( model, 'abc' );

				const frag = getSelectedContent( model, doc.selection );

				expect( frag ).instanceOf( DocumentFragment );
				expect( frag.isEmpty ).to.be.true;
			} );

			it( 'returns empty fragment for empty selection', () => {
				_setModelData( model, 'a[]bc' );

				const frag = getSelectedContent( model, doc.selection );

				expect( frag ).instanceOf( DocumentFragment );
				expect( frag.isEmpty ).to.be.true;
			} );

			it( 'gets one character', () => {
				_setModelData( model, 'a[b]c' );

				const frag = getSelectedContent( model, doc.selection );
				const content = stringify( frag );

				expect( frag ).instanceOf( DocumentFragment );
				expect( content ).to.equal( 'b' );
			} );

			it( 'gets full text', () => {
				_setModelData( model, '[abc]' );

				const content = stringify( getSelectedContent( model, doc.selection ) );
				expect( content ).to.equal( 'abc' );
			} );

			it( 'gets text with an attribute', () => {
				_setModelData( model, 'xxx<$text bold="true">a[b]c</$text>' );

				const content = stringify( getSelectedContent( model, doc.selection ) );
				expect( content ).to.equal( '<$text bold="true">b</$text>' );
			} );

			it( 'gets text with attributes', () => {
				_setModelData( model, 'x<$text bold="true">a[b</$text><$text italic="true">c]d</$text>x' );

				const content = stringify( getSelectedContent( model, doc.selection ) );
				expect( content ).to.equal( '<$text bold="true">b</$text><$text italic="true">c</$text>' );
			} );

			it( 'gets text with and without attribute', () => {
				_setModelData( model, '<$text bold="true">a[b</$text>c]d' );

				const content = stringify( getSelectedContent( model, doc.selection ) );
				expect( content ).to.equal( '<$text bold="true">b</$text>c' );
			} );

			it( 'gets text and element', () => {
				_setModelData( model, '[ab<imageBlock></imageBlock>c]' );

				const content = stringify( getSelectedContent( model, doc.selection ) );
				expect( content ).to.equal( 'ab<imageBlock></imageBlock>c' );
			} );

			it( 'gets one element', () => {
				_setModelData( model, 'a[<imageBlock></imageBlock>]b' );

				const content = stringify( getSelectedContent( model, doc.selection ) );
				expect( content ).to.equal( '<imageBlock></imageBlock>' );
			} );

			it( 'gets multiple elements', () => {
				_setModelData( model, '[<imageBlock></imageBlock><imageBlock></imageBlock>]' );

				const content = stringify( getSelectedContent( model, doc.selection ) );
				expect( content ).to.equal( '<imageBlock></imageBlock><imageBlock></imageBlock>' );
			} );
		} );

		describe( 'in blocks', () => {
			beforeEach( () => {
				model = new Model();
				doc = model.document;
				doc.createRoot();

				const schema = model.schema;

				schema.register( 'paragraph', { inheritAllFrom: '$block' } );
				schema.register( 'heading1', { inheritAllFrom: '$block' } );
				schema.register( 'blockImage', { isObject: true } );
				schema.register( 'caption' );
				schema.register( 'imageBlock', { allowWhere: '$text' } );

				schema.extend( 'blockImage', { allowIn: '$root' } );
				schema.extend( 'caption', { allowIn: 'blockImage' } );
				schema.extend( '$text', {
					allowIn: 'caption',
					allowAttributes: 'bold'
				} );
			} );

			it( 'gets one character', () => {
				_setModelData( model, '<paragraph>a[b]c</paragraph>' );

				const content = stringify( getSelectedContent( model, doc.selection ) );
				expect( content ).to.equal( 'b' );
			} );

			it( 'gets entire paragraph content', () => {
				_setModelData( model, '<paragraph>[a<imageBlock></imageBlock>b]</paragraph>' );

				const content = stringify( getSelectedContent( model, doc.selection ) );
				expect( content ).to.equal( 'a<imageBlock></imageBlock>b' );
			} );

			it( 'gets two blocks - partial, partial', () => {
				_setModelData( model, '<heading1>a[bc</heading1><paragraph>de]f</paragraph>' );

				const content = stringify( getSelectedContent( model, doc.selection ) );
				expect( content ).to.equal( '<heading1>bc</heading1><paragraph>de</paragraph>' );
			} );

			it( 'gets two blocks - full, partial', () => {
				_setModelData( model, '<heading1>[abc</heading1><paragraph>de]f</paragraph>' );

				const content = stringify( getSelectedContent( model, doc.selection ) );
				expect( content ).to.equal( '<heading1>abc</heading1><paragraph>de</paragraph>' );
			} );

			it( 'gets two blocks - full, partial 2', () => {
				_setModelData( model, '<heading1>[abc</heading1><paragraph>de<imageBlock></imageBlock>]f</paragraph>' );

				const content = stringify( getSelectedContent( model, doc.selection ) );
				expect( content ).to.equal( '<heading1>abc</heading1><paragraph>de<imageBlock></imageBlock></paragraph>' );
			} );

			it( 'gets two blocks - full, partial 3', () => {
				_setModelData( model,
					'<heading1>x</heading1><heading1>[abc</heading1><paragraph><imageBlock></imageBlock>de]f</paragraph>'
				);

				const content = stringify( getSelectedContent( model, doc.selection ) );
				expect( content ).to.equal( '<heading1>abc</heading1><paragraph><imageBlock></imageBlock>de</paragraph>' );
			} );

			it( 'gets two blocks - full, partial 4', () => {
				_setModelData( model, '<heading1>[abc</heading1><paragraph>de]f<imageBlock></imageBlock></paragraph>' );

				const content = stringify( getSelectedContent( model, doc.selection ) );
				expect( content ).to.equal( '<heading1>abc</heading1><paragraph>de</paragraph>' );
			} );

			it( 'gets two blocks - partial, full', () => {
				_setModelData( model, '<heading1>a[bc</heading1><paragraph>def]</paragraph>' );

				const content = stringify( getSelectedContent( model, doc.selection ) );
				expect( content ).to.equal( '<heading1>bc</heading1><paragraph>def</paragraph>' );
			} );

			it( 'gets two blocks - partial, full 2', () => {
				_setModelData( model, '<heading1>a[<imageBlock></imageBlock>bc</heading1><paragraph>def]</paragraph>' );

				const content = stringify( getSelectedContent( model, doc.selection ) );
				expect( content ).to.equal( '<heading1><imageBlock></imageBlock>bc</heading1><paragraph>def</paragraph>' );
			} );

			// See https://github.com/ckeditor/ckeditor5-engine/issues/652#issuecomment-261358484
			it( 'gets two blocks - empty, full', () => {
				_setModelData( model, '<heading1>abc[</heading1><paragraph>def]</paragraph>' );

				const content = stringify( getSelectedContent( model, doc.selection ) );
				expect( content ).to.equal( '<paragraph>def</paragraph>' );
			} );

			// See https://github.com/ckeditor/ckeditor5-engine/issues/652#issuecomment-261358484
			it( 'gets two blocks - partial, empty', () => {
				_setModelData( model, '<heading1>a[bc</heading1><paragraph>]def</paragraph>' );

				const content = stringify( getSelectedContent( model, doc.selection ) );
				expect( content ).to.equal( '<heading1>bc</heading1>' );
			} );

			it( 'gets three blocks', () => {
				_setModelData( model, '<heading1>a[bc</heading1><paragraph>x</paragraph><paragraph>de]f</paragraph>' );

				const content = stringify( getSelectedContent( model, doc.selection ) );
				expect( content ).to.equal( '<heading1>bc</heading1><paragraph>x</paragraph><paragraph>de</paragraph>' );
			} );

			it( 'gets block image', () => {
				_setModelData( model, '<paragraph>a</paragraph>[<blockImage><caption>Foo</caption></blockImage>]<paragraph>b</paragraph>' );

				const content = stringify( getSelectedContent( model, doc.selection ) );
				expect( content ).to.equal( '<blockImage><caption>Foo</caption></blockImage>' );
			} );

			it( 'gets two blocks', () => {
				_setModelData( model,
					'<paragraph>a</paragraph>[<blockImage></blockImage><blockImage></blockImage>]<paragraph>b</paragraph>'
				);

				const content = stringify( getSelectedContent( model, doc.selection ) );
				expect( content ).to.equal( '<blockImage></blockImage><blockImage></blockImage>' );
			} );

			// Purely related to the current implementation.
			it( 'gets content when multiple text items needs to be removed from the right excess', () => {
				_setModelData( model, '<paragraph>a[b</paragraph><paragraph>c]d<$text bold="true">e</$text>f</paragraph>' );

				const content = stringify( getSelectedContent( model, doc.selection ) );
				expect( content )
					.to.equal( '<paragraph>b</paragraph><paragraph>c</paragraph>' );
			} );

			// Purely related to the current implementation.
			it( 'gets content when multiple text items needs to be removed from the left excess', () => {
				_setModelData( model, '<paragraph>a<$text bold="true">b</$text>c[d</paragraph><paragraph>e]f</paragraph>' );

				const content = stringify( getSelectedContent( model, doc.selection ) );
				expect( content )
					.to.equal( '<paragraph>d</paragraph><paragraph>e</paragraph>' );
			} );
		} );

		describe( 'in blocks (deeply nested)', () => {
			beforeEach( () => {
				model = new Model();
				doc = model.document;
				doc.createRoot();

				const schema = model.schema;

				schema.register( 'paragraph', { inheritAllFrom: '$block' } );
				schema.register( 'heading1', { inheritAllFrom: '$block' } );
				schema.register( 'quote' );

				schema.extend( '$block', { allowIn: 'quote' } );
				schema.extend( 'quote', { allowIn: '$root' } );
			} );

			it( 'gets content when ends are equally deeply nested', () => {
				_setModelData( model, '<heading1>x</heading1><quote><paragraph>a[bc</paragraph><paragraph>de]f</paragraph></quote>' );

				const content = stringify( getSelectedContent( model, doc.selection ) );
				expect( content ).to.equal( '<paragraph>bc</paragraph><paragraph>de</paragraph>' );
			} );

			it( 'gets content when left end nested deeper', () => {
				_setModelData( model, '<quote><paragraph>a[bc</paragraph></quote><paragraph>de]f</paragraph>' );

				const content = stringify( getSelectedContent( model, doc.selection ) );
				expect( content ).to.equal( '<quote><paragraph>bc</paragraph></quote><paragraph>de</paragraph>' );
			} );

			it( 'gets content when left end nested deeper 2', () => {
				_setModelData( model, '<quote><paragraph>a[bc</paragraph><heading1>x</heading1></quote><paragraph>de]f</paragraph>' );

				const content = stringify( getSelectedContent( model, doc.selection ) );
				expect( content ).to.equal( '<quote><paragraph>bc</paragraph><heading1>x</heading1></quote><paragraph>de</paragraph>' );
			} );

			it( 'gets content when left end nested deeper 3', () => {
				_setModelData( model, '<quote><heading1>x</heading1><paragraph>a[bc</paragraph></quote><paragraph>de]f</paragraph>' );

				const content = stringify( getSelectedContent( model, doc.selection ) );
				expect( content ).to.equal( '<quote><paragraph>bc</paragraph></quote><paragraph>de</paragraph>' );
			} );

			// See https://github.com/ckeditor/ckeditor5-engine/issues/652#issuecomment-261358484
			it( 'gets content when left end nested deeper 4', () => {
				_setModelData( model, '<quote><heading1>x[</heading1><paragraph>abc</paragraph></quote><paragraph>de]f</paragraph>' );

				const content = stringify( getSelectedContent( model, doc.selection ) );
				expect( content ).to.equal( '<quote><paragraph>abc</paragraph></quote><paragraph>de</paragraph>' );
			} );

			it( 'gets content when right end nested deeper', () => {
				_setModelData( model, '<paragraph>a[bc</paragraph><quote><paragraph>de]f</paragraph></quote>' );

				const content = stringify( getSelectedContent( model, doc.selection ) );
				expect( content ).to.equal( '<paragraph>bc</paragraph><quote><paragraph>de</paragraph></quote>' );
			} );

			it( 'gets content when both ends nested deeper than the middle element', () => {
				_setModelData( model,
					'<quote><heading1>a[bc</heading1></quote><heading1>x</heading1><quote><heading1>de]f</heading1></quote>'
				);

				const content = stringify( getSelectedContent( model, doc.selection ) );
				expect( content )
					.to.equal( '<quote><heading1>bc</heading1></quote><heading1>x</heading1><quote><heading1>de</heading1></quote>' );
			} );

			// See: https://github.com/ckeditor/ckeditor5-engine/pull/1043#issuecomment-318012286
			it( 'ensures that elements are retrieved by indexes instead of offsets', () => {
				model.schema.extend( '$text', { allowIn: '$root' } );
				model.schema.extend( '$text', { allowIn: 'quote' } );

				_setModelData( model,
					'foo' +
					'<quote>' +
						'<paragraph>' +
							'b[ar' +
						'</paragraph>' +
						'bo]m' +
					'</quote>'
				);

				const content = stringify( getSelectedContent( model, doc.selection ) );
				expect( content )
					.to.equal( '<paragraph>ar</paragraph>bo' );
			} );
		} );
	} );
} );
