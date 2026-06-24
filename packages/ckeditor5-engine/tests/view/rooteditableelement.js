/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { ViewContainerElement } from '../../src/view/containerelement.js';
import { ViewEditableElement } from '../../src/view/editableelement.js';
import { ViewRootEditableElement } from '../../src/view/rooteditableelement.js';

import { createViewDocumentMock } from '../../tests/view/_utils/createdocumentmock.js';
import { ViewText } from '../../src/index.js';

describe( 'RootEditableElement', () => {
	let document;

	beforeEach( () => {
		document = createViewDocumentMock();
	} );

	describe( 'constructor()', () => {
		it( 'should create an element with default root name', () => {
			const root = new ViewRootEditableElement( document, 'div' );

			expect( root ).toBeInstanceOf( ViewEditableElement );
			expect( root ).toBeInstanceOf( ViewContainerElement );

			expect( root.rootName ).toBe( 'main' );
			expect( root.name ).toBe( 'div' );

			expect( root.isFocused ).toBe( false );
			expect( root.isReadOnly ).toBe( false );
		} );

		it( 'should create an element with custom root name', () => {
			const root = new ViewRootEditableElement( document, 'h1' );
			root.rootName = 'header';

			expect( root.rootName ).toBe( 'header' );
			expect( root.name ).toBe( 'h1' );

			expect( root.isFocused ).toBe( false );
			expect( root.isReadOnly ).toBe( false );
		} );
	} );

	describe( 'is()', () => {
		let el;

		beforeAll( () => {
			el = new ViewRootEditableElement( document, 'div' );
		} );

		it( 'should return true for rootElement/containerElement/editable/element, also with correct name and element name', () => {
			expect( el.is( 'rootElement' ) ).toBe( true );
			expect( el.is( 'view:rootElement' ) ).toBe( true );
			expect( el.is( 'rootElement', 'div' ) ).toBe( true );
			expect( el.is( 'view:rootElement', 'div' ) ).toBe( true );
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
			expect( el.is( 'view:$text' ) ).toBe( false );
			expect( el.is( '$textProxy' ) ).toBe( false );
			expect( el.is( 'attributeElement' ) ).toBe( false );
			expect( el.is( 'uiElement' ) ).toBe( false );
			expect( el.is( 'emptyElement' ) ).toBe( false );
			expect( el.is( 'documentFragment' ) ).toBe( false );
			expect( el.is( 'model:rootElement' ) ).toBe( false );
			expect( el.is( 'div' ) ).toBe( false );
			expect( el.is( 'view:div' ) ).toBe( false );
			expect( el.is( 'node', 'div' ) ).toBe( false );
			expect( el.is( 'view:node', 'div' ) ).toBe( false );
		} );
	} );

	describe( '_name', () => {
		it( 'should set new name to element', () => {
			const el = new ViewRootEditableElement( document, '$root' );

			expect( el.name ).toBe( '$root' );

			el._name = 'div';

			expect( el.name ).toBe( 'div' );
		} );
	} );

	it( 'should be cloned properly', () => {
		const root = new ViewRootEditableElement( document, 'h1' );
		root.rootName = 'header';

		const newRoot = root._clone();

		expect( newRoot.document ).toBe( root.document );
		expect( newRoot.rootName ).toBe( root.rootName );
	} );

	describe( 'toJSON()', () => {
		it( 'should provide root name only', () => {
			const text = new ViewText( document, 'foo' );
			const editable = new ViewContainerElement( document, 'p', null );
			const root = new ViewRootEditableElement( document, 'div' );
			editable._appendChild( text );
			root._appendChild( editable );

			const json = JSON.stringify( root );
			const parsed = JSON.parse( json );

			expect( parsed ).toBe( 'main' );
		} );
	} );
} );
