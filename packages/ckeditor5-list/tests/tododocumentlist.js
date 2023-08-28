/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import TodoDocumentList from '../src/tododocumentlist';
import TodoDocumentListEditing from '../src/tododocumentlist/tododocumentlistediting';
import TodoListUI from '../src/todolist/todolistui';

describe( 'TodoDocumentList', () => {
	it( 'should be named', () => {
		expect( TodoDocumentList.pluginName ).to.equal( 'TodoDocumentList' );
	} );

	it( 'should require TodoDocumentListEditing and TodoListUI', () => {
		expect( TodoDocumentList.requires ).to.deep.equal( [ TodoDocumentListEditing, TodoListUI ] );
	} );
} );
