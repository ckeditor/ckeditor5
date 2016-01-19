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

		expect( range.root ).to.equal( root );
		expect( range.start.path ).to.deep.equal( [ 0, 2 ] );
		expect( range.end.path ).to.deep.equal( [ 0, 5 ] );
	} );
} );
