/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect } from 'vitest';
import { Italic } from '../src/italic.js';
import { ItalicEditing } from '../src/italic/italicediting.js';
import { ItalicUI } from '../src/italic/italicui.js';

describe( 'Italic', () => {
	it( 'should require ItalicEditing and ItalicUI', () => {
		expect( Italic.requires ).toEqual( [ ItalicEditing, ItalicUI ] );
	} );

	it( 'should be named', () => {
		expect( Italic.pluginName ).toBe( 'Italic' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( Italic.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( Italic.isPremiumPlugin ).toBe( false );
	} );
} );
