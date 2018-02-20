/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import createElement from '@ckeditor/ckeditor5-utils/src/dom/createelement';
import Document from '../../src/view/document';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import count from '@ckeditor/ckeditor5-utils/src/count';
import createViewRoot from './_utils/createroot';

testUtils.createSinonSandbox();

describe( 'Document', () => {
	let domRoot, viewDocument;

	beforeEach( () => {
		domRoot = createElement( document, 'div', {
			id: 'editor',
			contenteditable: 'true'
		} );
		document.body.appendChild( domRoot );

		viewDocument = new Document();
	} );

	afterEach( () => {
		domRoot.remove();
	} );

	describe( 'constructor()', () => {
		it( 'should create Document with all properties', () => {
			expect( count( viewDocument.roots ) ).to.equal( 0 );
			expect( viewDocument ).to.have.property( 'isReadOnly' ).to.false;
		} );
	} );

	describe( 'getRoot()', () => {
		it( 'should return "main" root', () => {
			createViewRoot( viewDocument, 'div', 'main' );

			expect( count( viewDocument.roots ) ).to.equal( 1 );

			expect( viewDocument.getRoot() ).to.equal( viewDocument.roots.get( 'main' ) );
		} );

		it( 'should return named root', () => {
			createViewRoot( viewDocument, 'h1', 'header' );

			expect( count( viewDocument.roots ) ).to.equal( 1 );

			expect( viewDocument.getRoot( 'header' ) ).to.equal( viewDocument.roots.get( 'header' ) );
		} );

		it( 'should return null when trying to get non-existent root', () => {
			expect( viewDocument.getRoot( 'not-existing' ) ).to.null;
		} );
	} );
} );
