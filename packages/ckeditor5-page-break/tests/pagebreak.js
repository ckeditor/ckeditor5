/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Widget from '@ckeditor/ckeditor5-widget/src/widget';

import PageBreak from '../src/pagebreak';
import PageBreakEditing from '../src/pagebreakediting';
import PageBreakUI from '../src/pagebreakui';

describe( 'PageBreak', () => {
	it( 'should require PageBreakEditing, PageBreakUI and Widget', () => {
		expect( PageBreak.requires ).to.deep.equal( [ PageBreakEditing, PageBreakUI, Widget ] );
	} );

	it( 'should be named', () => {
		expect( PageBreak.pluginName ).to.equal( 'PageBreak' );
	} );
} );
