/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import plainTextToHtml from '../../src/utils/plaintexttohtml.js';

describe( 'plainTextToHtml()', () => {
	it( 'encodes < and >', () => {
		expect( plainTextToHtml( 'x y <z>' ) ).to.equal( 'x y &lt;z&gt;' );
	} );

	it( 'encodes &', () => {
		expect( plainTextToHtml( 'x=1&y=2&z=3' ) ).to.equal( 'x=1&amp;y=2&amp;z=3' );
	} );

	it( 'turns double line breaks into paragraphs (Linux/Mac EOL style)', () => {
		expect( plainTextToHtml( 'x\n\ny\n\nz' ) ).to.equal( '<p>x</p><p>y</p><p>z</p>' );
	} );

	it( 'turns double line breaks into paragraphs (Windows EOL style)', () => {
		expect( plainTextToHtml( 'x\r\n\r\ny\r\n\r\nz' ) ).to.equal( '<p>x</p><p>y</p><p>z</p>' );
	} );

	it( 'turns single line breaks into soft breaks (Linux/Mac EOL style)', () => {
		expect( plainTextToHtml( 'x\ny\nz' ) ).to.equal( '<p>x<br>y<br>z</p>' );
	} );

	it( 'turns single line breaks into soft breaks (Windows EOL style)', () => {
		expect( plainTextToHtml( 'x\r\ny\r\nz' ) ).to.equal( '<p>x<br>y<br>z</p>' );
	} );

	it( 'turns combination of different amount of line breaks to paragraphs', () => {
		expect( plainTextToHtml( 'a\n\nb\nc\n\n\n\nd\ne' ) ).to.equal( '<p>a</p><p>b<br>c</p><p></p><p>d<br>e</p>' );
	} );

	it( 'turns tabs into four spaces', () => {
		expect( plainTextToHtml( '\tx\t' ) ).to.equal( '&nbsp;&nbsp;&nbsp;&nbsp;x&nbsp;&nbsp;&nbsp;&nbsp;' );
	} );

	it( 'preserves trailing spaces', () => {
		expect( plainTextToHtml( ' x ' ) ).to.equal( '&nbsp;x&nbsp;' );
	} );

	it( 'preserve subsequent spaces', () => {
		expect( plainTextToHtml( 'x  y  ' ) ).to.equal( 'x &nbsp;y &nbsp;' );
	} );
} );
