/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Widget from '@ckeditor/ckeditor5-widget/src/widget';

import FindAndReplace from '../src/findandreplace';
import FindAndReplaceEditing from '../src/findandreplaceediting';
import FindAndReplaceUI from '../src/findandreplaceui';

describe( 'FindAndReplace', () => {
	it( 'should require FindAndReplaceEditing, FindAndReplaceUI and Widget', () => {
		expect( FindAndReplace.requires ).to.deep.equal( [ FindAndReplaceEditing, FindAndReplaceUI, Widget ] );
	} );

	it( 'should be named', () => {
		expect( FindAndReplace.pluginName ).to.equal( 'FindAndReplace' );
	} );
} );
