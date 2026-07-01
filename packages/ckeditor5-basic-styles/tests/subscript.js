/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect } from 'vitest';
import { Subscript } from '../src/subscript.js';
import { SubscriptEditing } from '../src/subscript/subscriptediting.js';
import { SubscriptUI } from '../src/subscript/subscriptui.js';

describe( 'Subscript', () => {
	it( 'should require SubscriptEditing and SubscriptUI', () => {
		expect( Subscript.requires ).toEqual( [ SubscriptEditing, SubscriptUI ] );
	} );

	it( 'should be named', () => {
		expect( Subscript.pluginName ).toBe( 'Subscript' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( Subscript.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( Subscript.isPremiumPlugin ).toBe( false );
	} );
} );
