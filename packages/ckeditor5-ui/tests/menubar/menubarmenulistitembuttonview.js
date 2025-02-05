/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

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
			expect( buttonView ).to.be.instanceOf( ButtonView );
		} );

		it( 'should set #withText', () => {
			expect( buttonView.withText ).to.be.true;
		} );

		it( 'should set #withKeystroke', () => {
			expect( buttonView.withKeystroke ).to.be.true;
		} );

		it( 'should set #tooltip', () => {
			expect( buttonView.tooltip ).to.be.false;
		} );

		it( 'should set #role', () => {
			expect( buttonView.role ).to.equal( 'menuitem' );
		} );
	} );
} );
