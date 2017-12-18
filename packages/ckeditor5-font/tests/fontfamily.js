/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import FontFamily from './../src/fontfamily';
import FontFamilyEditing from './../src/fontfamily/fontfamilyediting';

describe( 'FontFamily', () => {
	it( 'requires FontFamilyEditing', () => {
		expect( FontFamily.requires ).to.deep.equal( [ FontFamilyEditing ] );
	} );

	it( 'defines plugin name', () => {
		expect( FontFamily.pluginName ).to.equal( 'FontFamily' );
	} );
} );
