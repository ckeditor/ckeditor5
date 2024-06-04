/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import RemoveFormat from '../src/removeformat.js';
import RemoveFormatEditing from '../src/removeformatediting.js';
import RemoveFormatUI from '../src/removeformatui.js';

describe( 'RemoveFormat', () => {
	it( 'should require RemoveFormatEditing', () => {
		expect( RemoveFormat.requires ).to.include( RemoveFormatEditing );
	} );

	it( 'should require RemoveFormatUI', () => {
		expect( RemoveFormat.requires ).to.include( RemoveFormatUI );
	} );

	it( 'should have pluginName property', () => {
		expect( RemoveFormat.pluginName ).to.equal( 'RemoveFormat' );
	} );
} );
