/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Link from '../src/link';
import LinkEditing from '../src/linkediting';
import LinkUI from '../src/linkui';

describe( 'Link', () => {
	it( 'should require LinkEditing and LinkUI', () => {
		expect( Link.requires ).to.deep.equal( [ LinkEditing, LinkUI ] );
	} );

	it( 'should be named', () => {
		expect( Link.pluginName ).to.equal( 'Link' );
	} );
} );
