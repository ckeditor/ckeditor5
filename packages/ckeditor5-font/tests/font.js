/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect } from 'vitest';
import { Font } from './../src/font.js';
import { FontFamily } from './../src/fontfamily.js';
import { FontSize } from './../src/fontsize.js';
import { FontColor } from './../src/fontcolor.js';
import { FontBackgroundColor } from './../src/fontbackgroundcolor.js';

describe( 'Font', () => {
	it( 'requires FontFamily, FontSize, FontColor, FontBackgroundColor', () => {
		expect( Font.requires ).toEqual( [ FontFamily, FontSize, FontColor, FontBackgroundColor ] );
	} );

	it( 'defines plugin name', () => {
		expect( Font.pluginName ).toEqual( 'Font' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( Font.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( Font.isPremiumPlugin ).toBe( false );
	} );
} );
