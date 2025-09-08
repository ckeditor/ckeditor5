/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { createViewDocumentMock } from '../../tests/view/_utils/createdocumentmock.js';

import { ViewEditableElement } from '../../src/view/editableelement.js';
import { ViewRange } from '../../src/view/range.js';
import { ViewDocument } from '../../src/view/document.js';
import { StylesProcessor } from '../../src/view/stylesmap.js';
import { ViewRootEditableElement, ViewText } from '../../src/index.js';

describe( 'ViewEditableElement', () => {
	describe( 'is', () => {
		let el;

		before( () => {
			el = new ViewEditableElement( new ViewDocument( new StylesProcessor() ), 'div' );
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
			docMock = createViewDocumentMock();

			viewMain = new ViewEditableElement( docMock, 'div' );

			viewHeader = new ViewEditableElement( docMock, 'h1' );
			viewHeader.rootName = 'header';
		} );

		it( 'should be observable', () => {
			const root = new ViewEditableElement( docMock, 'div' );

			expect( root.isFocused ).to.be.false;

			const isFocusedSpy = sinon.spy();

			root.on( 'change:isFocused', isFocusedSpy );

			root.isFocused = true;

			expect( root.isFocused ).to.be.true;

			expect( isFocusedSpy.calledOnce ).to.be.true;
		} );

		it( 'should change isFocused when selection changes', () => {
			const rangeMain = ViewRange._createFromParentsAndOffsets( viewMain, 0, viewMain, 0 );
			const rangeHeader = ViewRange._createFromParentsAndOffsets( viewHeader, 0, viewHeader, 0 );
			docMock.selection._setTo( rangeMain );
			docMock.isFocused = true;

			expect( viewMain.isFocused ).to.be.true;
			expect( viewHeader.isFocused ).to.be.false;

			docMock.selection._setTo( [ rangeHeader ] );

			expect( viewMain.isFocused ).to.be.false;
			expect( viewHeader.isFocused ).to.be.true;
		} );

		it( 'should change isFocused when document.isFocus changes', () => {
			const rangeMain = ViewRange._createFromParentsAndOffsets( viewMain, 0, viewMain, 0 );
			const rangeHeader = ViewRange._createFromParentsAndOffsets( viewHeader, 0, viewHeader, 0 );
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
			docMock = createViewDocumentMock();
		} );

		it( 'should be observable', () => {
			const root = new ViewEditableElement( docMock, 'div' );

			expect( root.isReadOnly ).to.be.false;

			const isReadOnlySpy = sinon.spy();

			root.on( 'change:isReadOnly', isReadOnlySpy );

			root.isReadOnly = true;

			expect( root.isReadOnly ).to.be.true;

			expect( isReadOnlySpy.calledOnce ).to.be.true;
		} );

		it( 'should be bound to the document#isReadOnly', () => {
			const root = new ViewEditableElement( docMock, 'div' );

			root.document.isReadOnly = false;

			expect( root.isReadOnly ).to.false;

			root.document.isReadOnly = true;

			expect( root.isReadOnly ).to.true;
		} );
	} );

	describe( 'document', () => {
		let element, docMock;

		beforeEach( () => {
			docMock = createViewDocumentMock();
			element = new ViewEditableElement( docMock, 'div' );
		} );

		it( 'should be cloned properly', () => {
			const newElement = element._clone();

			expect( newElement.document ).to.equal( docMock );
		} );
	} );

	describe( 'toJSON()', () => {
		it( 'should provide node type, root name, path, child nodes, and additional flags', () => {
			const document = new ViewDocument( new StylesProcessor() );
			const text = new ViewText( document, 'foo' );
			const editable = new ViewEditableElement( document, 'p', null );
			const root = new ViewRootEditableElement( document, 'div' );
			editable._appendChild( text );
			root._appendChild( editable );

			const json = JSON.stringify( editable );
			const parsed = JSON.parse( json );

			expect( parsed ).to.deep.equal( {
				name: 'p',
				path: [ 0 ],
				root: 'main',
				type: 'EditableElement',
				isFocused: false,
				isReadOnly: false,
				children: [
					{
						data: 'foo',
						path: [ 0, 0 ],
						root: 'main',
						type: 'Text'
					}
				]
			} );
		} );
	} );
} );
