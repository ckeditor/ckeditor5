/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: view */

'use strict';

import createDocumentMock from '/tests/engine/view/_utils/createdocumentmock.js';

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

		docMock.selectedEditable = rootMock;
		docMock.isFocused = true;
	} );
} );
