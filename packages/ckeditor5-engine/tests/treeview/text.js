/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treeview */

'use strict';

import ViewNode from '/ckeditor5/core/treeview/node.js';
import ViewText from '/ckeditor5/core/treeview/text.js';

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

	describe( 'setText', () => {
		it( 'should change the text', () => {
			const text = new ViewText( 'foo' );
			text.data = 'bar';

			expect( text.data ).to.equal( 'bar' );
		} );
	} );
} );
