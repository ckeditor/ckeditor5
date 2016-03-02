/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel */

'use strict';

import Element from '/ckeditor5/core/treemodel/element.js';
import Text from '/ckeditor5/core/treemodel/text.js';
import TextFragment from '/ckeditor5/core/treemodel/textfragment.js';
import Document from '/ckeditor5/core/treemodel/document.js';
import CharacterProxy from '/ckeditor5/core/treemodel/characterproxy.js';

describe( 'TextFragment', () => {
	let doc, text, element, textFragment, root;

	before( () => {
		doc = new Document();
		root = doc.createRoot( 'root' );
		element = new Element( 'div' );
		root.insertChildren( 0, element );
	} );

	beforeEach( () => {
		text = new Text( 'foobar', { foo: 'bar' } );
		element.insertChildren( 0, text );
		textFragment = new TextFragment( element.getChild( 2 ), 3 );
	} );

	afterEach( () => {
		element.removeChildren( 0, 1 );
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

	it( 'should have text property', () => {
		expect( textFragment ).to.have.property( 'text' ).that.equals( 'oba' );
	} );

	describe( 'getCharAt', () => {
		it( 'should return CharacterProxy element representing proper tree model character node', () => {
			let char = textFragment.getCharAt( 1 );

			expect( char ).to.be.instanceof( CharacterProxy );
			expect( char.character ).to.equal( 'b' );
			expect( char.getAttribute( 'foo' ) ).to.equal( 'bar' );
			expect( char.parent ).to.equal( element );
		} );

		it( 'should return null for wrong index', () => {
			expect( textFragment.getCharAt( -1 ) ).to.be.null;
			expect( textFragment.getCharAt( 4 ) ).to.be.null;
		} );
	} );

	describe( 'attributes interface', () => {
		describe( 'hasAttribute', () => {
			it( 'should return true if text fragment has attribute with given key', () => {
				expect( textFragment.hasAttribute( 'foo' ) ).to.be.true;
			} );

			it( 'should return false if text fragment does not have attribute with given key', () => {
				expect( textFragment.hasAttribute( 'abc' ) ).to.be.false;
			} );
		} );

		describe( 'getAttribute', () => {
			it( 'should return attribute with given key if text fragment has given attribute', () => {
				expect( textFragment.getAttribute( 'foo' ) ).to.equal( 'bar' );
			} );

			it( 'should return null if text fragment does not have given attribute', () => {
				expect( textFragment.getAttribute( 'bar' ) ).to.be.undefined;
			} );
		} );

		describe( 'getAttributes', () => {
			it( 'should return an iterator that iterates over all attributes set on the text fragment', () => {
				let attrs = Array.from( textFragment.getAttributes() );

				expect( attrs ).to.deep.equal( [ [ 'foo', 'bar' ] ] );
			} );
		} );
	} );
} );
