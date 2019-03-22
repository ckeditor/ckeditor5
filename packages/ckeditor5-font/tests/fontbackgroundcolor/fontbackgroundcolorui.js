/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import FontBackgroundColorUI from './../../src/fontbackgroundcolor/fontbackgroundcolorui';
import ColorUI from './../../src/ui/colorui';

describe( 'FontBackgroundColorUI', () => {
	it( 'is ColorUI', () => {
		expect( FontBackgroundColorUI.prototype ).to.be.instanceOf( ColorUI );
	} );
} );
