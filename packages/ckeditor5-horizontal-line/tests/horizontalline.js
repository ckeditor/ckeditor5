/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Widget from '@ckeditor/ckeditor5-widget/src/widget';

import HorizontalLine from '../src/horizontalline';
import HorizontalLineEditing from '../src/horizontallineediting';
import HorizontalLineUI from '../src/horizontallineui';

describe( 'HorizontalLine', () => {
	it( 'should require HorizontalLineEditing, HorizontalLineUI and Widget', () => {
		expect( HorizontalLine.requires ).to.deep.equal( [ HorizontalLineEditing, HorizontalLineUI, Widget ] );
	} );

	it( 'should be named', () => {
		expect( HorizontalLine.pluginName ).to.equal( 'HorizontalLine' );
	} );
} );
