/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import FontColor from './../src/fontcolor.js';
import FontColorEditing from './../src/fontcolor/fontcolorediting.js';
import FontColorUI from '../src/fontcolor/fontcolorui.js';

describe( 'FontColor', () => {
	it( 'requires FontColorEditing and FontColorUI', () => {
		expect( FontColor.requires ).to.deep.equal( [ FontColorEditing, FontColorUI ] );
	} );

	it( 'defines plugin name', () => {
		expect( FontColor.pluginName ).to.equal( 'FontColor' );
	} );
} );
