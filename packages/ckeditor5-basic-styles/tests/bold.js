/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Bold from '../src/bold';
import BoldEditing from '../src/bold/boldediting';
import BoldUI from '../src/bold/boldui';

describe( 'Bold', () => {
	it( 'should require BoldEditing and BoldUI', () => {
		expect( Bold.requires ).to.deep.equal( [ BoldEditing, BoldUI ] );
	} );

	it( 'should be named', () => {
		expect( Bold.pluginName ).to.equal( 'Bold' );
	} );
} );
