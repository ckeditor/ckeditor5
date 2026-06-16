/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect } from 'vitest';
import { Link } from '../src/link.js';
import { AutoLink } from '../src/autolink.js';
import { LinkEditing } from '../src/linkediting.js';
import { LinkUI } from '../src/linkui.js';

describe( 'Link', () => {
	it( 'should require LinkEditing, LinkUI and AutoLink', () => {
		expect( Link.requires ).toEqual( [ LinkEditing, LinkUI, AutoLink ] );
	} );

	it( 'should be named', () => {
		expect( Link.pluginName ).toBe( 'Link' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( Link.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( Link.isPremiumPlugin ).toBe( false );
	} );
} );
