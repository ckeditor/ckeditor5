/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global Range */

import isRange from 'ckeditor5/utils/dom/isrange.js';

describe( 'isRange()', () => {
	it( 'detects native DOM Range', () => {
		expect( isRange( new Range() ) ).to.be.true;

		expect( isRange( {} ) ).to.be.false;
		expect( isRange( null ) ).to.be.false;
		expect( isRange( undefined ) ).to.be.false;
		expect( isRange( new Date() ) ).to.be.false;
		expect( isRange( 42 ) ).to.be.false;
	} );
} );
