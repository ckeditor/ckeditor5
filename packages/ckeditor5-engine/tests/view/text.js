/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Node from '../../src/view/node';
import Text from '../../src/view/text';

describe( 'Text', () => {
	describe( 'constructor()', () => {
		it( 'should create element without attributes', () => {
			const text = new Text( 'foo' );

			expect( text ).to.be.an.instanceof( Node );
			expect( text.data ).to.equal( 'foo' );
			expect( text ).to.have.property( 'parent' ).that.is.null;
		} );
	} );

	describe( 'is', () => {
		let text;

		before( () => {
			text = new Text( 'foo' );
		} );

		it( 'should return true for text', () => {
			expect( text.is( 'text' ) ).to.be.true;
		} );

		it( 'should return false for other accept values', () => {
			expect( text.is( 'textProxy' ) ).to.be.false;
			expect( text.is( 'element' ) ).to.be.false;
			expect( text.is( 'containerElement' ) ).to.be.false;
			expect( text.is( 'attributeElement' ) ).to.be.false;
			expect( text.is( 'uiElement' ) ).to.be.false;
			expect( text.is( 'emptyElement' ) ).to.be.false;
			expect( text.is( 'rootElement' ) ).to.be.false;
			expect( text.is( 'documentFragment' ) ).to.be.false;
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
