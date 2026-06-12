/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect } from 'vitest';

import { BlockQuote } from '../src/blockquote.js';
import { BlockQuoteEditing } from '../src/blockquoteediting.js';
import { BlockQuoteUI } from '../src/blockquoteui.js';

describe( 'BlockQuote', () => {
	it( 'requires BlockQuoteEditing and BlockQuoteUI', () => {
		expect( BlockQuote.requires ).toEqual( [ BlockQuoteEditing, BlockQuoteUI ] );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( BlockQuote.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( BlockQuote.isPremiumPlugin ).toBe( false );
	} );
} );
