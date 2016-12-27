/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: view */

import ContainerElement from 'ckeditor5-engine/src/view/containerelement';
import EditableElement from 'ckeditor5-engine/src/view/editableelement';
import RootEditableElement from 'ckeditor5-engine/src/view/rooteditableelement';

import createDocumentMock from 'ckeditor5-engine/tests/view/_utils/createdocumentmock';

describe( 'RootEditableElement', () => {
	describe( 'constructor()', () => {
		it( 'should create an element with default root name', () => {
			const root = new RootEditableElement( createDocumentMock(), 'div' );

			expect( root ).to.be.instanceof( EditableElement );
			expect( root ).to.be.instanceof( ContainerElement );

			expect( root.rootName ).to.equal( 'main' );
			expect( root.name ).to.equal( 'div' );

			expect( root.isFocused ).to.be.false;
			expect( root.isReadOnly ).to.be.false;
		} );

		it( 'should create an element with custom root name', () => {
			const root = new RootEditableElement( createDocumentMock(), 'h1', 'header' );

			expect( root.rootName ).to.equal( 'header' );
			expect( root.name ).to.equal( 'h1' );

			expect( root.isFocused ).to.be.false;
			expect( root.isReadOnly ).to.be.false;
		} );
	} );
} );
