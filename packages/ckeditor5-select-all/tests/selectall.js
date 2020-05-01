/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import SelectAll from '../src/selectall';
import SelectAllEditing from '../src/selectallediting';
import SelectAllUI from '../src/selectallui';

describe( 'SelectAll', () => {
	it( 'should require SelectAllEditing and SelectAllUI', () => {
		expect( SelectAll.requires ).to.deep.equal( [ SelectAllEditing, SelectAllUI ] );
	} );

	it( 'should be named', () => {
		expect( SelectAll.pluginName ).to.equal( 'SelectAll' );
	} );
} );
