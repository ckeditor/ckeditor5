/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: model */

'use strict';

import Element from '/ckeditor5/engine/model/element.js';
import Text from '/ckeditor5/engine/model/text.js';
import TextProxy from '/ckeditor5/engine/model/textproxy.js';
import Document from '/ckeditor5/engine/model/document.js';

describe( 'TextProxy', () => {
	let doc, text, element, textProxy, root;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot();
		element = new Element( 'div' );
		root.insertChildren( 0, element );

		text = new Text( 'foobar', { foo: 'bar' } );
		element.insertChildren( 0, text );
		textProxy = new TextProxy( text, 2, 3 );
	} );

	it( 'should have data property', () => {
		expect( textProxy ).to.have.property( 'data' ).that.equals( 'oba' );
	} );

	it( 'should have root', () => {
		expect( textProxy ).to.have.property( 'root' ).that.equals( root );
	} );

	it( 'should have document', () => {
		expect( textProxy ).to.have.property( 'document' ).that.equals( doc );
	} );

	describe( 'getPath', () => {
		it( 'should return path to the text proxy', () => {
			expect( textProxy.getPath() ).to.deep.equal( [ 0, 2 ] );
		} );
	} );

	describe( 'attributes interface', () => {
		describe( 'hasAttribute', () => {
			it( 'should return true if text proxy has attribute with given key', () => {
				expect( textProxy.hasAttribute( 'foo' ) ).to.be.true;
			} );

			it( 'should return false if text proxy does not have attribute with given key', () => {
				expect( textProxy.hasAttribute( 'abc' ) ).to.be.false;
			} );
		} );

		describe( 'getAttribute', () => {
			it( 'should return attribute with given key if text proxy has given attribute', () => {
				expect( textProxy.getAttribute( 'foo' ) ).to.equal( 'bar' );
			} );

			it( 'should return undefined if text proxy does not have given attribute', () => {
				expect( textProxy.getAttribute( 'bar' ) ).to.be.undefined;
			} );
		} );

		describe( 'getAttributes', () => {
			it( 'should return an iterator that iterates over all attributes set on the text proxy', () => {
				let attrs = Array.from( textProxy.getAttributes() );

				expect( attrs ).to.deep.equal( [ [ 'foo', 'bar' ] ] );
			} );
		} );
	} );
} );
