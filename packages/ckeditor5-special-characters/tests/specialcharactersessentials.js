/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import SpecialCharactersEssentials from '../src/specialcharactersessentials';

import SpecialCharactersCurrency from '../src/specialcharacterscurrency';
import SpecialCharactersText from '../src/specialcharacterstext';
import SpecialCharactersMathematical from '../src/specialcharactersmathematical';
import SpecialCharactersArrows from '../src/specialcharactersarrows';
import SpecialCharactersLatin from '../src/specialcharacterslatin';

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
} );
