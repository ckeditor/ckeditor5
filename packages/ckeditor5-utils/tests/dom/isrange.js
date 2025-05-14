/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import isRange from '../../src/dom/isrange.js';

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
