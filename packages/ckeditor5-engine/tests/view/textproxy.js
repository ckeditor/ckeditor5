/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import TextProxy from '../../src/view/textproxy';
import Text from '../../src/view/text';
import ContainerElement from '../../src/view/containerelement';
import DocumentFragment from '../../src/view/documentfragment';
import RootEditableElement from '../../src/view/rooteditableelement';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

import createDocumentMock from '../../tests/view/_utils/createdocumentmock';

describe( 'TextProxy', () => {
	let text, parent, wrapper, textProxy;

	beforeEach( () => {
		text = new Text( 'abcdefgh' );
		parent = new ContainerElement( 'p', [], [ text ] );
		wrapper = new ContainerElement( 'div', [], parent );

		textProxy = new TextProxy( text, 2, 3 );
	} );

	describe( 'constructor()', () => {
		it( 'should create TextProxy instance with specified properties', () => {
			expect( textProxy ).to.have.property( 'parent' ).to.equal( parent );
			expect( textProxy ).to.have.property( 'data' ).to.equal( 'cde' );
			expect( textProxy ).to.have.property( 'textNode' ).to.equal( text );
			expect( textProxy ).to.have.property( 'offsetInText' ).to.equal( 2 );
		} );

		it( 'should have isPartial property', () => {
			const startTextProxy = new TextProxy( text, 0, 4 );
			const fullTextProxy = new TextProxy( text, 0, 8 );

			expect( textProxy.isPartial ).to.be.true;
			expect( startTextProxy.isPartial ).to.be.true;
			expect( fullTextProxy.isPartial ).to.be.false;
		} );

		it( 'should throw if wrong offsetInText is passed', () => {
			expect( () => {
				new TextProxy( text, -1, 2 ); // eslint-disable-line no-new
			} ).to.throw( CKEditorError, /view-textproxy-wrong-offsetintext/ );

			expect( () => {
				new TextProxy( text, 9, 1 ); // eslint-disable-line no-new
			} ).to.throw( CKEditorError, /view-textproxy-wrong-offsetintext/ );
		} );

		it( 'should throw if wrong length is passed', () => {
			expect( () => {
				new TextProxy( text, 2, -1 ); // eslint-disable-line no-new
			} ).to.throw( CKEditorError, /view-textproxy-wrong-length/ );

			expect( () => {
				new TextProxy( text, 2, 9 ); // eslint-disable-line no-new
			} ).to.throw( CKEditorError, /view-textproxy-wrong-length/ );
		} );
	} );

	describe( 'is', () => {
		it( 'should return true for textProxy', () => {
			expect( textProxy.is( 'textProxy' ) ).to.be.true;
		} );

		it( 'should return false for other accept values', () => {
			expect( textProxy.is( 'text' ) ).to.be.false;
			expect( textProxy.is( 'element' ) ).to.be.false;
			expect( textProxy.is( 'containerElement' ) ).to.be.false;
			expect( textProxy.is( 'attributeElement' ) ).to.be.false;
			expect( textProxy.is( 'uiElement' ) ).to.be.false;
			expect( textProxy.is( 'emptyElement' ) ).to.be.false;
			expect( textProxy.is( 'rootElement' ) ).to.be.false;
			expect( textProxy.is( 'documentFragment' ) ).to.be.false;
		} );
	} );

	describe( 'getDocument', () => {
		it( 'should return null if any parent has not set Document', () => {
			expect( textProxy.document ).to.be.null;
		} );

		it( 'should return Document attached to the parent element', () => {
			const docMock = createDocumentMock();
			const root = new RootEditableElement( 'div' );
			root.document = docMock;

			wrapper.parent = root;

			expect( textProxy.document ).to.equal( docMock );
		} );

		it( 'should return null if element is inside DocumentFragment', () => {
			new DocumentFragment( [ wrapper ] ); // eslint-disable-line no-new

			expect( textProxy.document ).to.be.null;
		} );
	} );

	describe( 'getRoot', () => {
		it( 'should return root element', () => {
			const root = new RootEditableElement( 'div' );
			root.document = createDocumentMock();

			wrapper.parent = root;

			expect( textProxy.root ).to.equal( root );
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

		it( 'should return array including node itself `includeSelf`', () => {
			const result = textProxy.getAncestors( { includeSelf: true } );

			expect( result ).to.be.an( 'array' );
			expect( result ).to.length( 3 );
			expect( result[ 0 ] ).to.equal( wrapper );
			expect( result[ 1 ] ).to.equal( parent );
			expect( result[ 2 ] ).to.equal( text );
		} );

		it( 'should return array of ancestors including node itself `includeSelf` starting from parent `parentFirst`', () => {
			const result = textProxy.getAncestors( { includeSelf: true, parentFirst: true } );

			expect( result.length ).to.equal( 3 );
			expect( result[ 0 ] ).to.equal( text );
			expect( result[ 1 ] ).to.equal( parent );
			expect( result[ 2 ] ).to.equal( wrapper );
		} );
	} );
} );
