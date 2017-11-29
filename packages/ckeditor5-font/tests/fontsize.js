/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import FontSize from './../src/fontsize';
import FontSizeEditing from './../src/fontsizeediting';

describe( 'FontSize', () => {
	it( 'requires FontSizeEditing', () => {
		expect( FontSize.requires ).to.deep.equal( [ FontSizeEditing ] );
	} );

	it( 'defines plugin name', () => {
		expect( FontSize.pluginName ).to.equal( 'FontSize' );
	} );
} );
