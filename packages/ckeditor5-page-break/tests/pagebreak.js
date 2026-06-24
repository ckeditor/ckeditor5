/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, expect, it } from 'vitest';
import { Widget } from '@ckeditor/ckeditor5-widget';

import { PageBreak } from '../src/pagebreak.js';
import { PageBreakEditing } from '../src/pagebreakediting.js';
import { PageBreakUI } from '../src/pagebreakui.js';

describe( 'PageBreak', () => {
	it( 'should require PageBreakEditing, PageBreakUI and Widget', () => {
		expect( PageBreak.requires ).toEqual( [ PageBreakEditing, PageBreakUI, Widget ] );
	} );

	it( 'should be named', () => {
		expect( PageBreak.pluginName ).toBe( 'PageBreak' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( PageBreak.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( PageBreak.isPremiumPlugin ).toBe( false );
	} );
} );
