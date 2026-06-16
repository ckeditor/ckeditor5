/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect } from 'vitest';
import { plainTextToHtml } from '../../src/utils/plaintexttohtml.js';

describe( 'plainTextToHtml()', () => {
	it( 'encodes < and >', () => {
		expect( plainTextToHtml( 'x y <z>' ) ).toBe( 'x y &lt;z&gt;' );
	} );

	it( 'encodes &', () => {
		expect( plainTextToHtml( 'x=1&y=2&z=3' ) ).toBe( 'x=1&amp;y=2&amp;z=3' );
	} );

	it( 'turns double line breaks into paragraphs (Linux/Mac EOL style)', () => {
		expect( plainTextToHtml( 'x\n\ny\n\nz' ) ).toBe( '<p>x</p><p>y</p><p>z</p>' );
	} );

	it( 'turns double line breaks into paragraphs (Windows EOL style)', () => {
		expect( plainTextToHtml( 'x\r\n\r\ny\r\n\r\nz' ) ).toBe( '<p>x</p><p>y</p><p>z</p>' );
	} );

	it( 'turns single line breaks into soft breaks (Linux/Mac EOL style)', () => {
		expect( plainTextToHtml( 'x\ny\nz' ) ).toBe( '<p>x<br>y<br>z</p>' );
	} );

	it( 'turns single line breaks into soft breaks (Windows EOL style)', () => {
		expect( plainTextToHtml( 'x\r\ny\r\nz' ) ).toBe( '<p>x<br>y<br>z</p>' );
	} );

	it( 'turns combination of different amount of line breaks to paragraphs', () => {
		expect( plainTextToHtml( 'a\n\nb\nc\n\n\n\nd\ne' ) ).toBe( '<p>a</p><p>b<br>c</p><p></p><p>d<br>e</p>' );
	} );

	it( 'turns tabs into four spaces', () => {
		expect( plainTextToHtml( '\tx\t' ) ).toBe( '&nbsp;&nbsp;&nbsp;&nbsp;x&nbsp;&nbsp;&nbsp;&nbsp;' );
	} );

	it( 'preserves trailing spaces', () => {
		expect( plainTextToHtml( ' x ' ) ).toBe( '&nbsp;x&nbsp;' );
	} );

	it( 'preserve subsequent spaces', () => {
		expect( plainTextToHtml( 'x  y  ' ) ).toBe( 'x &nbsp;y &nbsp;' );
	} );
} );
