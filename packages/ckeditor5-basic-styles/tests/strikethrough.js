/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Strikethrough from '../src/strikethrough';
import StrikethroughEditing from '../src/strikethrough/strikethroughediting';
import StrikethroughUI from '../src/strikethrough/strikethroughui';

describe( 'Strikethrough', () => {
	it( 'should require StrikethroughEditing and StrikethroughUI', () => {
		expect( Strikethrough.requires ).to.deep.equal( [ StrikethroughEditing, StrikethroughUI ] );
	} );

	it( 'should be named', () => {
		expect( Strikethrough.pluginName ).to.equal( 'Strikethrough' );
	} );
} );
