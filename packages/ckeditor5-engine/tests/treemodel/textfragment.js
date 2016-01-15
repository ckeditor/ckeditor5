/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel */

'use strict';

const modules = bender.amd.require(
	'core/treemodel/element',
	'core/treemodel/text',
	'core/treemodel/attribute',
	'core/treemodel/textfragment',
	'core/treemodel/position',
	'core/treemodel/document'
);

describe( 'TextFragment', () => {
	let Element, Text, Attribute, TextFragment, Position, Document;
	let doc, text, element, textFragment, root;

	before( () => {
		Element = modules[ 'core/treemodel/element' ];
		Text = modules[ 'core/treemodel/text' ];
		Attribute = modules[ 'core/treemodel/attribute' ];
		TextFragment = modules[ 'core/treemodel/textfragment' ];
		Position = modules[ 'core/treemodel/position' ];
		Document = modules[ 'core/treemodel/document' ];

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
