/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import createDocumentMock from '../../../tests/view/_utils/createdocumentmock';

describe( 'createDocumentMock', () => {
	it( 'should create document mock', () => {
		const docMock = createDocumentMock();
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
