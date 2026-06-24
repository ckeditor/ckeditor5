/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect } from 'vitest';
import { Superscript } from '../src/superscript.js';
import { SuperscriptEditing } from '../src/superscript/superscriptediting.js';
import { SuperscriptUI } from '../src/superscript/superscriptui.js';

describe( 'Superscript', () => {
	it( 'should require SuperEditing and SuperUI', () => {
		expect( Superscript.requires ).toEqual( [ SuperscriptEditing, SuperscriptUI ] );
	} );

	it( 'should be named', () => {
		expect( Superscript.pluginName ).toBe( 'Superscript' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( Superscript.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( Superscript.isPremiumPlugin ).toBe( false );
	} );
} );
