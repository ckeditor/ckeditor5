/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import TodoDocumentList from '../src/tododocumentlist.js';
import TodoList from '../src/todolist.js';

describe( 'TodoDocumentList', () => {
	it( 'should be named', () => {
		expect( TodoDocumentList.pluginName ).to.equal( 'TodoDocumentList' );
	} );

	it( 'should require TodoList', () => {
		expect( TodoDocumentList.requires ).to.deep.equal( [ TodoList ] );
	} );
} );
