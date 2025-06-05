/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { createViewDocumentMock } from '../../../tests/view/_utils/createdocumentmock.js';

describe( 'createViewDocumentMock', () => {
	it( 'should create document mock', () => {
		const docMock = createViewDocumentMock();
		const rootMock = {};

		const isFocusedSpy = sinon.spy();
		const isReadOnlySpy = sinon.spy();

		docMock.on( 'change:selectedEditable', ( evt, key, value ) => {
			expect( value ).to.equal( rootMock );
		} );

		docMock.on( 'change:isFocused', isFocusedSpy );
		docMock.on( 'change:isReadOnly', isReadOnlySpy );

		docMock.isFocused = true;
		docMock.isReadOnly = true;

		sinon.assert.calledOnce( isFocusedSpy );
		expect( isFocusedSpy.lastCall.args[ 2 ] ).to.true;
		sinon.assert.calledOnce( isReadOnlySpy );
		expect( isReadOnlySpy.lastCall.args[ 2 ] ).to.true;
	} );
} );
