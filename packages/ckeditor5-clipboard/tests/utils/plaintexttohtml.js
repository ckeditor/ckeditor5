/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import plainTextToHtml from '../../src/utils/plaintexttohtml';

describe( 'plainTextToHtml()', () => {
	it( 'encodes < and >', () => {
		expect( plainTextToHtml( 'x y <z>' ) ).to.equal( 'x y &lt;z&gt;' );
	} );

	it( 'turns double line breaks into paragraphs', () => {
		expect( plainTextToHtml( 'x\n\ny\n\nz' ) ).to.equal( '<p>x</p><p>y</p><p>z</p>' );
	} );

	it( 'turns single line breaks into <br>s', () => {
		expect( plainTextToHtml( 'x\ny\nz' ) ).to.equal( 'x<br>y<br>z' );
	} );

	it( 'turns double and single line breaks to a combination of paragraphs and <br>s', () => {
		expect( plainTextToHtml( 'a\nb\n\nc\nd' ) ).to.equal( '<p>a<br>b</p><p>c<br>d</p>' );
	} );

	it( 'turns 3-5 subsequent new lines to a combination of paragraphs and <br>s', () => {
		expect( plainTextToHtml( 'a\n\n\nb\n\n\n\nc\n\n\n\n\nd' ) )
			.to.equal( '<p>a</p><p><br>b</p><p></p><p>c</p><p></p><p><br>d</p>' );
	} );

	it( 'preserves trailing spaces', () => {
		expect( plainTextToHtml( ' x ' ) ).to.equal( '&nbsp;x&nbsp;' );
	} );

	it( 'preserve subsequent spaces', () => {
		expect( plainTextToHtml( 'x  y  ' ) ).to.equal( 'x &nbsp;y &nbsp;' );
	} );
} );
