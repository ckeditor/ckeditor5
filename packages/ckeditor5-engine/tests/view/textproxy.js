/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: view */

import TextProxy from '/ckeditor5/engine/view/textproxy.js';
import Text from '/ckeditor5/engine/view/text.js';
import ContainerElement from '/ckeditor5/engine/view/containerelement.js';
import DocumentFragment from '/ckeditor5/engine/view/documentfragment.js';
import RootEditableElement from '/ckeditor5/engine/view/rooteditableelement.js';

import createDocumentMock from '/tests/engine/view/_utils/createdocumentmock.js';

describe( 'TextProxy', () => {
	let text, parent, wrapper, textProxy;

	beforeEach( () => {
		text = new Text( 'abcdefgh' );
		parent = new ContainerElement( 'p', [], [ text ] );
		wrapper = new ContainerElement( 'div', [], parent );

		textProxy = new TextProxy( text, 2, 3 );
	} );

	describe( 'constructor', () => {
		it( 'should create TextProxy instance with specified properties', () => {
			expect( textProxy ).to.have.property( 'parent' ).to.equal( parent );
			expect( textProxy ).to.have.property( 'data' ).to.equal( 'cde' );
			expect( textProxy ).to.have.property( 'textNode' ).to.equal( text );
			expect( textProxy ).to.have.property( 'offsetInText' ).to.equal( 2 );
		} );

		it( 'should have isPartial property', () => {
			let startTextProxy = new TextProxy( text, 0, 4 );
			let fullTextProxy = new TextProxy( text, 0, 8 );

			expect( textProxy.isPartial ).to.be.true;
			expect( startTextProxy.isPartial ).to.be.true;
			expect( fullTextProxy.isPartial ).to.be.false;
		} );
	} );

	describe( 'getDocument', () => {
		it( 'should return null if any parent has not set Document', () => {
			expect( textProxy.getDocument() ).to.be.null;
		} );

		it( 'should return Document attached to the parent element', () => {
			const docMock = createDocumentMock();
			const root = new RootEditableElement( docMock, 'div' );

			wrapper.parent = root;

			expect( textProxy.getDocument() ).to.equal( docMock );
		} );

		it( 'should return null if element is inside DocumentFragment', () => {
			new DocumentFragment( [ wrapper ] );

			expect( textProxy.getDocument() ).to.be.null;
		} );
	} );

	describe( 'getRoot', () => {
		it( 'should return root element', () => {
			const root = new RootEditableElement( createDocumentMock(), 'div' );

			wrapper.parent = root;

			expect( textProxy.getRoot() ).to.equal( root );
		} );
	} );

	describe( 'getAncestors', () => {
		it( 'should return array of ancestors', () => {
			const result = textProxy.getAncestors();

			expect( result ).to.be.an( 'array' );
			expect( result ).to.length( 2 );
			expect( result[ 0 ] ).to.equal( wrapper );
			expect( result[ 1 ] ).to.equal( parent );
		} );

		it( 'should return array of ancestors starting from parent `parentFirst`', () => {
			const result = textProxy.getAncestors( { parentFirst: true } );

			expect( result.length ).to.equal( 2 );
			expect( result[ 0 ] ).to.equal( parent );
			expect( result[ 1 ] ).to.equal( wrapper );
		} );

		it( 'should return array including node itself `includeNode`', () => {
			const result = textProxy.getAncestors( { includeNode: true } );

			expect( result ).to.be.an( 'array' );
			expect( result ).to.length( 3 );
			expect( result[ 0 ] ).to.equal( wrapper );
			expect( result[ 1 ] ).to.equal( parent );
			expect( result[ 2 ] ).to.equal( text );
		} );

		it( 'should return array of ancestors including node itself `includeNode` starting from parent `parentFirst`', () => {
			const result = textProxy.getAncestors( { includeNode: true, parentFirst: true } );

			expect( result.length ).to.equal( 3 );
			expect( result[ 0 ] ).to.equal( text );
			expect( result[ 1 ] ).to.equal( parent );
			expect( result[ 2 ] ).to.equal( wrapper );
		} );
	} );
} );
