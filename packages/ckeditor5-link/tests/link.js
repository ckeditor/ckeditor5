/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
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
