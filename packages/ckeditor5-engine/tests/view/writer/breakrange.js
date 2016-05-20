/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: view, browser-only */

'use strict';

import Writer from '/ckeditor5/engine/view/writer.js';
import DocumentFragment from '/ckeditor5/engine/view/documentfragment.js';
import ContainerElement from '/ckeditor5/engine/view/containerelement.js';
import AttributeElement from '/ckeditor5/engine/view/attributeelement.js';
import Text from '/ckeditor5/engine/view/text.js';
import Range from '/ckeditor5/engine/view/range.js';
import { stringify, parse } from '/tests/engine/_utils/view.js';

describe( 'Writer', () => {
	let writer;

	/**
	 * Executes test using `parse` and `stringify` utils functions.
	 *
	 * @param {String} input
	 * @param {String} expected
	 */
	function test( input, expected ) {
		let { view, selection } = parse( input );

		if ( view instanceof AttributeElement || view instanceof Text ) {
			view = new DocumentFragment( view );
		}

		const newRange = writer.breakRange( selection.getFirstRange() );
		expect( stringify( view, newRange, { showType: true } ) ).to.equal( expected );
	}

	beforeEach( () => {
		writer = new Writer();
	} );

	describe( 'breakRange', () => {
		it( 'should throw when range placed in two containers', () => {
			const p1 = new ContainerElement( 'p' );
			const p2 = new ContainerElement( 'p' );

			expect( () => {
				writer.breakRange( Range.createFromParentsAndOffsets( p1, 0, p2, 0 ) );
			} ).to.throw( 'view-writer-invalid-range-container' );
		} );

		it( 'should not break text nodes if they are not in attribute elements', () => {
			test(
				'<container:p>foo{}bar</container:p>',
				'<container:p>foo{}bar</container:p>'
			);
		} );

		it( 'should break at collapsed range and return collapsed one', () => {
			test(
				'<container:p><attribute:b>foo{}bar</attribute:b></container:p>',
				'<container:p><attribute:b>foo</attribute:b>[]<attribute:b>bar</attribute:b></container:p>'
			);
		} );

		it( 'should break inside text node #1', () => {
			test(
				'<container:p><attribute:b>foo{bar}baz</attribute:b></container:p>',
				'<container:p><attribute:b>foo</attribute:b>[<attribute:b>bar</attribute:b>]<attribute:b>baz</attribute:b></container:p>'
			);
		} );

		it( 'should break inside text node #2', () => {
			test(
				'<container:p><attribute:b>foo{barbaz}</attribute:b></container:p>',
				'<container:p><attribute:b>foo</attribute:b>[<attribute:b>barbaz</attribute:b>]</container:p>'
			);
		} );

		it( 'should break inside text node #3', () => {
			test(
				'<container:p><attribute:b>foo{barbaz]</attribute:b></container:p>',
				'<container:p><attribute:b>foo</attribute:b>[<attribute:b>barbaz</attribute:b>]</container:p>'
			);
		} );

		it( 'should break inside text node #4', () => {
			test(
				'<container:p><attribute:b>{foo}barbaz</attribute:b></container:p>',
				'<container:p>[<attribute:b>foo</attribute:b>]<attribute:b>barbaz</attribute:b></container:p>'
			);
		} );

		it( 'should break inside text node #5', () => {
			test(
				'<container:p><attribute:b>[foo}barbaz</attribute:b></container:p>',
				'<container:p>[<attribute:b>foo</attribute:b>]<attribute:b>barbaz</attribute:b></container:p>'
			);
		} );

		it( 'should break placed inside different nodes', () => {
			test(
				'<container:p>foo{bar<attribute:b>baz}qux</attribute:b></container:p>',
				'<container:p>foo{bar<attribute:b>baz</attribute:b>]<attribute:b>qux</attribute:b></container:p>'
			);
		} );

		it( 'should split attribute element directly in document fragment', () => {
			test(
				'<attribute:b>fo{ob}ar</attribute:b>',
				'<attribute:b>fo</attribute:b>[<attribute:b>ob</attribute:b>]<attribute:b>ar</attribute:b>'
			);
		} );

		it( 'should not split text directly in document fragment', () => {
			test(
				'foo{}bar',
				'foo{}bar'
			);
		} );
	} );
} );
