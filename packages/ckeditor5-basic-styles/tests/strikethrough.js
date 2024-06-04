/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Strikethrough from '../src/strikethrough.js';
import StrikethroughEditing from '../src/strikethrough/strikethroughediting.js';
import StrikethroughUI from '../src/strikethrough/strikethroughui.js';

describe( 'Strikethrough', () => {
	it( 'should require StrikethroughEditing and StrikethroughUI', () => {
		expect( Strikethrough.requires ).to.deep.equal( [ StrikethroughEditing, StrikethroughUI ] );
	} );

	it( 'should be named', () => {
		expect( Strikethrough.pluginName ).to.equal( 'Strikethrough' );
	} );
} );
