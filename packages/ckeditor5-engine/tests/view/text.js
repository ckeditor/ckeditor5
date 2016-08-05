/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: view */

import Node from '/ckeditor5/engine/view/node.js';
import Text from '/ckeditor5/engine/view/text.js';

describe( 'Element', () => {
	describe( 'constructor', () => {
		it( 'should create element without attributes', () => {
			const text = new Text( 'foo' );

			expect( text ).to.be.an.instanceof( Node );
			expect( text.data ).to.equal( 'foo' );
			expect( text ).to.have.property( 'parent' ).that.is.null;
		} );
	} );

	describe( 'clone', () => {
		it( 'should return new text with same data', () => {
			const text = new Text( 'foo bar' );
			const clone = text.clone();

			expect( clone ).to.not.equal( text );
			expect( clone.data ).to.equal( text.data );
		} );
	} );

	describe( 'isSimilar', () => {
		const text = new Text( 'foo' );

		it( 'should return false when comparing to non-text', () => {
			expect( text.isSimilar( null ) ).to.be.false;
			expect( text.isSimilar( {} ) ).to.be.false;
		} );

		it( 'should return true when the same text node is provided', () => {
			expect( text.isSimilar( text ) ).to.be.true;
		} );

		it( 'should return true when data is the same', () => {
			const other = new Text( 'foo' );

			expect( text.isSimilar( other ) ).to.be.true;
		} );

		it( 'should return false when data is not the same', () => {
			const other = text.clone();
			other.data = 'not-foo';

			expect( text.isSimilar( other ) ).to.be.false;
		} );
	} );

	describe( 'setText', () => {
		it( 'should change the text', () => {
			const text = new Text( 'foo' );
			text.data = 'bar';

			expect( text.data ).to.equal( 'bar' );
		} );
	} );
} );
