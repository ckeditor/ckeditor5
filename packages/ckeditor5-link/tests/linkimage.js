/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import LinkImage from '../src/linkimage.js';
import LinkImageEditing from '../src/linkimageediting.js';
import LinkImageUI from '../src/linkimageui.js';

describe( 'LinkImage', () => {
	it( 'should require LinkImageEditing and LinkImageUI', () => {
		expect( LinkImage.requires ).to.deep.equal( [ LinkImageEditing, LinkImageUI ] );
	} );

	it( 'should be named', () => {
		expect( LinkImage.pluginName ).to.equal( 'LinkImage' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( LinkImage.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( LinkImage.isPremiumPlugin ).to.be.false;
	} );
} );
