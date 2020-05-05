/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import FontBackgroundColor from './../src/fontbackgroundcolor';
import FontBackgroundColorEditing from './../src/fontbackgroundcolor/fontbackgroundcolorediting';
import FontBackgroundColorUI from '../src/fontbackgroundcolor/fontbackgroundcolorui';

describe( 'FontBackgroundColor', () => {
	it( 'requires FontBackgroundColorEditing and FontBackgroundColorUI', () => {
		expect( FontBackgroundColor.requires ).to.deep.equal( [ FontBackgroundColorEditing, FontBackgroundColorUI ] );
	} );

	it( 'defines plugin name', () => {
		expect( FontBackgroundColor.pluginName ).to.equal( 'FontBackgroundColor' );
	} );
} );
