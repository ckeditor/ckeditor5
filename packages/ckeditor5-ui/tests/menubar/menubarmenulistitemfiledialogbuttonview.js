/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Locale } from '@ckeditor/ckeditor5-utils';
import { MenuBarMenuListItemFileDialogButtonView } from '../../src/index.js';
import { FileDialogListItemButtonView } from '../../src/button/filedialogbuttonview.js';

describe( 'MenuBarMenuListItemFileDialogButtonView', () => {
	let buttonView, locale;

	beforeEach( () => {
		locale = new Locale();
		buttonView = new MenuBarMenuListItemFileDialogButtonView( locale );
	} );

	afterEach( () => {
		buttonView.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should inherit from FileDialogButtonView', () => {
			expect( buttonView ).toBeInstanceOf( FileDialogListItemButtonView );
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
