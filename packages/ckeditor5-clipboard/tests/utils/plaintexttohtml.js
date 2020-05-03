/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import plainTextToHtml from '../../src/utils/plaintexttohtml';

describe( 'plainTextToHtml()', () => {
	it( 'encodes < and >', () => {
		expect( plainTextToHtml( 'x y <z>' ) ).to.equal( 'x y &lt;z&gt;' );
	} );

	it( 'turns a single line break into paragraphs', () => {
		expect( plainTextToHtml( 'x\ny\nz' ) ).to.equal( '<p>x</p><p>y</p><p>z</p>' );
	} );

	it( 'turns double line breaks into paragraphs', () => {
		expect( plainTextToHtml( 'x\n\ny\n\nz' ) ).to.equal( '<p>x</p><p></p><p>y</p><p></p><p>z</p>' );
	} );

	it( 'turns combination of different amount of line breaks to paragraphs', () => {
		expect( plainTextToHtml( 'a\nb\n\nc\n\n\nd' ) ).to.equal( '<p>a</p><p>b</p><p></p><p>c</p><p></p><p></p><p>d</p>' );
	} );

	it( 'preserves trailing spaces', () => {
		expect( plainTextToHtml( ' x ' ) ).to.equal( '&nbsp;x&nbsp;' );
	} );

	it( 'preserve subsequent spaces', () => {
		expect( plainTextToHtml( 'x  y  ' ) ).to.equal( 'x &nbsp;y &nbsp;' );
	} );
} );
