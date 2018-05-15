/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Essentials from '../src/essentials';
import Enter from '../src/enter';
import ShiftEnter from '../src/shiftenter';

describe( 'Essentials Feature', () => {
	it( 'should require Enter and ShiftEnter', () => {
		expect( Essentials.requires ).to.deep.equal( [ Enter, ShiftEnter ] );
	} );

	it( 'should be named', () => {
		expect( Essentials.pluginName ).to.equal( 'Essentials' );
	} );
} );
