/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel */

'use strict';

import Element from '/ckeditor5/core/treemodel/element.js';
import Text from '/ckeditor5/core/treemodel/text.js';
import Attribute from '/ckeditor5/core/treemodel/attribute.js';
import TextFragment from '/ckeditor5/core/treemodel/textfragment.js';
import Position from '/ckeditor5/core/treemodel/position.js';
import Document from '/ckeditor5/core/treemodel/document.js';

describe( 'TextFragment', () => {
	let doc, text, element, textFragment, root;

	before( () => {
		text = new Text( 'foobar', [ new Attribute( 'abc', 'xyz' ) ] );
		element = new Element( 'div', [], [ text ] );
		doc = new Document();
		root = doc.createRoot( 'root' );
		root.insertChildren( 0, element );
	} );

	beforeEach( () => {
		textFragment = new TextFragment( new Position( root, [ 0, 2 ] ), 'oba' );
	} );

	it( 'should have first property pointing to the first character node contained in TextFragment', () => {
		let char = textFragment.first;

		expect( char.getPath() ).to.deep.equal( [ 0, 2 ] );
		expect( char.character ).to.equal( 'o' );
	} );

	it( 'should have last property pointing to the last character node contained in TextFragment', () => {
		let char = textFragment.last;

		expect( char.getPath() ).to.deep.equal( [ 0, 4 ] );
		expect( char.character ).to.equal( 'a' );
	} );

	it( 'should have correct attributes property', () => {
		expect( textFragment.attrs.size ).to.equal( 1 );
		expect( textFragment.attrs.getValue( 'abc' ) ).to.equal( 'xyz' );
	} );

	it( 'should have text property', () => {
		expect( textFragment ).to.have.property( 'text' ).that.equals( 'oba' );
	} );

	it( 'getRange should return range containing all characters from TextFragment', () => {
		let range = textFragment.getRange();
	describe( 'attributes interface', () => {
		let attr2 = new Attribute( 'abc', 'xyz' );

		describe( 'hasAttribute', () => {
			it( 'should return true if text fragment has given attribute', () => {
				expect( textFragment.hasAttribute( attr ) ).to.be.true;
			} );

			it( 'should return false if text fragment does not have attribute', () => {
				expect( textFragment.hasAttribute( attr2 ) ).to.be.false;
			} );

			it( 'should return true if text fragment has attribute with given key', () => {
				expect( textFragment.hasAttribute( 'foo' ) ).to.be.true;
			} );

			it( 'should return false if text fragment does not have attribute with given key', () => {
				expect( textFragment.hasAttribute( 'abc' ) ).to.be.false;
			} );
		} );

		describe( 'getAttribute', () => {
			it( 'should return attribute with given key if text fragment has given attribute', () => {
				expect( textFragment.getAttribute( 'foo' ) ).to.equal( attr );
			} );

			it( 'should return null if text fragment does not have given attribute', () => {
				expect( textFragment.getAttribute( 'bar' ) ).to.be.undefined;
			} );
		} );

		describe( 'getAttributeValue', () => {
			it( 'should return attribute value for given key if text fragment has given attribute', () => {
				expect( textFragment.getAttributeValue( 'foo' ) ).to.equal( 'bar' );
			} );

			it( 'should return null if text fragment does not have given attribute', () => {
				expect( textFragment.getAttributeValue( 'bar' ) ).to.be.null;
			} );
		} );

		describe( 'getAttributes', () => {
			it( 'should return an iterator that iterates over all attributes set on the text fragment', () => {
				let it = textFragment.getAttributes();
				let attrs = [];

				let step = it.next();

				while ( !step.done ) {
					attrs.push( step.value );
					step = it.next();
				}

				expect( attrs ).to.deep.equal( [ attr ] );
			} );
		} );

		describe( 'setAttribute', () => {
			it( 'should set given attribute on the text fragment', () => {
				textFragment.setAttribute( new Attribute( 'abc', 'xyz' ) );

				expect( textFragment.getAttributeValue( 'abc' ) ).to.equal( 'xyz' );
			} );
		} );

		describe( 'removeAttribute', () => {
			it( 'should remove attribute set on the text fragment and return true', () => {
				let result = textFragment.removeAttribute( 'foo' );

				expect( textFragment.getAttributeValue( 'foo' ) ).to.be.null;
				expect( result ).to.be.true;
			} );

			it( 'should return false if text fragment does not have given attribute', () => {
				let result = textFragment.removeAttribute( 'abc' );

				expect( result ).to.be.false;
			} );
		} );
	} );
} );
