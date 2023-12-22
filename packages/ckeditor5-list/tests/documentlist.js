/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import DocumentList from '../src/documentlist.js';
import List from '../src/list.js';

describe( 'DocumentList', () => {
	it( 'should be named', () => {
		expect( DocumentList.pluginName ).to.equal( 'DocumentList' );
	} );

	it( 'should require List', () => {
		expect( DocumentList.requires ).to.deep.equal( [ List ] );
	} );
} );
