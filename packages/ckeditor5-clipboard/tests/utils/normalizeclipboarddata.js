/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import normalizeClipboardData from '../../src/utils/normalizeclipboarddata.js';

describe( 'normalizeClipboardData()', () => {
	it( 'should strip all span.Apple-converted-space', () => {
		expect( normalizeClipboardData(
			'<span class="Apple-converted-space"> \t\n</span>x<span class="Apple-converted-space">\u00a0\u00a0</span>'
		) ).to.equal( ' \t\nx\u00a0\u00a0' );
	} );

	it( 'should replace span.Apple-converted-space of length one with a normal space', () => {
		expect(
			normalizeClipboardData( '<span class="Apple-converted-space"> </span>x<span class="Apple-converted-space">\u00a0</span>' )
		).to.equal( ' x ' );
	} );

	it( 'should strip all spans with no attributes', () => {
		expect( normalizeClipboardData(
			'<span> \t\n</span>x<span>\u00a0\u00a0</span>'
		) ).to.equal( ' \t\nx\u00a0\u00a0' );
	} );

	it( 'should replace spans with no attributes with a normal space', () => {
		expect(
			normalizeClipboardData( '<span> </span>x<span>\u00a0</span>' )
		).to.equal( ' x ' );
	} );

	it( 'should not strip spans with no attributes if they contain anything but spaces', () => {
		expect(
			normalizeClipboardData( '<span> a</span>x<span>b\u00a0</span>x<span>c</span>' )
		).to.equal( '<span> a</span>x<span>b\u00a0</span>x<span>c</span>' );
	} );

	it( 'should not replace spans of length 1+ with normal space', () => {
		expect(
			normalizeClipboardData( '<span>  </span>x<span>\u00a0 </span>x<span>\u00a0\u00a0</span>x<span> \u00a0</span>' )
		).to.equal( '  x\u00a0 x\u00a0\u00a0x \u00a0' );
	} );

	it( 'should not strip spans with any attribute (except span.Apple-converted-space)', () => {
		const input =
			'<span style="color: red"> </span>x' +
			'<span foo="1">\u00a0</span>x' +
			'<span foo> </span>x' +
			'<span class="bar">\u00a0</span>';

		expect( normalizeClipboardData( input ) ).to.equal( input );
	} );

	it( 'should not be greedy', () => {
		expect(
			normalizeClipboardData( '<span class="Apple-converted-space"> </span><span foo>  </span><span>a</span>' )
		).to.equal( ' <span foo>  </span><span>a</span>' );
	} );

	it( 'should strip HTML comments if clipboard data contains anything but HTML comments', () => {
		expect(
			normalizeClipboardData( '<!-- comment 1 --><!-- comment 2 --><!-- comment 3 -->' )
		).to.equal( '' );
	} );

	it( 'should strip HTML comments if clipboard data contains anything but multiline HTML comments', () => {
		expect(
			normalizeClipboardData( '<!-- multi \n\n\n line \n\n\n comment 1 --><!-- multi \n\n\n line \n\n\n comment 2 -->' )
		).to.equal( '' );
	} );

	it( 'should strip HTML comments if clipboard data contains HTML comments mixed with elements', () => {
		expect(
			normalizeClipboardData( '<!-- comment 1 --><div><p><!-- comment 2 -->foo<!-- comment 3 --></p></div><!-- comment 4 -->' )
		).to.equal( '<div><p>foo</p></div>' );
	} );

	it( 'should strip HTML comments if clipboard data contains multiline HTML comments with commented out elements', () => {
		expect(
			normalizeClipboardData( '<p>foo</p><!-- multi \n\n\n line \n\n\n comment \n\n\n with element <p>bar</p> --><p>baz</p>' )
		).to.equal( '<p>foo</p><p>baz</p>' );
	} );
} );
