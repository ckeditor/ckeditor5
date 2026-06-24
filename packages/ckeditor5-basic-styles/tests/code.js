/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect } from 'vitest';
import { Code } from '../src/code.js';
import { CodeEditing } from '../src/code/codeediting.js';
import { CodeUI } from '../src/code/codeui.js';

describe( 'Code', () => {
	it( 'should require CodeEditing and CodeUI', () => {
		expect( Code.requires ).toEqual( [ CodeEditing, CodeUI ] );
	} );

	it( 'should be named', () => {
		expect( Code.pluginName ).toBe( 'Code' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( Code.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( Code.isPremiumPlugin ).toBe( false );
	} );
} );
