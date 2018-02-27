/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Underline from '../src/underline';
import UnderlineEditing from '../src/underline/underlineediting';
import UnderlineUI from '../src/underline/underlineui';

describe( 'Underline', () => {
	it( 'should require UnderlineEditing and UnderlineUI', () => {
		expect( Underline.requires ).to.deep.equal( [ UnderlineEditing, UnderlineUI ] );
	} );

	it( 'should be named', () => {
		expect( Underline.pluginName ).to.equal( 'Underline' );
	} );
} );
