/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel */

'use strict';

import Text from '/ckeditor5/core/treemodel/text.js';
import TextNode from '/ckeditor5/core/treemodel/textnode.js';
import Attribute from '/ckeditor5/core/treemodel/attribute.js';
import AttributeList from '/ckeditor5/core/treemodel/attributelist.js';

describe( 'Text', () => {
	describe( 'constructor', () => {
		it( 'should create character without attributes', () => {
			let attrs = [ new Attribute( 'bold', true ) ];
			let text = new Text( 'bar', attrs );

			expect( text ).to.have.property( 'text' ).that.equals( 'bar' );
			expect( text ).to.have.property( 'attrs' ).that.is.instanceof( AttributeList );
			expect( Array.from( text.attrs ) ).to.deep.equal( attrs );
		} );

		it( 'should create empty text object', () => {
			let empty1 = new Text();
			let empty2 = new Text( '' );

			expect( empty1.text ).to.equal( '' );
			expect( empty2.text ).to.equal( '' );
		} );
	} );

	describe( 'getTextNode', () => {
		let attrs, text;

		beforeEach( () => {
			attrs = [ new Attribute( 'bold', true ) ];
			text = new Text( 'bar', attrs );
		} );

		it( 'should return text node containing whole text object if no parameters are passed', () => {
			let textNode = text.getTextNode();

			expect( textNode ).to.be.instanceof( TextNode );
			expect( textNode.text ).to.equal( 'bar' );
			expect( textNode._start ).to.equal( 0 );
			expect( textNode._textItem ).to.equal( text );
		} );

		it( 'should return text node containing characters from start index to the end of text object if one parameter is passed', () => {
			let textNode = text.getTextNode( 1 );

			expect( textNode ).to.be.instanceof( TextNode );
			expect( textNode.text ).to.equal( 'ar' );
			expect( textNode._start ).to.equal( 1 );
			expect( textNode._textItem ).to.equal( text );
		} );

		it( 'should return text node containing given number of characters, starting from given index if two parameters are passed', () => {
			let textNode = text.getTextNode( 1, 1 );

			expect( textNode ).to.be.instanceof( TextNode );
			expect( textNode.text ).to.equal( 'a' );
			expect( textNode._start ).to.equal( 1 );
			expect( textNode._textItem ).to.equal( text );
		} );
	} );

	it( 'should create proper JSON string using toJSON method', () => {
		let text = new Text( 'bar' );
		let parsed = JSON.parse( JSON.stringify( text ) );

		expect( parsed.text ).to.equal( 'bar' );
		expect( parsed.parent ).to.equal( null );
	} );
} );
