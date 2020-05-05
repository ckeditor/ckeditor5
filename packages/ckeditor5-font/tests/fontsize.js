/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import FontSize from './../src/fontsize';
import FontSizeEditing from './../src/fontsize/fontsizeediting';
import FontSizeUI from './../src/fontsize/fontsizeui';

describe( 'FontSize', () => {
	it( 'requires FontSizeEditing & FontSizeUI', () => {
		expect( FontSize.requires ).to.deep.equal( [ FontSizeEditing, FontSizeUI ] );
	} );

	it( 'defines plugin name', () => {
		expect( FontSize.pluginName ).to.equal( 'FontSize' );
	} );
} );
