/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import createDocumentMock from '../../tests/view/_utils/createdocumentmock';

import EditableElement from '../../src/view/editableelement';
import Range from '../../src/view/range';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';

describe( 'EditableElement', () => {
	describe( 'is', () => {
		let el;

		before( () => {
			el = new EditableElement( 'div' );
		} );

		it( 'should return true for containerElement/editable/element, also with correct name and element name', () => {
			expect( el.is( 'containerElement' ) ).to.be.true;
			expect( el.is( 'view:containerElement' ) ).to.be.true;
			expect( el.is( 'containerElement', 'div' ) ).to.be.true;
			expect( el.is( 'view:containerElement', 'div' ) ).to.be.true;
			expect( el.is( 'editableElement' ) ).to.be.true;
			expect( el.is( 'view:editableElement' ) ).to.be.true;
			expect( el.is( 'editableElement', 'div' ) ).to.be.true;
			expect( el.is( 'view:editableElement', 'div' ) ).to.be.true;
			expect( el.is( 'element' ) ).to.be.true;
			expect( el.is( 'view:element' ) ).to.be.true;
			expect( el.is( 'element', 'div' ) ).to.be.true;
			expect( el.is( 'view:element', 'div' ) ).to.be.true;
			expect( el.is( 'div' ) ).to.be.true;
			expect( el.is( 'view:div' ) ).to.be.true;
		} );

		it( 'should return false for other accept values', () => {
			expect( el.is( 'rootElement', 'p' ) ).to.be.false;
			expect( el.is( 'view:rootElement', 'p' ) ).to.be.false;
			expect( el.is( 'containerElement', 'p' ) ).to.be.false;
			expect( el.is( 'view:containerElement', 'p' ) ).to.be.false;
			expect( el.is( 'element', 'p' ) ).to.be.false;
			expect( el.is( 'view:element', 'p' ) ).to.be.false;
			expect( el.is( 'p' ) ).to.be.false;
			expect( el.is( 'view:p' ) ).to.be.false;
			expect( el.is( 'text' ) ).to.be.false;
			expect( el.is( 'textProxy' ) ).to.be.false;
			expect( el.is( 'attributeElement' ) ).to.be.false;
			expect( el.is( 'uiElement' ) ).to.be.false;
			expect( el.is( 'emptyElement' ) ).to.be.false;
			expect( el.is( 'documentFragment' ) ).to.be.false;
		} );
	} );

	describe( 'document', () => {
		let element, docMock;

		beforeEach( () => {
			element = new EditableElement( 'div' );
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

			viewMain = new EditableElement( 'div' );
			viewMain._document = docMock;

			viewHeader = new EditableElement( 'h1' );
			viewHeader._document = docMock;
			viewHeader.rootName = 'header';
		} );

		it( 'should be observable', () => {
			const root = new EditableElement( 'div' );
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
			const root = new EditableElement( 'div' );
			root._document = createDocumentMock();

			expect( root.isReadOnly ).to.be.false;

			const isReadOnlySpy = sinon.spy();

			root.on( 'change:isReadOnly', isReadOnlySpy );

			root.isReadOnly = true;

			expect( root.isReadOnly ).to.be.true;

			expect( isReadOnlySpy.calledOnce ).to.be.true;
		} );

		it( 'should be bound to the document#isReadOnly', () => {
			const root = new EditableElement( 'div' );
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
			const root = new EditableElement( 'div' );
			root._document = docMock;

			expect( root.document ).to.equal( docMock );
		} );
	} );
} );
