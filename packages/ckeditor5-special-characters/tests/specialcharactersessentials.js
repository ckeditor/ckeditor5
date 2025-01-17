/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import SpecialCharactersEssentials from '../src/specialcharactersessentials.js';

import SpecialCharactersCurrency from '../src/specialcharacterscurrency.js';
import SpecialCharactersText from '../src/specialcharacterstext.js';
import SpecialCharactersMathematical from '../src/specialcharactersmathematical.js';
import SpecialCharactersArrows from '../src/specialcharactersarrows.js';
import SpecialCharactersLatin from '../src/specialcharacterslatin.js';

describe( 'SpecialCharactersEssentials', () => {
	it( 'includes other required plugins', () => {
		expect( SpecialCharactersEssentials.requires ).to.deep.equal( [
			SpecialCharactersCurrency,
			SpecialCharactersText,
			SpecialCharactersMathematical,
			SpecialCharactersArrows,
			SpecialCharactersLatin
		] );
	} );

	it( 'should be named', () => {
		expect( SpecialCharactersEssentials.pluginName ).to.equal( 'SpecialCharactersEssentials' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( SpecialCharactersEssentials.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( SpecialCharactersEssentials.isPremiumPlugin ).to.be.false;
	} );
} );
