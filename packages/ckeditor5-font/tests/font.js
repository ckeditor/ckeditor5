/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Font from './../src/font';
import FontSize from './../src/fontsize';

describe( 'Font', () => {
	it( 'requires FontSize', () => {
		expect( Font.requires ).to.deep.equal( [ FontSize ] );
	} );

	it( 'defines plugin name', () => {
		expect( Font.pluginName ).to.equal( 'Font' );
	} );
} );
