/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel */

'use strict';

import Node from '/ckeditor5/core/treemodel/node.js';
import Element from '/ckeditor5/core/treemodel/element.js';
import Text from '/ckeditor5/core/treemodel/text.js';
import Attribute from '/ckeditor5/core/treemodel/attribute.js';

describe( 'CharacterProxy', () => {
	let text, element, char;

	before( () => {
		text = new Text( 'abc', [ new Attribute( 'foo', true ) ] );
		element = new Element( 'div', [], [ new Element( 'p' ), text, new Element( 'p' ) ] );
	} );

	beforeEach( () => {
		char = element.getChild( 2 );
	} );

	it( 'should extend Node class', () => {
		expect( char ).to.be.instanceof( Node );
	} );

	it( 'should have correct character property', () => {
		expect( char ).to.have.property( 'character' ).that.equals( 'b' );
	} );

	it( 'should have correct parent property', () => {
		expect( char ).to.have.property( 'parent' ).that.equals( element );
	} );

	it( 'should have attributes list equal to passed to Text instance', () => {
		expect( char.attrs.isEqual( text.attrs ) ).to.be.true;
	} );

	it( 'should return correct index in parent node', () => {
		expect( char.getIndex() ).to.equal( 2 );
	} );
} );
