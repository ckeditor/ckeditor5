/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
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
