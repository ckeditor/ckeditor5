/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect } from 'vitest';
import { RemoveFormat } from '../src/removeformat.js';
import { RemoveFormatEditing } from '../src/removeformatediting.js';
import { RemoveFormatUI } from '../src/removeformatui.js';

describe( 'RemoveFormat', () => {
	it( 'should require RemoveFormatEditing', () => {
		expect( RemoveFormat.requires ).toContain( RemoveFormatEditing );
	} );

	it( 'should require RemoveFormatUI', () => {
		expect( RemoveFormat.requires ).toContain( RemoveFormatUI );
	} );

	it( 'should have pluginName property', () => {
		expect( RemoveFormat.pluginName ).toEqual( 'RemoveFormat' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( RemoveFormat.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( RemoveFormat.isPremiumPlugin ).toBe( false );
	} );
} );
