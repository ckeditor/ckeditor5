/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect } from 'vitest';

import { Widget } from '@ckeditor/ckeditor5-widget';

import { HorizontalLine } from '../src/horizontalline.js';
import { HorizontalLineEditing } from '../src/horizontallineediting.js';
import { HorizontalLineUI } from '../src/horizontallineui.js';

describe( 'HorizontalLine', () => {
	it( 'should require HorizontalLineEditing, HorizontalLineUI and Widget', () => {
		expect( HorizontalLine.requires ).toEqual( [ HorizontalLineEditing, HorizontalLineUI, Widget ] );
	} );

	it( 'should be named', () => {
		expect( HorizontalLine.pluginName ).toEqual( 'HorizontalLine' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( HorizontalLine.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( HorizontalLine.isPremiumPlugin ).toBe( false );
	} );
} );
