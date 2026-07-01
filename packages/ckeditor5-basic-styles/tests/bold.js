/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect } from 'vitest';
import { Bold } from '../src/bold.js';
import { BoldEditing } from '../src/bold/boldediting.js';
import { BoldUI } from '../src/bold/boldui.js';

describe( 'Bold', () => {
	it( 'should require BoldEditing and BoldUI', () => {
		expect( Bold.requires ).toEqual( [ BoldEditing, BoldUI ] );
	} );

	it( 'should be named', () => {
		expect( Bold.pluginName ).toBe( 'Bold' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( Bold.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( Bold.isPremiumPlugin ).toBe( false );
	} );
} );
