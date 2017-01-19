/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import createDocumentMock from '../../../tests/view/_utils/createdocumentmock';

describe( 'createDocumentMock', () => {
	it( 'should create document mock', ( done ) => {
		const docMock = createDocumentMock();
		const rootMock = {};

		docMock.on( 'change:selectedEditable', ( evt, key, value ) => {
			expect( value ).to.equal( rootMock );
		} );

		docMock.on( 'change:isFocused', ( evt, key, value ) => {
			expect( value ).to.be.true;
			done();
		} );

		docMock.isFocused = true;
	} );
} );
