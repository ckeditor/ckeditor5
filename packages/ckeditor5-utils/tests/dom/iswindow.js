/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global window */

import isWindow from '../../src/dom/iswindow';

describe( 'isWindow()', () => {
	it( 'detects DOM Window in browsers', () => {
		expect( isWindow( window ) ).to.be.true;
		expect( isWindow( {} ) ).to.be.false;
		expect( isWindow( null ) ).to.be.false;
		expect( isWindow( undefined ) ).to.be.false;
		expect( isWindow( new Date() ) ).to.be.false;
		expect( isWindow( 42 ) ).to.be.false;
	} );

	it( 'detects DOM Window in the Electron environment', () => {
		const global = {
			get [ Symbol.toStringTag ]() {
				return 'global';
			}
		};

		expect( isWindow( global ) ).to.be.true;
	} );
} );
