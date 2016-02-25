/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treeview */

'use strict';

import Writer from '/ckeditor5/core/treeview/writer.js';
import Element from '/ckeditor5/core/treeview/element.js';
import Text from '/ckeditor5/core/treeview/text.js';
import Position from '/ckeditor5/core/treeview/position.js';

describe( 'Writer', () => {
	describe( 'isContainer', () => {
		it( 'should return true for container elements', () => {
			const containerElement = new Element( 'p' );
			const attributeElement = new Element( 'b' );
			const writer = new Writer();

			writer._priorities.set( attributeElement, 1 );

			expect( writer.isContainer( containerElement ) ).to.be.true;
			expect( writer.isContainer( attributeElement ) ).to.be.false;
		} );
	} );

	describe( 'isAttribute', () => {
		it( 'should return true for container elements', () => {
			const containerElement = new Element( 'p' );
			const attributeElement = new Element( 'b' );
			const writer = new Writer();

			writer._priorities.set( attributeElement, 1 );

			expect( writer.isAttribute( containerElement ) ).to.be.false;
			expect( writer.isAttribute( attributeElement ) ).to.be.true;
		} );
	} );

	describe( 'setPriority', () => {
		it( 'sets node priority', () => {
			const writer = new Writer();
			const nodeMock = {};
			writer.setPriority( nodeMock, 10 );

			expect( writer._priorities.get( nodeMock ) ).to.equal( 10 );
		} );
	} );

	describe( 'getPriority', () => {
		it( 'gets node priority', () => {
			const writer = new Writer();
			const nodeMock = {};
			writer._priorities.set( nodeMock, 12 );

			expect( writer.getPriority( nodeMock ) ).to.equal( 12 );
		} );
	} );

	describe( 'breakAttributes', () => {
		// Start position is at the begin of the text node.
		// After breaking it should be at the begin of the 'p' element.
		it( '<p>|foobar</p>', () => {
			const writer = new Writer();
			const text = new Text( 'foobar' );
			const element = new Element( 'p', {}, [ text ] );
			const position = new Position( text, 0 );

			const newPosition = writer.breakAttributes( position );
			const newParent = newPosition.parent;

			expect( newPosition.offset ).to.equal( 0 );
			expect( newParent ).to.equal( element );
			expect( newParent.getChildCount() ).to.equal( 1 );
			expect( newParent.getChild( 0 ) ).to.equal( text );
		} );

		// Start position is located in the middle of text node.
		// After breaking it should be located inside 'p' element, between two text nodes 'foo' and 'bar'.
		it( '<p>foo|bar</p>', () => {
			const writer = new Writer();
			const text = new Text( 'foobar' );
			const element = new Element( 'p', {}, [ text ] );
			const position = new Position( text, 3 );

			const newPosition = writer.breakAttributes( position );
			const newParent = newPosition.parent;

			expect( newPosition.offset ).to.equal( 1 );
			expect( newParent ).to.equal( element );
			expect( newParent.getChildCount() ).to.equal( 2 );
			expect( newParent.getChild( 0 ) ).to.be.instanceOf( Text );
			expect( newParent.getChild( 1 ) ).to.be.instanceOf( Text );
			expect( newParent.getChild( 0 ).data ).to.equal( 'foo' );
			expect( newParent.getChild( 1 ).data ).to.equal( 'bar' );
		} );

		// Start position is at the end of the text node.
		// After breaking it should be at the end of the 'p' element.
		it( '<p>foobar|</p>', () => {
			const writer = new Writer();
			const text = new Text( 'foobar' );
			const element = new Element( 'p', {}, [ text ] );
			const position = new Position( text, 6 );

			const newPosition = writer.breakAttributes( position );
			const newParent = newPosition.parent;

			expect( newPosition.offset ).to.equal( 1 );
			expect( newParent ).to.equal( element );
			expect( newParent.getChildCount() ).to.equal( 1 );
			expect( newParent.getChild( 0 ) ).to.equal( text );
		} );

		// <p><b>foo|bar</b></p> -> <p><b>foo</b>|<b>bar</b></p>
		it( '<p><b>foo|bar</b></p>', () => {
			const writer = new Writer();
			const text = new Text( 'foobar' );
			const b = new Element( 'b', {}, [ text ] );
			const p = new Element( 'p', {}, [ b ] );
			const position = new Position( text, 3 );
			writer.setPriority( b, 1 );

			const newPosition = writer.breakAttributes( position );
			const parent = newPosition.parent;

			expect( parent ).to.equal( p );
			expect( newPosition.offset ).to.equal( 1 );
			expect( p.getChildCount() ).to.equal( 2 );
			const child1 = p.getChild( 0 );
			const child2 = p.getChild( 1 );
			expect( child1 ).to.be.instanceOf( Element );
			expect( child1.name ).to.equal( 'b' );
			expect( child1.getChildCount() ).to.equal( 1 );
			expect( child1.getChild( 0 ).data ).to.equal( 'foo' );
			expect( child2 ).to.be.instanceOf( Element );
			expect( child2.name ).to.equal( 'b' );
			expect( child2.getChildCount() ).to.equal( 1 );
			expect( child2.getChild( 0 ).data ).to.equal( 'bar' );
		} );

		// <p><b><u>|foobar</u></b></p> -> <p>|<b><u>foobar</u></b></p>
		it( '<p><b><u>|foobar</u></b></p>', () => {
			const writer = new Writer();
			const text = new Text( 'foobar' );
			const u = new Element( 'u', {}, [ text ] );
			const b = new Element( 'b', {}, [ u ] );
			const p = new Element( 'p', {}, [ b ] );
			const position = new Position( text, 0 );
			writer.setPriority( u, 1 );
			writer.setPriority( b, 1 );

			const newPosition = writer.breakAttributes( position );
			const parent = newPosition.parent;

			expect( parent ).to.equal( p );
			expect( newPosition.offset ).to.equal( 0 );
			expect( p.getChildCount() ).to.equal( 1 );
			const b1 = p.getChild( 0 );
			expect( b1 ).to.equal( b );
			expect( b1.getChildCount() ).to.equal( 1 );
			const u1 = b.getChild( 0 );
			expect( u1 ).to.equal( u );
			expect( u1.getChildCount() ).to.equal( 1 );
			const text1 = u1.getChild( 0 );
			expect( text1 ).to.equal( text );
			expect( text1.data ).to.equal( 'foobar' );
		} );

		// <p><b><u>foo|bar</u></b></p> -> <p><b><u>foo</u></b>|<b></u>bar</u></b></p>
		it( '<p><b><u>foo|bar</u></b></p>', () => {
			const writer = new Writer();
			const text = new Text( 'foobar' );
			const u = new Element( 'u', {}, [ text ] );
			const b = new Element( 'b', {}, [ u ] );
			const p = new Element( 'p', {}, [ b ] );
			const position = new Position( text, 3 );
			writer.setPriority( u, 1 );
			writer.setPriority( b, 1 );

			const newPosition = writer.breakAttributes( position );
			const parent = newPosition.parent;

			expect( parent ).to.equal( p );
			expect( newPosition.offset ).to.equal( 1 );
			expect( parent.getChildCount() ).to.equal( 2 );
			const child1 = parent.getChild( 0 );
			const child2 = parent.getChild( 1 );
			expect( child1.name ).to.equal( 'b' );
			expect( child1.name ).to.equal( 'b' );
			expect( child1.getChildCount() ).to.equal( 1 );
			expect( child2.getChildCount() ).to.equal( 1 );

			const u1 = child1.getChild( 0 );
			const u2 = child2.getChild( 0 );

			expect( u1.name ).to.equal( 'u' );
			expect( u2.name ).to.equal( 'u' );

			expect( u1.getChildCount() ).to.equal( 1 );
			expect( u2.getChildCount() ).to.equal( 1 );

			expect( u1.getChild( 0 ).data ).to.equal( 'foo' );
			expect( u2.getChild( 0 ).data ).to.equal( 'bar' );
		} );

		// <p><b><u>foobar|</u></b></p> -> <p><b><u>foobar</u></b>|</p>
		it( '<p><b><u>|foobar</u></b></p>', () => {
			const writer = new Writer();
			const text = new Text( 'foobar' );
			const u = new Element( 'u', {}, [ text ] );
			const b = new Element( 'b', {}, [ u ] );
			const p = new Element( 'p', {}, [ b ] );
			const position = new Position( text, 6 );
			writer.setPriority( u, 1 );
			writer.setPriority( b, 1 );

			const newPosition = writer.breakAttributes( position );
			const parent = newPosition.parent;

			expect( parent ).to.equal( p );
			expect( newPosition.offset ).to.equal( 1 );
			expect( p.getChildCount() ).to.equal( 1 );
			const b1 = p.getChild( 0 );
			expect( b1 ).to.equal( b );
			expect( b1.getChildCount() ).to.equal( 1 );
			const u1 = b.getChild( 0 );
			expect( u1 ).to.equal( u );
			expect( u1.getChildCount() ).to.equal( 1 );
			const text1 = u1.getChild( 0 );
			expect( text1 ).to.equal( text );
			expect( text1.data ).to.equal( 'foobar' );
		} );
	} );
} );
