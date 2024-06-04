/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Underline from '../src/underline.js';
import UnderlineEditing from '../src/underline/underlineediting.js';
import UnderlineUI from '../src/underline/underlineui.js';

describe( 'Underline', () => {
	it( 'should require UnderlineEditing and UnderlineUI', () => {
		expect( Underline.requires ).to.deep.equal( [ UnderlineEditing, UnderlineUI ] );
	} );

	it( 'should be named', () => {
		expect( Underline.pluginName ).to.equal( 'Underline' );
	} );
} );
