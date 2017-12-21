/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import FontFamily from './../src/fontfamily';
import FontFamilyEditing from './../src/fontfamily/fontfamilyediting';
import FontFamilyUI from '../src/fontfamily/fontfamilyui';

describe( 'FontFamily', () => {
	it( 'requires FontFamilyEditing and FontFamilyUI', () => {
		expect( FontFamily.requires ).to.deep.equal( [ FontFamilyEditing, FontFamilyUI ] );
	} );

	it( 'defines plugin name', () => {
		expect( FontFamily.pluginName ).to.equal( 'FontFamily' );
	} );
} );
