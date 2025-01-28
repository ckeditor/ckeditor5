/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import createDocumentMock from '../../tests/view/_utils/createdocumentmock.js';

import EditableElement from '../../src/view/editableelement.js';
import Range from '../../src/view/range.js';
import Document from '../../src/view/document.js';
import { StylesProcessor } from '../../src/view/stylesmap.js';

describe( 'EditableElement', () => {
	describe( 'is', () => {
		let el;

		before( () => {
			el = new EditableElement( new Document( new StylesProcessor() ), 'div' );
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
			expect( el.is( 'element', 'div' ) ).to.be.true;
		} );

		it( 'should return false for other accept values', () => {
			expect( el.is( 'rootElement', 'p' ) ).to.be.false;
			expect( el.is( 'view:rootElement', 'p' ) ).to.be.false;
			expect( el.is( 'containerElement', 'p' ) ).to.be.false;
			expect( el.is( 'view:containerElement', 'p' ) ).to.be.false;
			expect( el.is( 'element', 'p' ) ).to.be.false;
			expect( el.is( 'view:element', 'p' ) ).to.be.false;
			expect( el.is( 'element', 'p' ) ).to.be.false;
			expect( el.is( 'view:p' ) ).to.be.false;
			expect( el.is( '$text' ) ).to.be.false;
			expect( el.is( '$textProxy' ) ).to.be.false;
			expect( el.is( 'attributeElement' ) ).to.be.false;
			expect( el.is( 'uiElement' ) ).to.be.false;
			expect( el.is( 'emptyElement' ) ).to.be.false;
			expect( el.is( 'documentFragment' ) ).to.be.false;
		} );
	} );

	describe( 'isFocused', () => {
		let docMock, viewMain, viewHeader;

		beforeEach( () => {
			docMock = createDocumentMock();

			viewMain = new EditableElement( docMock, 'div' );

			viewHeader = new EditableElement( docMock, 'h1' );
			viewHeader.rootName = 'header';
		} );

		it( 'should be observable', () => {
			const root = new EditableElement( docMock, 'div' );

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
		let docMock;

		beforeEach( () => {
			docMock = createDocumentMock();
		} );

		it( 'should be observable', () => {
			const root = new EditableElement( docMock, 'div' );

			expect( root.isReadOnly ).to.be.false;

			const isReadOnlySpy = sinon.spy();

			root.on( 'change:isReadOnly', isReadOnlySpy );

			root.isReadOnly = true;

			expect( root.isReadOnly ).to.be.true;

			expect( isReadOnlySpy.calledOnce ).to.be.true;
		} );

		it( 'should be bound to the document#isReadOnly', () => {
			const root = new EditableElement( docMock, 'div' );

			root.document.isReadOnly = false;

			expect( root.isReadOnly ).to.false;

			root.document.isReadOnly = true;

			expect( root.isReadOnly ).to.true;
		} );
	} );

	describe( 'document', () => {
		let element, docMock;

		beforeEach( () => {
			docMock = createDocumentMock();
			element = new EditableElement( docMock, 'div' );
		} );

		it( 'should be cloned properly', () => {
			const newElement = element._clone();

			expect( newElement.document ).to.equal( docMock );
		} );
	} );
} );
