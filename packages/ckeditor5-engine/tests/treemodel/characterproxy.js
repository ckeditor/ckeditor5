/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel */

'use strict';

import Node from '/ckeditor5/engine/treemodel/node.js';
import Element from '/ckeditor5/engine/treemodel/element.js';
import Text from '/ckeditor5/engine/treemodel/text.js';
import mapsEqual from '/ckeditor5/utils/mapsequal.js';

describe( 'CharacterProxy', () => {
	let text, element, char;

	beforeEach( () => {
		text = new Text( 'abc', { foo: true } );
		element = new Element( 'div', [], [ new Element( 'p' ), text, new Element( 'p' ) ] );
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
		expect( mapsEqual( char._attrs, text._attrs ) ).to.be.true;
	} );

	it( 'should return correct index in parent node', () => {
		expect( char.getIndex() ).to.equal( 2 );
	} );

	describe( 'attributes interface', () => {
		describe( 'hasAttribute', () => {
			it( 'should return true if text fragment has attribute with given key', () => {
				expect( char.hasAttribute( 'foo' ) ).to.be.true;
			} );

			it( 'should return false if text fragment does not have attribute with given key', () => {
				expect( char.hasAttribute( 'abc' ) ).to.be.false;
			} );
		} );

		describe( 'getAttribute', () => {
			it( 'should return attribute with given key if text fragment has given attribute', () => {
				expect( char.getAttribute( 'foo' ) ).to.be.true;
			} );

			it( 'should return undefined if text fragment does not have given attribute', () => {
				expect( char.getAttribute( 'bar' ) ).to.be.undefined;
			} );
		} );

		describe( 'getAttributes', () => {
			it( 'should return an iterator that iterates over all attributes set on the text fragment', () => {
				let attrs = Array.from( char.getAttributes() );

				expect( attrs ).to.deep.equal( [ [ 'foo', true ] ] );
			} );
		} );

		describe( 'setAttribute', () => {
			it( 'should set attribute on given character', () => {
				char.setAttribute( 'abc', 'xyz' );

				expect( element.getChild( 0 ).getAttribute( 'abc' ) ).to.be.undefined;
				expect( element.getChild( 1 ).getAttribute( 'abc' ) ).to.be.undefined;
				expect( element.getChild( 2 ).getAttribute( 'abc' ) ).to.equal( 'xyz' );
				expect( element.getChild( 3 ).getAttribute( 'abc' ) ).to.be.undefined;
				expect( element.getChild( 4 ).getAttribute( 'abc' ) ).to.be.undefined;
			} );

			it( 'should remove attribute when passed attribute value is null', () => {
				char.setAttribute( 'foo', null );

				expect( element.getChild( 0 ).hasAttribute( 'foo' ) ).to.be.false;
				expect( element.getChild( 1 ).hasAttribute( 'foo' ) ).to.be.true;
				expect( element.getChild( 2 ).hasAttribute( 'foo' ) ).to.be.false;
				expect( element.getChild( 3 ).hasAttribute( 'foo' ) ).to.be.true;
				expect( element.getChild( 4 ).hasAttribute( 'foo' ) ).to.be.false;
			} );

			it( 'should correctly split and merge characters', () => {
				char.setAttribute( 'abc', 'xyz' );
				char.nextSibling.setAttribute( 'abc', 'xyz' );

				expect( element._children._nodes.length ).to.equal( 4 );
				expect( element._children._nodes[ 1 ].text ).to.equal( 'a' );
				expect( element._children._nodes[ 2 ].text ).to.equal( 'bc' );
			} );
		} );

		describe( 'setAttributesTo', () => {
			it( 'should remove all attributes from character and set given ones', () => {
				char.setAttributesTo( { abc: 'xyz' } );

				expect( element.getChild( 2 ).hasAttribute( 'foo' ) ).to.be.false;
				expect( element.getChild( 2 ).getAttribute( 'abc' ) ).to.equal( 'xyz' );
			} );
		} );

		describe( 'removeAttribute', () => {
			it( 'should remove given attribute from character', () => {
				char.removeAttribute( 'foo' );

				expect( element.getChild( 0 ).hasAttribute( 'foo' ) ).to.be.false;
				expect( element.getChild( 1 ).hasAttribute( 'foo' ) ).to.be.true;
				expect( element.getChild( 2 ).hasAttribute( 'foo' ) ).to.be.false;
				expect( element.getChild( 3 ).hasAttribute( 'foo' ) ).to.be.true;
				expect( element.getChild( 4 ).hasAttribute( 'foo' ) ).to.be.false;
			} );
		} );

		describe( 'clearAttributes', () => {
			it( 'should remove all attributes from text fragment', () => {
				char.setAttribute( 'abc', 'xyz' );
				char.clearAttributes();

				expect( element.getChild( 2 ).hasAttribute( 'foo' ) ).to.be.false;
				expect( element.getChild( 2 ).hasAttribute( 'abc' ) ).to.be.false;
			} );
		} );
	} );
} );
