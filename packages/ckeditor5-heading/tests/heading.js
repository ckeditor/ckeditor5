/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Heading from '../src/heading';
import HeadingEditing from '../src/headingediting';
import HeadingUI from '../src/headingui';

describe( 'Heading', () => {
	it( 'should require HeadingEditing and HeadingUI', () => {
		expect( Heading.requires ).to.deep.equal( [ HeadingEditing, HeadingUI ] );
	} );

	it( 'should be named', () => {
		expect( Heading.pluginName ).to.equal( 'Heading' );
	} );
} );
