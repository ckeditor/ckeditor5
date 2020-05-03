/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global Range */

import isRange from '../../src/dom/isrange';

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
