/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Font from './../src/font';
import FontFamily from './../src/fontfamily';
import FontSize from './../src/fontsize';
import FontColor from './../src/fontcolor';
import FontBackgroundColor from './../src/fontbackgroundcolor';

describe( 'Font', () => {
	it( 'requires FontFamily, FontSize, FontColor, FontBackgroundColor', () => {
		expect( Font.requires ).to.deep.equal( [ FontFamily, FontSize, FontColor, FontBackgroundColor ] );
	} );

	it( 'defines plugin name', () => {
		expect( Font.pluginName ).to.equal( 'Font' );
	} );
} );
