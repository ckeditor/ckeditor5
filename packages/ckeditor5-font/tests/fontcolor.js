/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect } from 'vitest';
import { FontColor } from './../src/fontcolor.js';
import { FontColorEditing } from './../src/fontcolor/fontcolorediting.js';
import { FontColorUI } from '../src/fontcolor/fontcolorui.js';

describe( 'FontColor', () => {
	it( 'requires FontColorEditing and FontColorUI', () => {
		expect( FontColor.requires ).toEqual( [ FontColorEditing, FontColorUI ] );
	} );

	it( 'defines plugin name', () => {
		expect( FontColor.pluginName ).toEqual( 'FontColor' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( FontColor.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( FontColor.isPremiumPlugin ).toBe( false );
	} );
} );
