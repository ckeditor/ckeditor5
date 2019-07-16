/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import createDocumentMock from '../../tests/view/_utils/createdocumentmock';

import RootEditableElement from '../../src/view/rooteditableelement';
import Range from '../../src/view/range';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';

describe( 'EditableElement', () => {
	describe( 'document', () => {
		let element, docMock;

		beforeEach( () => {
			element = new RootEditableElement( 'div' );
			docMock = createDocumentMock();
		} );

		it( 'should allow to set document', () => {
			element._document = docMock;

			expect( element.document ).to.equal( docMock );
		} );

		it( 'should return undefined if document is not set', () => {
			expect( element.document ).to.be.undefined;
		} );

		it( 'should throw if trying to set document again', () => {
			element._document = docMock;
			const newDoc = createDocumentMock();

			expectToThrowCKEditorError( () => {
				element._document = newDoc;
			}, 'view-editableelement-document-already-set: View document is already set.', docMock );
		} );

		it( 'should be cloned properly', () => {
			element._document = docMock;
			const newElement = element._clone();

			expect( newElement.document ).to.equal( docMock );
		} );
	} );

	describe( 'isFocused', () => {
		let docMock, viewMain, viewHeader;

		beforeEach( () => {
			docMock = createDocumentMock();

			viewMain = new RootEditableElement( 'div' );
			viewMain._document = docMock;

			viewHeader = new RootEditableElement( 'h1' );
			viewHeader._document = docMock;
			viewHeader.rootName = 'header';
		} );

		it( 'should be observable', () => {
			const root = new RootEditableElement( 'div' );
			root._document = createDocumentMock();

			expect( root.isFocused ).to.be.false;

			const isFocusedSpy = sinon.spy();

			root.on( 'change:isFocused', isFocusedSpy );

			root.isFocused = true;

			expect( root.isFocused ).to.be.true;

			expect( isFocusedSpy.calledOnce ).to.be.true;
		} );

		it( 'should change isFocused when selection changes', () => {
			const rangeMain = Range._createFromParentsAndOffsets( viewMain, 0, viewMain, 0 );
			const rangeHeader = Range._createFromParentsAndOffsets( viewHeader, 0, viewHeader, 0 );
			docMock.selection._setTo( rangeMain );
			docMock.isFocused = true;

			expect( viewMain.isFocused ).to.be.true;
			expect( viewHeader.isFocused ).to.be.false;

			docMock.selection._setTo( [ rangeHeader ] );

			expect( viewMain.isFocused ).to.be.false;
			expect( viewHeader.isFocused ).to.be.true;
		} );

		it( 'should change isFocused when document.isFocus changes', () => {
			const rangeMain = Range._createFromParentsAndOffsets( viewMain, 0, viewMain, 0 );
			const rangeHeader = Range._createFromParentsAndOffsets( viewHeader, 0, viewHeader, 0 );
			docMock.selection._setTo( rangeMain );
			docMock.isFocused = true;

			expect( viewMain.isFocused ).to.be.true;
			expect( viewHeader.isFocused ).to.be.false;

			docMock.isFocused = false;

			expect( viewMain.isFocused ).to.be.false;
			expect( viewHeader.isFocused ).to.be.false;

			docMock.selection._setTo( [ rangeHeader ] );

			expect( viewMain.isFocused ).to.be.false;
			expect( viewHeader.isFocused ).to.be.false;
		} );
	} );

	describe( 'isReadOnly', () => {
		it( 'should be observable', () => {
			const root = new RootEditableElement( 'div' );
			root._document = createDocumentMock();

			expect( root.isReadOnly ).to.be.false;

			const isReadOnlySpy = sinon.spy();

			root.on( 'change:isReadOnly', isReadOnlySpy );

			root.isReadOnly = true;

			expect( root.isReadOnly ).to.be.true;

			expect( isReadOnlySpy.calledOnce ).to.be.true;
		} );

		it( 'should be bound to the document#isReadOnly', () => {
			const root = new RootEditableElement( 'div' );
			root._document = createDocumentMock();

			root.document.isReadOnly = false;

			expect( root.isReadOnly ).to.false;

			root.document.isReadOnly = true;

			expect( root.isReadOnly ).to.true;
		} );
	} );

	describe( 'getDocument', () => {
		it( 'should return document', () => {
			const docMock = createDocumentMock();
			const root = new RootEditableElement( 'div' );
			root._document = docMock;

			expect( root.document ).to.equal( docMock );
		} );
	} );
} );
