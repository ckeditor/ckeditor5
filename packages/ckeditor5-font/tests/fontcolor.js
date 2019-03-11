/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import FontColor from './../src/fontcolor';
import FontColorEditing from './../src/fontcolor/fontcolorediting';
import FontColorUI from '../src/fontcolor/fontcolorui';

describe( 'FontColor', () => {
	it( 'requires FontColorEditing and FontColorUI', () => {
		expect( FontColor.requires ).to.deep.equal( [ FontColorEditing, FontColorUI ] );
	} );

	it( 'defines plugin name', () => {
		expect( FontColor.pluginName ).to.equal( 'FontColor' );
	} );
} );
