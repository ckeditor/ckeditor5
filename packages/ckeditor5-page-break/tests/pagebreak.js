/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import PageBreak from '../src/pagebreak';
import PageBreakEditing from '../src/pagebreakediting';
import PageBreakUI from '../src/pagebreakui';

describe( 'PageBreak', () => {
	it( 'should require PageBreakEditing and PageBreakUI', () => {
		expect( PageBreak.requires ).to.deep.equal( [ PageBreakEditing, PageBreakUI ] );
	} );

	it( 'should be named', () => {
		expect( PageBreak.pluginName ).to.equal( 'PageBreak' );
	} );
} );
