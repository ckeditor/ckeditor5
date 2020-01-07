/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Subscript from '../src/subscript';
import SubEditing from '../src/subscript/subscriptediting';
import SubUI from '../src/subscript/subscriptui';

describe( 'Subscript', () => {
	it( 'should require SubEditing and SubUI', () => {
		expect( Subscript.requires ).to.deep.equal( [ SubEditing, SubUI ] );
	} );

	it( 'should be named', () => {
		expect( Subscript.pluginName ).to.equal( 'Subscript' );
	} );
} );
