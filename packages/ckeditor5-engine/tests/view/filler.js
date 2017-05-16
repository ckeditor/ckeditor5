/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import {
	BR_FILLER,
	NBSP_FILLER,
	INLINE_FILLER_LENGTH,
	INLINE_FILLER,
	startsWithFiller,
	isInlineFiller,
	getDataWithoutFiller,
	isBlockFiller
} from '../../src/view/filler';

describe( 'filler', () => {
	describe( 'INLINE_FILLER', () => {
		it( 'should have length equal INLINE_FILLER_LENGTH', () => {
			expect( INLINE_FILLER.length ).to.equal( INLINE_FILLER_LENGTH );
		} );
	} );

	describe( 'startsWithFiller', () => {
		it( 'should be true for node which contains only filler', () => {
			const node = document.createTextNode( INLINE_FILLER );

			expect( startsWithFiller( node ) ).to.be.true;
		} );

		it( 'should be true for node which starts with filler', () => {
			const node = document.createTextNode( INLINE_FILLER + 'foo' );

			expect( startsWithFiller( node ) ).to.be.true;
		} );

		it( 'should be false for element', () => {
			const node = document.createElement( 'p' );

			expect( startsWithFiller( node ) ).to.be.false;
		} );

		it( 'should be false which contains filler in the middle', () => {
			const node = document.createTextNode( 'x' + INLINE_FILLER + 'x' );

			expect( startsWithFiller( node ) ).to.be.false;
		} );

		it( 'should be false for the node which does not contains filler', () => {
			const node = document.createTextNode( 'foo' );

			expect( startsWithFiller( node ) ).to.be.false;
		} );

		it( 'should be false for the node which does not contains filler, even if it has the same length', () => {
			let text = '';

			for ( let i = 0; i < INLINE_FILLER_LENGTH; i++ ) {
				text += 'x';
			}

			const node = document.createTextNode( text );

			expect( startsWithFiller( node ) ).to.be.false;
		} );
	} );

	describe( 'getDataWithoutFiller', () => {
		it( 'should return data without filler', () => {
			const node = document.createTextNode( INLINE_FILLER + 'foo' );

			const dataWithoutFiller = getDataWithoutFiller( node );

			expect( dataWithoutFiller.length ).to.equals( 3 );
			expect( dataWithoutFiller ).to.equals( 'foo' );
		} );

		it( 'should return the same data for data without filler', () => {
			const node = document.createTextNode( 'foo' );

			const dataWithoutFiller = getDataWithoutFiller( node );

			expect( dataWithoutFiller.length ).to.equals( 3 );
			expect( dataWithoutFiller ).to.equals( 'foo' );
		} );
	} );

	describe( 'isInlineFiller', () => {
		it( 'should be true for inline filler', () => {
			const node = document.createTextNode( INLINE_FILLER );

			expect( isInlineFiller( node ) ).to.be.true;
		} );

		it( 'should be false for element which starts with filler', () => {
			const node = document.createTextNode( INLINE_FILLER + 'foo' );

			expect( isInlineFiller( node ) ).to.be.false;
		} );

		it( 'should be false for the node which does not contains filler, even if it has the same length', () => {
			let text = '';

			for ( let i = 0; i < INLINE_FILLER_LENGTH; i++ ) {
				text += 'x';
			}

			const node = document.createTextNode( text );

			expect( isInlineFiller( node ) ).to.be.false;
		} );
	} );

	describe( 'isBlockFiller', () => {
		it( 'should return true if the node is an instance of the BR block filler', () => {
			const brFillerInstance = BR_FILLER( document ); // eslint-disable-line new-cap

			expect( isBlockFiller( brFillerInstance, BR_FILLER ) ).to.be.true;
			// Check it twice to ensure that caching breaks nothing.
			expect( isBlockFiller( brFillerInstance, BR_FILLER ) ).to.be.true;
		} );

		it( 'should return true if the node is an instance of the NBSP block filler', () => {
			const nbspFillerInstance = NBSP_FILLER( document ); // eslint-disable-line new-cap

			expect( isBlockFiller( nbspFillerInstance, NBSP_FILLER ) ).to.be.true;
			// Check it twice to ensure that caching breaks nothing.
			expect( isBlockFiller( nbspFillerInstance, NBSP_FILLER ) ).to.be.true;
		} );

		it( 'should return false for inline filler', () => {
			expect( isBlockFiller( document.createTextNode( INLINE_FILLER ), BR_FILLER ) ).to.be.false;
			expect( isBlockFiller( document.createTextNode( INLINE_FILLER ), NBSP_FILLER ) ).to.be.false;
		} );
	} );
} );
