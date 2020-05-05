/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import HorizontalLine from '../src/horizontalline';
import HorizontalLineEditing from '../src/horizontallineediting';
import HorizontalLineUI from '../src/horizontallineui';

describe( 'HorizontalLine', () => {
	it( 'should require HorizontalLineEditing and HorizontalLineUI', () => {
		expect( HorizontalLine.requires ).to.deep.equal( [ HorizontalLineEditing, HorizontalLineUI ] );
	} );

	it( 'should be named', () => {
		expect( HorizontalLine.pluginName ).to.equal( 'HorizontalLine' );
	} );
} );
