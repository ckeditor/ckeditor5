/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import RemoveFormat from '../src/removeformat';
import RemoveFormatEditing from '../src/removeformatediting';
import RemoveFormatUI from '../src/removeformatui';

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
