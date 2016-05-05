/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treeview */

'use strict';

import Writer from '/ckeditor5/engine/treeview/writer.js';
import ContainerElement from '/ckeditor5/engine/treeview/containerelement.js';
import Range from '/ckeditor5/engine/treeview/range.js';
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
		const { view, selection } = parse( input );
		const newRange = writer.breakRange( selection.getFirstRange() );
		expect( stringify( view, newRange, { showType: true, showPriority: true } ) ).to.equal( expected );
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
			} ).to.throw( 'treeview-writer-invalid-range-container' );
		} );

		it( 'should break at collapsed range and return collapsed one', () => {
			test(
				'<container:p>foo{}bar</container:p>',
				'<container:p>foo[]bar</container:p>'
			);
		} );

		it( 'should break inside text node #1', () => {
			test(
				'<container:p>foo{bar}baz</container:p>',
				'<container:p>foo[bar]baz</container:p>'
			);
		} );

		it( 'should break inside text node #2', () => {
			test(
				'<container:p>foo{barbaz}</container:p>',
				'<container:p>foo[barbaz]</container:p>'
			);
		} );

		it( 'should break inside text node #3', () => {
			test(
				'<container:p>foo{barbaz]</container:p>',
				'<container:p>foo[barbaz]</container:p>'
			);
		} );

		it( 'should break inside text node #4', () => {
			test(
				'<container:p>{foo}barbaz</container:p>',
				'<container:p>[foo]barbaz</container:p>'
			);
		} );

		it( 'should break inside text node #5', () => {
			test(
				'<container:p>[foo}barbaz</container:p>',
				'<container:p>[foo]barbaz</container:p>'
			);
		} );

		it( 'should break placed inside different nodes', () => {
			test(
				'<container:p>foo{bar<attribute:b:1>baz}qux</attribute:b:1></container:p>',
				'<container:p>foo[bar<attribute:b:1>baz</attribute:b:1>]<attribute:b:1>qux</attribute:b:1></container:p>'
			);
		} );
	} );
} );
