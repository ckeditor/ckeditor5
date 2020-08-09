/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ContainerElement from '../../src/view/containerelement';
import EditableElement from '../../src/view/editableelement';
import RootEditableElement from '../../src/view/rooteditableelement';

import createDocumentMock from '../../tests/view/_utils/createdocumentmock';

describe( 'RootEditableElement', () => {
	let document;

	beforeEach( () => {
		document = createDocumentMock();
	} );

	describe( 'constructor()', () => {
		it( 'should create an element with default root name', () => {
			const root = new RootEditableElement( document, 'div' );

			expect( root ).to.be.instanceof( EditableElement );
			expect( root ).to.be.instanceof( ContainerElement );

			expect( root.rootName ).to.equal( 'main' );
			expect( root.name ).to.equal( 'div' );

			expect( root.isFocused ).to.be.false;
			expect( root.isReadOnly ).to.be.false;
		} );

		it( 'should create an element with custom root name', () => {
			const root = new RootEditableElement( document, 'h1' );
			root.rootName = 'header';

			expect( root.rootName ).to.equal( 'header' );
			expect( root.name ).to.equal( 'h1' );

			expect( root.isFocused ).to.be.false;
			expect( root.isReadOnly ).to.be.false;
		} );
	} );

	describe( 'is()', () => {
		let el;

		before( () => {
			el = new RootEditableElement( document, 'div' );
		} );

		it( 'should return true for rootElement/containerElement/editable/element, also with correct name and element name', () => {
			expect( el.is( 'rootElement' ) ).to.be.true;
			expect( el.is( 'view:rootElement' ) ).to.be.true;
			expect( el.is( 'rootElement', 'div' ) ).to.be.true;
			expect( el.is( 'view:rootElement', 'div' ) ).to.be.true;
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
			expect( el.is( 'view:$text' ) ).to.be.false;
			expect( el.is( '$textProxy' ) ).to.be.false;
			expect( el.is( 'attributeElement' ) ).to.be.false;
			expect( el.is( 'uiElement' ) ).to.be.false;
			expect( el.is( 'emptyElement' ) ).to.be.false;
			expect( el.is( 'documentFragment' ) ).to.be.false;
			expect( el.is( 'model:rootElement' ) ).to.be.false;
			expect( el.is( 'div' ) ).to.be.false;
			expect( el.is( 'view:div' ) ).to.be.false;
			expect( el.is( 'node', 'div' ) ).to.be.false;
			expect( el.is( 'view:node', 'div' ) ).to.be.false;
		} );
	} );

	describe( '_name', () => {
		it( 'should set new name to element', () => {
			const el = new RootEditableElement( document, '$root' );

			expect( el.name ).to.equal( '$root' );

			el._name = 'div';

			expect( el.name ).to.equal( 'div' );
		} );
	} );

	it( 'should be cloned properly', () => {
		const root = new RootEditableElement( document, 'h1' );
		root.rootName = 'header';

		const newRoot = root._clone();

		expect( newRoot.document ).to.equal( root.document );
		expect( newRoot.rootName ).to.equal( root.rootName );
	} );
} );
