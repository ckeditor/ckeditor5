/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ContainerElement from 'ckeditor5-engine/src/view/containerelement';
import EditableElement from 'ckeditor5-engine/src/view/editableelement';
import RootEditableElement from 'ckeditor5-engine/src/view/rooteditableelement';

import createDocumentMock from 'ckeditor5-engine/tests/view/_utils/createdocumentmock';

describe( 'RootEditableElement', () => {
	describe( 'constructor()', () => {
		it( 'should create an element with default root name', () => {
			const root = new RootEditableElement( 'div' );
			root.document = createDocumentMock();

			expect( root ).to.be.instanceof( EditableElement );
			expect( root ).to.be.instanceof( ContainerElement );

			expect( root.rootName ).to.equal( 'main' );
			expect( root.name ).to.equal( 'div' );

			expect( root.isFocused ).to.be.false;
			expect( root.isReadOnly ).to.be.false;
		} );

		it( 'should create an element with custom root name', () => {
			const root = new RootEditableElement( 'h1' );
			root.document = createDocumentMock();
			root.rootName = 'header';

			expect( root.rootName ).to.equal( 'header' );
			expect( root.name ).to.equal( 'h1' );

			expect( root.isFocused ).to.be.false;
			expect( root.isReadOnly ).to.be.false;
		} );
	} );

	it( 'should be cloned properly', () => {
		const root = new RootEditableElement( 'h1' );
		root.document = createDocumentMock();
		root.rootName = 'header';

		const newRoot = root.clone();

		expect( newRoot.document ).to.equal( root.document );
		expect( newRoot.rootName ).to.equal( root.rootName );
	} );
} );
