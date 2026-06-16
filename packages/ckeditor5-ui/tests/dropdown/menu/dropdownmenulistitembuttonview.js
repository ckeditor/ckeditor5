/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createMockLocale } from './_utils/dropdowntreemock.js';
import {
	ButtonView,
	DropdownMenuListItemButtonView
} from '../../../src/index.js';

describe( 'DropdownMenuListItemButtonView', () => {
	let buttonView, locale;

	beforeEach( () => {
		locale = createMockLocale();
		buttonView = new DropdownMenuListItemButtonView( locale );
	} );

	afterEach( () => {
		buttonView.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should inherit from ButtonView', () => {
			expect( buttonView ).toBeInstanceOf( ButtonView );
		} );

		it( 'should set #withText', () => {
			expect( buttonView.withText ).toBe( true );
		} );

		it( 'should set #withKeystroke', () => {
			expect( buttonView.withKeystroke ).toBe( true );
		} );

		it( 'should set #tooltip', () => {
			expect( buttonView.tooltip ).toBe( false );
		} );

		it( 'should set #role', () => {
			expect( buttonView.role ).toBe( 'menuitem' );
		} );
	} );
} );
