/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treeview */

'use strict';

import AttributeElement from '/ckeditor5/engine/treeview/attributeelement.js';
import Element from '/ckeditor5/engine/treeview/element.js';
import { parse } from '/tests/engine/_utils/view.js';

describe( 'AttributeElement', () => {
	describe( 'constructor', () => {
		it( 'should create element with default priority', () => {
			const el = new AttributeElement( 'strong' );

			expect( el ).to.be.an.instanceof( AttributeElement );
			expect( el ).to.be.an.instanceof( Element );
			expect( el ).to.have.property( 'name' ).that.equals( 'strong' );
			expect( el ).to.have.property( 'priority' ).that.equals( AttributeElement.DEFAULT_PRIORITY );
		} );
	} );

	describe( 'clone', () => {
		it( 'should clone element with priority', () => {
			const el = new AttributeElement( 'b' );
			el.priority = 7;

			const clone = el.clone();

			expect( clone ).to.not.equal( el );
			expect( clone.name ).to.equal( el.name );
			expect( clone.priority ).to.equal( el.priority );
		} );
	} );

	describe( 'isSimilar', () => {
		it( 'should return true if priorities are the same', () => {
			const b1 = new AttributeElement( 'b' );
			b1.priority = 7;

			const b2 = new AttributeElement( 'b' );
			b2.priority = 7;

			expect( b1.isSimilar( b2 ) ).to.be.true;
		} );

		it( 'should return false if priorities are different', () => {
			const b1 = new AttributeElement( 'b' );
			b1.priority = 7;

			const b2 = new AttributeElement( 'b' ); // default priority

			expect( b1.isSimilar( b2 ) ).to.be.false;
		} );
	} );

	describe( 'getFillerOffset', () => {
		it( 'should return position 0 if it is the only element in the container', () => {
			const { selection } = parse( '<container:p><attribute:b>[]</attribute:b></container:p>' );
			const attribute = selection.getFirstPosition().parent;

			expect( attribute.getFillerOffset() ).to.equals( 0 );
		} );

		it( 'should return position 0 if it is the only nested element in the container', () => {
			const { selection } = parse(
				'<container:p><attribute:b><attribute:i>[]</attribute:i></attribute:b></container:p>' );
			const attribute = selection.getFirstPosition().parent;

			expect( attribute.getFillerOffset() ).to.equals( 0 );
		} );

		it( 'should return null if element contains another element', () => {
			const attribute = parse( '<attribute:b><attribute:i></attribute:i></attribute:b>' );

			expect( attribute.getFillerOffset() ).to.be.null;
		} );

		it( 'should return null if element contains text', () => {
			const attribute = parse( '<attribute:b>text</attribute:b>' );

			expect( attribute.getFillerOffset() ).to.be.null;
		} );

		it( 'should return null if container element contains text', () => {
			const { selection } = parse( '<container:p><attribute:b>[]</attribute:b>foo</container:p>' );
			const attribute = selection.getFirstPosition().parent;

			expect( attribute.getFillerOffset() ).to.be.null;
		} );

		it( 'should return null if it is the parent contains text', () => {
			const { selection } = parse(
				'<container:p><attribute:b><attribute:i>[]</attribute:i>foo</attribute:b></container:p>' );
			const attribute = selection.getFirstPosition().parent;

			expect( attribute.getFillerOffset() ).to.be.null;
		} );
	} );
} );
