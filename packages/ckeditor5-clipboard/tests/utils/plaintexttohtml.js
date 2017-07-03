/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import plainTextToHtml from '../../src/utils/plaintexttohtml';

describe( 'plainTextToHtml()', () => {
	it( 'encodes < and >', () => {
		expect( plainTextToHtml( 'x y <z>' ) ).to.equal( 'x y &lt;z&gt;' );
	} );

	it( 'turns double line breaks into paragraphs', () => {
		expect( plainTextToHtml( 'x\n\ny\n\nz' ) ).to.equal( '<p>x</p><p>y</p><p>z</p>' );
	} );

	it( 'preserves trailing spaces', () => {
		expect( plainTextToHtml( ' x ' ) ).to.equal( '&nbsp;x&nbsp;' );
	} );

	it( 'preserve subsequent spaces', () => {
		expect( plainTextToHtml( 'x  y  ' ) ).to.equal( 'x &nbsp;y &nbsp;' );
	} );

	it( 'turns single line breaks to spaces', () => {
		expect( plainTextToHtml( 'x\ny\nz' ) ).to.equal( 'x y z' );
	} );
} );
