/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import FontBackgroundColor from './../src/fontbackgroundcolor.js';
import FontBackgroundColorEditing from './../src/fontbackgroundcolor/fontbackgroundcolorediting.js';
import FontBackgroundColorUI from '../src/fontbackgroundcolor/fontbackgroundcolorui.js';

describe( 'FontBackgroundColor', () => {
	it( 'requires FontBackgroundColorEditing and FontBackgroundColorUI', () => {
		expect( FontBackgroundColor.requires ).to.deep.equal( [ FontBackgroundColorEditing, FontBackgroundColorUI ] );
	} );

	it( 'defines plugin name', () => {
		expect( FontBackgroundColor.pluginName ).to.equal( 'FontBackgroundColor' );
	} );
} );
