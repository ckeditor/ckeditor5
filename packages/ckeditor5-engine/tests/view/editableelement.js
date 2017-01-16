/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import createDocumentMock from 'ckeditor5-engine/tests/view/_utils/createdocumentmock';
import RootEditableElement from 'ckeditor5-engine/src/view/rooteditableelement';
import Range from 'ckeditor5-engine/src/view/range';

describe( 'EditableElement', () => {
	describe( 'isFocused', () => {
		let docMock, viewMain, viewHeader;

		beforeEach( () => {
			docMock = createDocumentMock();

			viewMain = new RootEditableElement( 'div' );
			viewMain.document = docMock;

			viewHeader = new RootEditableElement( 'h1' );
			viewHeader.document = docMock;
			viewHeader.rootName = 'header';
		} );

		it( 'should be observable', () => {
			const root = new RootEditableElement( 'div' );
			root.document = createDocumentMock();

			expect( root.isFocused ).to.be.false;

			const isFocusedSpy = sinon.spy();

			root.on( 'change:isFocused', isFocusedSpy );

			root.isFocused = true;

			expect( root.isFocused ).to.be.true;

			expect( isFocusedSpy.calledOnce ).to.be.true;
		} );

		it( 'should change isFocused on document render event', () => {
			const rangeMain = Range.createFromParentsAndOffsets( viewMain, 0, viewMain, 0 );
			const rangeHeader = Range.createFromParentsAndOffsets( viewHeader, 0, viewHeader, 0 );
			docMock.selection.addRange( rangeMain );
			docMock.isFocused = true;

			expect( viewMain.isFocused ).to.be.true;
			expect( viewHeader.isFocused ).to.be.false;

			docMock.selection.setRanges( [ rangeHeader ] );
			docMock.fire( 'render' );

			expect( viewMain.isFocused ).to.be.false;
			expect( viewHeader.isFocused ).to.be.true;
		} );

		it( 'should change isFocused when document.isFocus changes', () => {
			const rangeMain = Range.createFromParentsAndOffsets( viewMain, 0, viewMain, 0 );
			const rangeHeader = Range.createFromParentsAndOffsets( viewHeader, 0, viewHeader, 0 );
			docMock.selection.addRange( rangeMain );
			docMock.isFocused = true;

			expect( viewMain.isFocused ).to.be.true;
			expect( viewHeader.isFocused ).to.be.false;

			docMock.isFocused = false;

			expect( viewMain.isFocused ).to.be.false;
			expect( viewHeader.isFocused ).to.be.false;

			docMock.selection.setRanges( [ rangeHeader ] );

			expect( viewMain.isFocused ).to.be.false;
			expect( viewHeader.isFocused ).to.be.false;
		} );
	} );

	describe( 'isReadOnly', () => {
		it( 'should be observable', () => {
			const root = new RootEditableElement( 'div' );
			root.document = createDocumentMock();

			expect( root.isReadOnly ).to.be.false;

			const isReadOnlySpy = sinon.spy();

			root.on( 'change:isReadOnly', isReadOnlySpy );

			root.isReadOnly = true;

			expect( root.isReadOnly ).to.be.true;

			expect( isReadOnlySpy.calledOnce ).to.be.true;
		} );
	} );

	describe( 'getDocument', ()=> {
		it( 'should return document', () => {
			const docMock = createDocumentMock();
			const root = new RootEditableElement( 'div' );
			root.document = docMock;

			expect( root.document ).to.equal( docMock );
		} );
	} );
} );
