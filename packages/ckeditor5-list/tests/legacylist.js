/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import LegacyList from '../src/legacylist.js';
import LegacyListEditing from '../src/legacylist/legacylistediting.js';
import ListUI from '../src/list/listui.js';

describe( 'LegacyList', () => {
	it( 'should be named', () => {
		expect( LegacyList.pluginName ).to.equal( 'LegacyList' );
	} );

	it( 'should require LegacyListEditing and ListUI', () => {
		expect( LegacyList.requires ).to.deep.equal( [ LegacyListEditing, ListUI ] );
	} );
} );
