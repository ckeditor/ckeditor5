/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Typing from '../src/typing.js';
import Input from '../src/input.js';
import Delete from '../src/delete.js';

describe( 'Typing feature', () => {
	it( 'requires Input and Delete features', () => {
		const typingRequirements = Typing.requires;

		expect( typingRequirements ).to.contain( Input );
		expect( typingRequirements ).to.contain( Delete );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( Typing.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( Typing.isPremiumPlugin ).to.be.false;
	} );
} );
