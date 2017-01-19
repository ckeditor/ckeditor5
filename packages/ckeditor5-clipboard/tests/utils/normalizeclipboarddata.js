/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import normalizeClipboardData from '../../src/utils/normalizeclipboarddata';

describe( 'normalizeClipboardData', () => {
	it( 'should strip all span.Apple-converted-space', () => {
		expect(
			normalizeClipboardData( '<span class="Apple-converted-space"> \t\n</span>x<span class="Apple-converted-space">\u00a0\u00a0</span>' )
		).to.equal( ' \t\nx\u00a0\u00a0' );
	} );

	it( 'should replace span.Apple-converted-space of length one with a normal space', () => {
		expect(
			normalizeClipboardData( '<span class="Apple-converted-space"> </span>x<span class="Apple-converted-space">\u00a0</span>' )
		).to.equal( ' x ' );
	} );
} );
