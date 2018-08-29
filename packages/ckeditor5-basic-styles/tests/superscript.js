/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Superscript from '../src/superscript';
import SuperEditing from '../src/superscript/superscriptediting';
import SuperUI from '../src/superscript/superscriptui';

describe( 'Superscript', () => {
	it( 'should require SuperEditing and SuperUI', () => {
		expect( Superscript.requires ).to.deep.equal( [ SuperEditing, SuperUI ] );
	} );

	it( 'should be named', () => {
		expect( Superscript.pluginName ).to.equal( 'Super' );
	} );
} );
