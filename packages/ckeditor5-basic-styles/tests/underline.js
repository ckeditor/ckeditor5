/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect } from 'vitest';
import { Underline } from '../src/underline.js';
import { UnderlineEditing } from '../src/underline/underlineediting.js';
import { UnderlineUI } from '../src/underline/underlineui.js';

describe( 'Underline', () => {
	it( 'should require UnderlineEditing and UnderlineUI', () => {
		expect( Underline.requires ).toEqual( [ UnderlineEditing, UnderlineUI ] );
	} );

	it( 'should be named', () => {
		expect( Underline.pluginName ).toBe( 'Underline' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( Underline.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( Underline.isPremiumPlugin ).toBe( false );
	} );
} );
