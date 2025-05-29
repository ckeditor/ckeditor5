/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	INLINE_FILLER_LENGTH,
	INLINE_FILLER,
	startsWithFiller,
	isInlineFiller,
	getDataWithoutFiller,
	MARKED_NBSP_FILLER
} from '../../src/view/filler.js';

describe( 'filler', () => {
	describe( 'INLINE_FILLER', () => {
		it( 'should have length equal INLINE_FILLER_LENGTH', () => {
			expect( INLINE_FILLER.length ).to.equal( INLINE_FILLER_LENGTH );
		} );
	} );

	describe( 'startsWithFiller()', () => {
		it( 'should be true for node which contains only filler', () => {
			const node = document.createTextNode( INLINE_FILLER );

			expect( startsWithFiller( node ) ).to.be.true;
		} );

		it( 'should be true for node which starts with filler', () => {
			const node = document.createTextNode( INLINE_FILLER + 'foo' );

			expect( startsWithFiller( node ) ).to.be.true;
		} );

		it( 'should be true for text which contains only filler', () => {
			const str = `${ INLINE_FILLER }`;

			expect( startsWithFiller( str ) ).to.be.true;
		} );

		it( 'should be true for text which starts with filler', () => {
			const str = `${ INLINE_FILLER }foo`;

			expect( startsWithFiller( str ) ).to.be.true;
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

	describe( 'getDataWithoutFiller()', () => {
		it( 'should return data without filler', () => {
			const node = document.createTextNode( INLINE_FILLER + 'foo' );

			const dataWithoutFiller = getDataWithoutFiller( node );

			expect( dataWithoutFiller.length ).to.equals( 3 );
			expect( dataWithoutFiller ).to.equals( 'foo' );
		} );

		it( 'should return text without filler', () => {
			const str = `${ INLINE_FILLER }foo`;

			const dataWithoutFiller = getDataWithoutFiller( str );

			expect( dataWithoutFiller.length ).to.equals( 3 );
			expect( dataWithoutFiller ).to.equals( 'foo' );
		} );

		it( 'should return the same data for data without filler', () => {
			const node = document.createTextNode( 'foo' );

			const dataWithoutFiller = getDataWithoutFiller( node );

			expect( dataWithoutFiller.length ).to.equals( 3 );
			expect( dataWithoutFiller ).to.equals( 'foo' );
		} );

		it( 'should return the same data for text without filler', () => {
			const node = 'foo';

			const dataWithoutFiller = getDataWithoutFiller( node );

			expect( dataWithoutFiller.length ).to.equals( 3 );
			expect( dataWithoutFiller ).to.equals( 'foo' );
		} );
	} );

	describe( 'isInlineFiller()', () => {
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

		it( 'should be true for inline filler from inside iframe', () => {
			const iframe = document.createElement( 'iframe' );
			document.body.appendChild( iframe );
			const node = iframe.contentDocument.createTextNode( INLINE_FILLER );

			expect( isInlineFiller( node ) ).to.be.true;

			document.body.removeChild( iframe );
		} );
	} );

	describe( 'MARKED_NBSP_FILLER', () => {
		afterEach( () => {
			sinon.restore();
		} );

		it( 'should return node with correct HTML', () => {
			const node = MARKED_NBSP_FILLER( document ); // eslint-disable-line new-cap

			expect( node.outerHTML ).to.equal( '<span data-cke-filler="true">&nbsp;</span>' );
		} );

		it( 'should use innerText setter instead of innerHTML', () => {
			const el = document.createElement( 'span' );
			const innerHTMLSpy = sinon.spy( el, 'innerHTML', [ 'set' ] );
			const innerTextSpy = sinon.spy( el, 'innerText', [ 'set' ] );
			const createElementStub = sinon.stub( document, 'createElement' );
			createElementStub.withArgs( 'span' ).returns( el );

			MARKED_NBSP_FILLER( document ); // eslint-disable-line new-cap

			sinon.assert.calledOnce( createElementStub );
			sinon.assert.notCalled( innerHTMLSpy.set );
			sinon.assert.calledOnce( innerTextSpy.set );
		} );
	} );
} );
