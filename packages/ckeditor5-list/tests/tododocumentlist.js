/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
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
		sinon.stub( console, 'warn' );

		// eslint-disable-next-line no-new
		new TodoDocumentList();

		sinon.assert.calledOnce( console.warn );
		sinon.assert.calledWithExactly( console.warn,
			sinon.match( /^plugin-obsolete-tododocumentlist/ ),
			{ pluginName: 'TodoDocumentList' },
			sinon.match.string // Link to the documentation
		);
	} );
} );
