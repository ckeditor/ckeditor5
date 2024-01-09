/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Widget from '@ckeditor/ckeditor5-widget/src/widget.js';

import PageBreak from '../src/pagebreak.js';
import PageBreakEditing from '../src/pagebreakediting.js';
import PageBreakUI from '../src/pagebreakui.js';

describe( 'PageBreak', () => {
	it( 'should require PageBreakEditing, PageBreakUI and Widget', () => {
		expect( PageBreak.requires ).to.deep.equal( [ PageBreakEditing, PageBreakUI, Widget ] );
	} );

	it( 'should be named', () => {
		expect( PageBreak.pluginName ).to.equal( 'PageBreak' );
	} );
} );
