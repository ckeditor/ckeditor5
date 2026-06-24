/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createViewDocumentMock } from '../../tests/view/_utils/createdocumentmock.js';

import { ViewEditableElement } from '../../src/view/editableelement.js';
import { ViewRange } from '../../src/view/range.js';
import { ViewDocument } from '../../src/view/document.js';
import { StylesProcessor } from '../../src/view/stylesmap.js';
import { ViewRootEditableElement, ViewText } from '../../src/index.js';

describe( 'ViewEditableElement', () => {
	describe( 'is', () => {
		let el;

		beforeEach( () => {
			el = new ViewEditableElement( new ViewDocument( new StylesProcessor() ), 'div' );
		} );

		it( 'should return true for containerElement/editable/element, also with correct name and element name', () => {
			expect( el.is( 'containerElement' ) ).toBe( true );
			expect( el.is( 'view:containerElement' ) ).toBe( true );
			expect( el.is( 'containerElement', 'div' ) ).toBe( true );
			expect( el.is( 'view:containerElement', 'div' ) ).toBe( true );
			expect( el.is( 'editableElement' ) ).toBe( true );
			expect( el.is( 'view:editableElement' ) ).toBe( true );
			expect( el.is( 'editableElement', 'div' ) ).toBe( true );
			expect( el.is( 'view:editableElement', 'div' ) ).toBe( true );
			expect( el.is( 'element' ) ).toBe( true );
			expect( el.is( 'view:element' ) ).toBe( true );
			expect( el.is( 'element', 'div' ) ).toBe( true );
			expect( el.is( 'view:element', 'div' ) ).toBe( true );
			expect( el.is( 'element', 'div' ) ).toBe( true );
		} );

		it( 'should return false for other accept values', () => {
			expect( el.is( 'rootElement', 'p' ) ).toBe( false );
			expect( el.is( 'view:rootElement', 'p' ) ).toBe( false );
			expect( el.is( 'containerElement', 'p' ) ).toBe( false );
			expect( el.is( 'view:containerElement', 'p' ) ).toBe( false );
			expect( el.is( 'element', 'p' ) ).toBe( false );
			expect( el.is( 'view:element', 'p' ) ).toBe( false );
			expect( el.is( 'element', 'p' ) ).toBe( false );
			expect( el.is( 'view:p' ) ).toBe( false );
			expect( el.is( '$text' ) ).toBe( false );
			expect( el.is( '$textProxy' ) ).toBe( false );
			expect( el.is( 'attributeElement' ) ).toBe( false );
			expect( el.is( 'uiElement' ) ).toBe( false );
			expect( el.is( 'emptyElement' ) ).toBe( false );
			expect( el.is( 'documentFragment' ) ).toBe( false );
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

			expect( root.isFocused ).toBe( false );

			const isFocusedSpy = vi.fn();

			root.on( 'change:isFocused', isFocusedSpy );

			root.isFocused = true;

			expect( root.isFocused ).toBe( true );

			expect( isFocusedSpy.mock.calls.length === 1 ).toBe( true );
		} );

		it( 'should change isFocused when selection changes', () => {
			const rangeMain = ViewRange._createFromParentsAndOffsets( viewMain, 0, viewMain, 0 );
			const rangeHeader = ViewRange._createFromParentsAndOffsets( viewHeader, 0, viewHeader, 0 );
			docMock.selection._setTo( rangeMain );
			docMock.isFocused = true;

			expect( viewMain.isFocused ).toBe( true );
			expect( viewHeader.isFocused ).toBe( false );

			docMock.selection._setTo( [ rangeHeader ] );

			expect( viewMain.isFocused ).toBe( false );
			expect( viewHeader.isFocused ).toBe( true );
		} );

		it( 'should change isFocused when document.isFocus changes', () => {
			const rangeMain = ViewRange._createFromParentsAndOffsets( viewMain, 0, viewMain, 0 );
			const rangeHeader = ViewRange._createFromParentsAndOffsets( viewHeader, 0, viewHeader, 0 );
			docMock.selection._setTo( rangeMain );
			docMock.isFocused = true;

			expect( viewMain.isFocused ).toBe( true );
			expect( viewHeader.isFocused ).toBe( false );

			docMock.isFocused = false;

			expect( viewMain.isFocused ).toBe( false );
			expect( viewHeader.isFocused ).toBe( false );

			docMock.selection._setTo( [ rangeHeader ] );

			expect( viewMain.isFocused ).toBe( false );
			expect( viewHeader.isFocused ).toBe( false );
		} );
	} );

	describe( 'isReadOnly', () => {
		let docMock;

		beforeEach( () => {
			docMock = createViewDocumentMock();
		} );

		it( 'should be observable', () => {
			const root = new ViewEditableElement( docMock, 'div' );

			expect( root.isReadOnly ).toBe( false );

			const isReadOnlySpy = vi.fn();

			root.on( 'change:isReadOnly', isReadOnlySpy );

			root.isReadOnly = true;

			expect( root.isReadOnly ).toBe( true );

			expect( isReadOnlySpy.mock.calls.length === 1 ).toBe( true );
		} );

		it( 'should be bound to the document#isReadOnly', () => {
			const root = new ViewEditableElement( docMock, 'div' );

			root.document.isReadOnly = false;

			expect( root.isReadOnly ).toBe( false );

			root.document.isReadOnly = true;

			expect( root.isReadOnly ).toBe( true );
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

			expect( newElement.document ).toBe( docMock );
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

			expect( parsed ).toEqual( {
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
