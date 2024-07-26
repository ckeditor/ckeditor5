/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

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
			expect( buttonView ).to.be.instanceOf( FileDialogListItemButtonView );
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
