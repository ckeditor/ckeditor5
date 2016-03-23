/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treeview */

'use strict';

import ViewNode from '/ckeditor5/engine/treeview/node.js';
import ViewText from '/ckeditor5/engine/treeview/text.js';

describe( 'Element', () => {
	describe( 'constructor', () => {
		it( 'should create element without attributes', () => {
			const text = new ViewText( 'foo' );

			expect( text ).to.be.an.instanceof( ViewNode );
			expect( text.data ).to.equal( 'foo' );
			expect( text ).to.have.property( 'parent' ).that.is.null;
		} );
	} );

	describe( 'clone', () => {
		it( 'should return new text with same data', () => {
			const text = new ViewText( 'foo bar' );
			const clone = text.clone();

			expect( clone ).to.not.equal( text );
			expect( clone.data ).to.equal( text.data );
		} );
	} );

	describe( 'isSimilar', () => {
		const text = new ViewText( 'foo' );

		it( 'should return false when comparing to non-text', () => {
			expect( text.isSimilar( null ) ).to.be.false;
			expect( text.isSimilar( {} ) ).to.be.false;
		} );

		it( 'should return true when the same text node is provided', () => {
			expect( text.isSimilar( text ) ).to.be.true;
		} );

		it( 'sould return true when data is the same', () => {
			const other = new ViewText( 'foo' );

			expect( text.isSimilar( other ) ).to.be.true;
		} );

		it( 'sould return false when data is not the same', () => {
			const other = text.clone();
			other.data = 'not-foo';

			expect( text.isSimilar( other ) ).to.be.false;
		} );
	} );

	describe( 'setText', () => {
		it( 'should change the text', () => {
			const text = new ViewText( 'foo' );
			text.data = 'bar';

			expect( text.data ).to.equal( 'bar' );
		} );
	} );
} );
