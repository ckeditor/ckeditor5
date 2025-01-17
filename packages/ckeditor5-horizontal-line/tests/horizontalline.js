/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Widget from '@ckeditor/ckeditor5-widget/src/widget.js';

import HorizontalLine from '../src/horizontalline.js';
import HorizontalLineEditing from '../src/horizontallineediting.js';
import HorizontalLineUI from '../src/horizontallineui.js';

describe( 'HorizontalLine', () => {
	it( 'should require HorizontalLineEditing, HorizontalLineUI and Widget', () => {
		expect( HorizontalLine.requires ).to.deep.equal( [ HorizontalLineEditing, HorizontalLineUI, Widget ] );
	} );

	it( 'should be named', () => {
		expect( HorizontalLine.pluginName ).to.equal( 'HorizontalLine' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( HorizontalLine.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( HorizontalLine.isPremiumPlugin ).to.be.false;
	} );
} );
