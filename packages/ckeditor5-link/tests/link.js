/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Link from '../src/link';
import AutoLink from '../src/autolink';
import LinkEditing from '../src/linkediting';
import LinkUI from '../src/linkui';

describe( 'Link', () => {
	it( 'should require LinkEditing, LinkUI and AutoLink', () => {
		expect( Link.requires ).to.deep.equal( [ LinkEditing, LinkUI, AutoLink ] );
	} );

	it( 'should be named', () => {
		expect( Link.pluginName ).to.equal( 'Link' );
	} );
} );
