/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Locale } from '@ckeditor/ckeditor5-utils';
import {
	ButtonView,
	MenuBarMenuListItemButtonView
} from '../../src/index.js';

describe( 'MenuBarMenuListItemButtonView', () => {
	let buttonView, locale;

	beforeEach( () => {
		locale = new Locale();
		buttonView = new MenuBarMenuListItemButtonView( locale );
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
