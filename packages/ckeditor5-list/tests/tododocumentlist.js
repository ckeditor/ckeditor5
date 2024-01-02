/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global console */

import TodoDocumentList from '../src/tododocumentlist.js';
import TodoList from '../src/todolist.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

describe( 'TodoDocumentList', () => {
	testUtils.createSinonSandbox();

	it( 'should be named', () => {
		expect( TodoDocumentList.pluginName ).to.equal( 'TodoDocumentList' );
	} );

	it( 'should require TodoList', () => {
		expect( TodoDocumentList.requires ).to.deep.equal( [ TodoList ] );
	} );

	it( 'should emit warning when instantiated', () => {
		const expectedMessage = '`TodoDocumentList` plugin is obsolete. Use `TodoList` instead.';

		sinon.stub( console, 'warn' );

		// eslint-disable-next-line no-new
		new TodoDocumentList();

		sinon.assert.calledOnce( console.warn );
		sinon.assert.calledWith( console.warn, sinon.match( expectedMessage ) );
	} );
} );
