/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treeview, browser-only */

'use strict';

import Writer from '/ckeditor5/engine/treeview/writer.js';
import ContainerElement from '/ckeditor5/engine/treeview/containerelement.js';
import Text from '/ckeditor5/engine/treeview/text.js';
import Position from '/ckeditor5/engine/treeview/position.js';
import { stringify, parse } from '/tests/engine/_utils/view.js';

describe( 'Writer', () => {
	let writer;

	/**
	 * Executes test using `parse` and `stringify` utils functions. Uses range delimiters `[]{}` to create and
	 * test merge position.
	 *
	 * @param {String} input
	 * @param {String} expected
	 */
	function test( input, expected ) {
		const { view, selection } = parse( input );
		const newPosition = writer.mergeAttributes( selection.getFirstPosition() );
		expect( stringify( view, newPosition, { showType: true, showPriority: true } ) ).to.equal( expected );
	}

	beforeEach( () => {
		writer = new Writer();
	} );

	describe( 'mergeAttributes', () => {
		it( 'should not merge if inside text node', () => {
			test( '<container:p>fo{}bar</container:p>', '<container:p>fo{}bar</container:p>' );
		} );

		it( 'should not merge if between containers', () => {
			test(
				'<container:div><container:p>foo</container:p>[]<container:p>bar</container:p></container:div>',
				'<container:div><container:p>foo</container:p>[]<container:p>bar</container:p></container:div>'
			);
		} );

		it( 'should return same position when inside empty container', () => {
			test(
				'<container:p>[]</container:p>',
				'<container:p>[]</container:p>'
			);
		} );

		it( 'should not merge when position is placed at the beginning of the container', () => {
			test(
				'<container:p>[]<attribute:b:1></attribute:b:1></container:p>',
				'<container:p>[]<attribute:b:1></attribute:b:1></container:p>'
			);
		} );

		it( 'should not merge when position is placed at the end of the container', () => {
			test(
				'<container:p><attribute:b:1></attribute:b:1>[]</container:p>',
				'<container:p><attribute:b:1></attribute:b:1>[]</container:p>'
			);
		} );

		it( 'should merge when placed between two text nodes', () => {
			// <p>foobar</p> -> <p>foo|bar</p>
			const t1 = new Text( 'foo' );
			const t2 = new Text( 'bar' );
			const p = new ContainerElement( 'p', null, [ t1, t2 ] );
			const position = new Position( p, 1 );

			const newPosition = writer.mergeAttributes( position );
			expect( stringify( p, newPosition ) ).to.equal( '<p>foo{}bar</p>' );
		} );

		it( 'should merge when placed between similar attribute nodes', () => {
			test(
				'<container:p><attribute:b:1 foo="bar"></attribute:b:1>[]<attribute:b:1 foo="bar"></attribute:b:1></container:p>',
				'<container:p><attribute:b:1 foo="bar">[]</attribute:b:1></container:p>'
			);
		} );

		it( 'should not merge when placed between non-similar attribute nodes', () => {
			test(
				'<container:p><attribute:b:1 foo="bar"></attribute:b:1>[]<attribute:b:1 foo="baz"></attribute:b:1></container:p>',
				'<container:p><attribute:b:1 foo="bar"></attribute:b:1>[]<attribute:b:1 foo="baz"></attribute:b:1></container:p>'
			);
		} );

		it( 'should not merge when placed between similar attribute nodes with different priority', () => {
			test(
				'<container:p><attribute:b:1 foo="bar"></attribute:b:1>[]<attribute:b:2 foo="bar"></attribute:b:2></container:p>',
				'<container:p><attribute:b:1 foo="bar"></attribute:b:1>[]<attribute:b:2 foo="bar"></attribute:b:2></container:p>'
			);
		} );

		it( 'should merge attribute nodes and their contents if possible', () => {
			test(
				'<container:p><attribute:b:1 foo="bar">foo</attribute:b:1>[]<attribute:b:1 foo="bar">bar</attribute:b:1></container:p>',
				'<container:p><attribute:b:1 foo="bar">foo{}bar</attribute:b:1></container:p>'
			);
		} );
	} );
} );
