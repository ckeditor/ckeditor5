/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: view */

'use strict';

import ContainerElement from '/ckeditor5/engine/view/containerelement.js';
import EditableElement from '/ckeditor5/engine/view/editableelement.js';
import RootEditableElement from '/ckeditor5/engine/view/rooteditableelement.js';

describe( 'RootEditableElement', () => {
	describe( 'constructor', () => {
		it( 'should create an element with default root name', () => {
			const root = new RootEditableElement( {}, 'div' );

			expect( root ).to.be.instanceof( EditableElement );
			expect( root ).to.be.instanceof( ContainerElement );

			expect( root.rootName ).to.equal( 'main' );
			expect( root.name ).to.equal( 'div' );

			expect( root.isFocused ).to.be.false;
			expect( root.isReadOnly ).to.be.false;
		} );

		it( 'should create an element with custom root name', () => {
			const root = new RootEditableElement( {}, 'h1', 'header' );

			expect( root.rootName ).to.equal( 'header' );
			expect( root.name ).to.equal( 'h1' );

			expect( root.isFocused ).to.be.false;
			expect( root.isReadOnly ).to.be.false;
		} );
	} );

	describe( 'isFocused', () => {
		it( 'should be observable', () => {
			const root = new RootEditableElement( {}, 'div' );

			expect( root.isFocused ).to.be.false;

			const isFocusedSpy = sinon.spy();

			root.on( 'change:isFocused', isFocusedSpy );

			root.isFocused = true;

			expect( root.isFocused ).to.be.true;

			expect( isFocusedSpy.calledOnce ).to.be.true;
		} );
	} );

	describe( 'isReadOnly', () => {
		it( 'should be observable', () => {
			const root = new RootEditableElement( {}, 'div' );

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
			const docMock = {};
			const root = new RootEditableElement( docMock, 'div' );

			expect( root.getDocument() ).to.equal( docMock );
		} );
	} );
} );
